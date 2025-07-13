import { EventEmitter } from 'events';

class P2PSupportService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.pendingConnections = new Map();
    this.cryptoKeys = new Map();
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];
  }

  // Generate encryption keys for a peer connection
  async generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
    return keyPair;
  }

  // Generate symmetric key for message encryption
  async generateSymmetricKey() {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt message with symmetric key
  async encryptMessage(message, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }

  // Decrypt message with symmetric key
  async decryptMessage(encryptedData, key) {
    const { encrypted, iv } = encryptedData;
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      new Uint8Array(encrypted)
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Create peer connection with encryption setup
  async createPeerConnection(peerId, isInitiator = false) {
    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    
    // Generate keys for this connection
    const keyPair = await this.generateKeyPair();
    const symmetricKey = await this.generateSymmetricKey();
    
    const connectionData = {
      peerConnection: pc,
      dataChannel: null,
      keyPair,
      symmetricKey,
      remotePublicKey: null,
      isInitiator,
      peerId,
      status: 'connecting'
    };
    
    this.connections.set(peerId, connectionData);
    
    // Set up ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('ice-candidate', {
          peerId,
          candidate: event.candidate
        });
      }
    };
    
    // Set up connection state monitoring
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      connectionData.status = state;
      this.emit('connection-state-change', { peerId, state });
      
      if (state === 'failed' || state === 'closed') {
        this.closeConnection(peerId);
      }
    };
    
    if (isInitiator) {
      // Create data channel for messaging
      const dataChannel = pc.createDataChannel('support-chat', {
        ordered: true
      });
      
      this.setupDataChannel(dataChannel, peerId);
      connectionData.dataChannel = dataChannel;
    } else {
      // Wait for data channel from initiator
      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        this.setupDataChannel(dataChannel, peerId);
        connectionData.dataChannel = dataChannel;
      };
    }
    
    return connectionData;
  }

  // Set up data channel event handlers
  setupDataChannel(dataChannel, peerId) {
    const connection = this.connections.get(peerId);
    
    dataChannel.onopen = () => {
      connection.status = 'connected';
      this.emit('peer-connected', { peerId });
      
      // Exchange public keys
      this.exchangePublicKeys(peerId);
    };
    
    dataChannel.onclose = () => {
      connection.status = 'disconnected';
      this.emit('peer-disconnected', { peerId });
    };
    
    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.emit('error', { peerId, error });
    };
    
    dataChannel.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'public-key') {
          // Store remote public key
          connection.remotePublicKey = await this.importPublicKey(message.key);
        } else if (message.type === 'encrypted-message') {
          // Decrypt and emit message
          const decrypted = await this.decryptMessage(
            message.data,
            connection.symmetricKey
          );
          
          this.emit('message', {
            peerId,
            message: decrypted,
            timestamp: message.timestamp
          });
        } else if (message.type === 'typing') {
          this.emit('peer-typing', { peerId, isTyping: message.isTyping });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
  }

  // Exchange public keys for secure communication
  async exchangePublicKeys(peerId) {
    const connection = this.connections.get(peerId);
    if (!connection) return;
    
    const publicKey = await window.crypto.subtle.exportKey(
      'spki',
      connection.keyPair.publicKey
    );
    
    const message = {
      type: 'public-key',
      key: Array.from(new Uint8Array(publicKey))
    };
    
    this.sendRawMessage(peerId, JSON.stringify(message));
  }

  // Import public key from peer
  async importPublicKey(keyData) {
    return await window.crypto.subtle.importKey(
      'spki',
      new Uint8Array(keyData),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );
  }

  // Send encrypted message to peer
  async sendMessage(peerId, message) {
    const connection = this.connections.get(peerId);
    if (!connection || !connection.dataChannel || 
        connection.dataChannel.readyState !== 'open') {
      throw new Error('Connection not ready');
    }
    
    const encryptedData = await this.encryptMessage(
      message,
      connection.symmetricKey
    );
    
    const payload = {
      type: 'encrypted-message',
      data: encryptedData,
      timestamp: Date.now()
    };
    
    this.sendRawMessage(peerId, JSON.stringify(payload));
  }

  // Send raw message through data channel
  sendRawMessage(peerId, message) {
    const connection = this.connections.get(peerId);
    if (connection && connection.dataChannel && 
        connection.dataChannel.readyState === 'open') {
      connection.dataChannel.send(message);
    }
  }

  // Send typing indicator
  sendTypingIndicator(peerId, isTyping) {
    const message = {
      type: 'typing',
      isTyping
    };
    this.sendRawMessage(peerId, JSON.stringify(message));
  }

  // Create offer for initiating connection
  async createOffer(peerId) {
    const connection = await this.createPeerConnection(peerId, true);
    const offer = await connection.peerConnection.createOffer();
    await connection.peerConnection.setLocalDescription(offer);
    
    return {
      type: 'offer',
      sdp: offer.sdp
    };
  }

  // Handle offer from peer
  async handleOffer(peerId, offer) {
    const connection = await this.createPeerConnection(peerId, false);
    
    await connection.peerConnection.setRemoteDescription(
      new RTCSessionDescription({ type: 'offer', sdp: offer.sdp })
    );
    
    const answer = await connection.peerConnection.createAnswer();
    await connection.peerConnection.setLocalDescription(answer);
    
    return {
      type: 'answer',
      sdp: answer.sdp
    };
  }

  // Handle answer from peer
  async handleAnswer(peerId, answer) {
    const connection = this.connections.get(peerId);
    if (!connection) return;
    
    await connection.peerConnection.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: answer.sdp })
    );
  }

  // Add ICE candidate
  async addIceCandidate(peerId, candidate) {
    const connection = this.connections.get(peerId);
    if (!connection) return;
    
    try {
      await connection.peerConnection.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Close connection with peer
  closeConnection(peerId) {
    const connection = this.connections.get(peerId);
    if (!connection) return;
    
    if (connection.dataChannel) {
      connection.dataChannel.close();
    }
    
    if (connection.peerConnection) {
      connection.peerConnection.close();
    }
    
    this.connections.delete(peerId);
    this.cryptoKeys.delete(peerId);
    
    this.emit('connection-closed', { peerId });
  }

  // Get connection status
  getConnectionStatus(peerId) {
    const connection = this.connections.get(peerId);
    return connection ? connection.status : 'disconnected';
  }

  // Get all active connections
  getActiveConnections() {
    const active = [];
    this.connections.forEach((connection, peerId) => {
      if (connection.status === 'connected') {
        active.push({
          peerId,
          status: connection.status
        });
      }
    });
    return active;
  }

  // Clean up all connections
  cleanup() {
    this.connections.forEach((connection, peerId) => {
      this.closeConnection(peerId);
    });
    this.removeAllListeners();
  }
}

export default new P2PSupportService();