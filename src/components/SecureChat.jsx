import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Send,
  Lock,
  MoreVert,
  Block,
  Report,
  ExitToApp,
  Psychology,
  Shield,
  CheckCircle,
  Circle
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import P2PSupportService from '../services/P2PSupportService';

const SecureChat = ({ peerId, onClose, onBlock, onReport }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up message and connection listeners
  useEffect(() => {
    const handleMessage = ({ peerId: msgPeerId, message, timestamp }) => {
      if (msgPeerId === peerId) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: message,
          sender: 'peer',
          timestamp: new Date(timestamp),
          encrypted: true
        }]);
      }
    };

    const handleTyping = ({ peerId: typingPeerId, isTyping }) => {
      if (typingPeerId === peerId) {
        setPeerTyping(isTyping);
      }
    };

    const handleConnectionChange = ({ peerId: connPeerId, state }) => {
      if (connPeerId === peerId) {
        setConnectionStatus(state);
      }
    };

    const handleError = ({ peerId: errorPeerId, error }) => {
      if (errorPeerId === peerId) {
        setError('Connection error occurred. Messages may not be delivered.');
      }
    };

    // Subscribe to events
    P2PSupportService.on('message', handleMessage);
    P2PSupportService.on('peer-typing', handleTyping);
    P2PSupportService.on('connection-state-change', handleConnectionChange);
    P2PSupportService.on('error', handleError);

    // Get initial connection status
    const status = P2PSupportService.getConnectionStatus(peerId);
    setConnectionStatus(status);

    return () => {
      P2PSupportService.off('message', handleMessage);
      P2PSupportService.off('peer-typing', handleTyping);
      P2PSupportService.off('connection-state-change', handleConnectionChange);
      P2PSupportService.off('error', handleError);
    };
  }, [peerId]);

  // Handle sending messages
  const handleSend = async () => {
    if (!inputMessage.trim() || connectionStatus !== 'connected') return;

    try {
      // Add message to local state immediately
      const newMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: 'self',
        timestamp: new Date(),
        encrypted: true,
        sending: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Send through P2P service
      await P2PSupportService.sendMessage(peerId, inputMessage);
      
      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, sending: false, sent: true }
            : msg
        )
      );
      
      setInputMessage('');
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.sending 
            ? { ...msg, sending: false, failed: true }
            : msg
        )
      );
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      P2PSupportService.sendTypingIndicator(peerId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      P2PSupportService.sendTypingIndicator(peerId, false);
    }, 1000);
  };

  // Handle menu actions
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleBlock = () => {
    handleMenuClose();
    if (onBlock) onBlock(peerId);
  };

  const handleReport = () => {
    handleMenuClose();
    if (onReport) onReport(peerId);
  };

  const handleLeave = () => {
    handleMenuClose();
    P2PSupportService.closeConnection(peerId);
    if (onClose) onClose();
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get connection status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return theme.palette.success.main;
      case 'connecting':
        return theme.palette.warning.main;
      case 'disconnected':
      case 'failed':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.dark }}>
            <Psychology />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Anonymous Partner
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                End-to-End Encrypted
              </Typography>
              <Circle sx={{ fontSize: 8, color: getStatusColor() }} />
              <Typography variant="caption">
                {connectionStatus}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <IconButton 
          color="inherit"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
        >
          <MoreVert />
        </IconButton>
      </Box>

      {/* Connection Alert */}
      {connectionStatus !== 'connected' && (
        <Alert 
          severity={connectionStatus === 'connecting' ? 'info' : 'warning'}
          sx={{ borderRadius: 0 }}
        >
          {connectionStatus === 'connecting' 
            ? 'Establishing secure connection...' 
            : 'Connection lost. Attempting to reconnect...'}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ borderRadius: 0 }}
        >
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        p: 2,
        backgroundColor: theme.palette.grey[50]
      }}>
        {messages.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            color: theme.palette.text.secondary
          }}>
            <Lock sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body2">
              Messages are end-to-end encrypted.
            </Typography>
            <Typography variant="body2">
              Start a conversation...
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'self' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: message.sender === 'self' 
                  ? theme.palette.primary.main 
                  : theme.palette.background.paper,
                color: message.sender === 'self' ? 'white' : 'text.primary',
                borderRadius: 2,
                position: 'relative'
              }}
            >
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                {message.text}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                opacity: 0.7
              }}>
                <Typography variant="caption">
                  {formatTime(message.timestamp)}
                </Typography>
                {message.encrypted && (
                  <Lock sx={{ fontSize: 12 }} />
                )}
                {message.sender === 'self' && (
                  <>
                    {message.sending && <CircularProgress size={12} color="inherit" />}
                    {message.sent && <CheckCircle sx={{ fontSize: 12 }} />}
                    {message.failed && (
                      <Tooltip title="Failed to send">
                        <Report sx={{ fontSize: 12, color: theme.palette.error.light }} />
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Box>
        ))}

        {/* Typing Indicator */}
        {peerTyping && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.text.secondary,
            mb: 1
          }}>
            <CircularProgress size={16} />
            <Typography variant="body2">
              Partner is typing...
            </Typography>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={connectionStatus !== 'connected'}
            size="small"
            multiline
            maxRows={3}
          />
          <IconButton 
            color="primary"
            onClick={handleSend}
            disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleBlock}>
          <ListItemIcon>
            <Block fontSize="small" />
          </ListItemIcon>
          <ListItemText>Block User</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleReport}>
          <ListItemIcon>
            <Report fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report Issue</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLeave}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Leave Chat</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default SecureChat;