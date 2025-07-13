import EventEmitter from 'events';

class WearableIntegration extends EventEmitter {
  constructor() {
    super();
    this.devices = new Map();
    this.activeDevice = null;
    this.dataStreams = new Map();
    this.healthKit = null;
    this.pollingIntervals = new Map();
  }

  async connect(deviceType) {
    try {
      switch (deviceType) {
        case 'apple-watch':
          return await this.connectAppleWatch();
        case 'fitbit':
          return await this.connectFitbit();
        case 'garmin':
          return await this.connectGarmin();
        case 'bluetooth-hrm':
          return await this.connectBluetoothHRM();
        default:
          throw new Error(`Unsupported device type: ${deviceType}`);
      }
    } catch (error) {
      console.error(`Failed to connect to ${deviceType}:`, error);
      this.emit('error', { deviceType, error });
      return false;
    }
  }

  async connectAppleWatch() {
    // Check if we're on an iOS device with HealthKit access
    if ('HealthKit' in window) {
      try {
        this.healthKit = window.HealthKit;
        
        // Request permissions for health data
        const permissions = {
          read: [
            'heartRate',
            'heartRateVariability',
            'restingHeartRate',
            'walkingHeartRateAverage',
            'sleepAnalysis',
            'mindfulSession',
            'respiratoryRate',
            'oxygenSaturation',
            'bodyTemperature',
            'electrocardiogram'
          ]
        };

        const authorized = await this.healthKit.requestAuthorization(permissions);
        
        if (authorized) {
          this.activeDevice = {
            type: 'apple-watch',
            name: 'Apple Watch',
            capabilities: ['heart-rate', 'hrv', 'sleep', 'mindfulness', 'ecg']
          };

          // Start polling for data
          this.startAppleWatchPolling();
          
          this.emit('connected', this.activeDevice);
          return true;
        }
      } catch (error) {
        console.error('HealthKit authorization failed:', error);
      }
    }

    // Fallback to using Web API if available
    return this.connectViaWebAPI('apple-watch');
  }

  async connectFitbit() {
    // Fitbit OAuth2 flow
    const clientId = process.env.REACT_APP_FITBIT_CLIENT_ID;
    const redirectUri = window.location.origin + '/fitbit-callback';
    
    if (!clientId) {
      console.error('Fitbit client ID not configured');
      return false;
    }

    // Check if we have a stored access token
    const storedToken = localStorage.getItem('fitbit_access_token');
    if (storedToken) {
      try {
        const tokenData = JSON.parse(storedToken);
        if (new Date(tokenData.expires_at) > new Date()) {
          this.setupFitbitConnection(tokenData.access_token);
          return true;
        }
      } catch (error) {
        console.error('Invalid stored token:', error);
      }
    }

    // Initiate OAuth flow
    const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
      `response_type=token&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=heartrate%20sleep%20activity%20profile&` +
      `expires_in=86400`;

    // Open auth window
    const authWindow = window.open(authUrl, 'fitbit-auth', 'width=500,height=700');
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        try {
          if (authWindow.closed) {
            clearInterval(checkInterval);
            const token = localStorage.getItem('fitbit_access_token');
            if (token) {
              this.setupFitbitConnection(JSON.parse(token).access_token);
              resolve(true);
            } else {
              resolve(false);
            }
          }
        } catch (error) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 1000);
    });
  }

  setupFitbitConnection(accessToken) {
    this.activeDevice = {
      type: 'fitbit',
      name: 'Fitbit',
      capabilities: ['heart-rate', 'sleep', 'activity', 'spo2'],
      accessToken
    };

    // Start polling for Fitbit data
    this.startFitbitPolling();
    
    this.emit('connected', this.activeDevice);
  }

  async connectGarmin() {
    // Garmin Connect IQ integration
    if ('ConnectIQ' in window) {
      try {
        const garmin = window.ConnectIQ;
        
        // Initialize Garmin Connect IQ
        await garmin.initialize({
          appId: process.env.REACT_APP_GARMIN_APP_ID,
          appVersion: '1.0.0'
        });

        // Find compatible devices
        const devices = await garmin.getDevices();
        
        if (devices.length > 0) {
          const device = devices[0]; // Use first available device
          
          this.activeDevice = {
            type: 'garmin',
            name: `Garmin ${device.model}`,
            capabilities: ['heart-rate', 'hrv', 'stress', 'body-battery', 'pulse-ox'],
            device
          };

          // Subscribe to data streams
          this.subscribeToGarminData();
          
          this.emit('connected', this.activeDevice);
          return true;
        }
      } catch (error) {
        console.error('Garmin Connect IQ error:', error);
      }
    }

    return false;
  }

  async connectBluetoothHRM() {
    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { namePrefix: 'Polar' },
          { namePrefix: 'Wahoo' }
        ],
        optionalServices: [
          'battery_service',
          'device_information',
          'cycling_power',
          'cycling_speed_and_cadence'
        ]
      });

      // Connect to GATT server
      const server = await device.gatt.connect();
      
      // Get heart rate service
      const hrService = await server.getPrimaryService('heart_rate');
      const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');
      
      // Get body sensor location
      let sensorLocation = 'Unknown';
      try {
        const bodySensorChar = await hrService.getCharacteristic('body_sensor_location');
        const locationValue = await bodySensorChar.readValue();
        const locations = ['Other', 'Chest', 'Wrist', 'Finger', 'Hand', 'Ear Lobe', 'Foot'];
        sensorLocation = locations[locationValue.getUint8(0)] || 'Unknown';
      } catch (error) {
        console.log('Body sensor location not available');
      }

      this.activeDevice = {
        type: 'bluetooth-hrm',
        name: device.name || 'Bluetooth HRM',
        capabilities: ['heart-rate'],
        device,
        server,
        sensorLocation
      };

      // Start notifications
      await hrCharacteristic.startNotifications();
      hrCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        this.handleBluetoothHRData(event.target.value);
      });

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        this.emit('disconnected', this.activeDevice);
        this.activeDevice = null;
      });

      this.emit('connected', this.activeDevice);
      return true;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      return false;
    }
  }

  async connectViaWebAPI(deviceType) {
    // Generic Web API connection for devices that support it
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service']
      });

      const server = await device.gatt.connect();
      
      this.activeDevice = {
        type: deviceType,
        name: device.name,
        capabilities: [],
        device,
        server
      };

      // Discover available services
      const services = await server.getPrimaryServices();
      for (const service of services) {
        const uuid = service.uuid;
        if (uuid === 'heart_rate') {
          this.activeDevice.capabilities.push('heart-rate');
          await this.setupHeartRateNotifications(service);
        }
      }

      this.emit('connected', this.activeDevice);
      return true;
    } catch (error) {
      console.error('Web API connection error:', error);
      return false;
    }
  }

  // Data collection methods
  startAppleWatchPolling() {
    const pollInterval = setInterval(async () => {
      if (!this.healthKit || !this.activeDevice) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const now = new Date();
        const oneMinuteAgo = new Date(now - 60000);

        // Get heart rate data
        const heartRateData = await this.healthKit.querySampleType({
          sampleType: 'heartRate',
          startDate: oneMinuteAgo,
          endDate: now,
          limit: 10
        });

        // Get HRV data
        const hrvData = await this.healthKit.querySampleType({
          sampleType: 'heartRateVariability',
          startDate: oneMinuteAgo,
          endDate: now,
          limit: 10
        });

        // Process and emit data
        if (heartRateData.length > 0 || hrvData.length > 0) {
          const latestHR = heartRateData[heartRateData.length - 1];
          const latestHRV = hrvData[hrvData.length - 1];

          const data = {
            timestamp: Date.now(),
            heartRate: latestHR?.value || null,
            hrv: latestHRV?.value || null,
            source: 'apple-watch'
          };

          this.emit('data', this.normalizeData(data));
        }

        // Get sleep data (less frequent)
        if (Date.now() % 300000 < 5000) { // Every 5 minutes
          const sleepData = await this.healthKit.queryCategoryType({
            sampleType: 'sleepAnalysis',
            startDate: new Date(now - 86400000), // Last 24 hours
            endDate: now
          });

          if (sleepData.length > 0) {
            this.processSleepData(sleepData);
          }
        }
      } catch (error) {
        console.error('Apple Watch polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    this.pollingIntervals.set('apple-watch', pollInterval);
  }

  startFitbitPolling() {
    const pollInterval = setInterval(async () => {
      if (!this.activeDevice || this.activeDevice.type !== 'fitbit') {
        clearInterval(pollInterval);
        return;
      }

      try {
        const token = this.activeDevice.accessToken;
        const today = new Date().toISOString().split('T')[0];

        // Get heart rate data
        const hrResponse = await fetch(
          `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d/1min.json`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (hrResponse.ok) {
          const hrData = await hrResponse.json();
          const latestHR = hrData['activities-heart-intraday']?.dataset?.slice(-1)[0];

          if (latestHR) {
            const data = {
              timestamp: Date.now(),
              heartRate: latestHR.value,
              source: 'fitbit'
            };

            // Get HRV if available
            try {
              const hrvResponse = await fetch(
                `https://api.fitbit.com/1/user/-/hrv/date/${today}.json`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );

              if (hrvResponse.ok) {
                const hrvData = await hrvResponse.json();
                data.hrv = hrvData.hrv?.[0]?.value?.rmssd;
              }
            } catch (error) {
              console.log('HRV data not available');
            }

            this.emit('data', this.normalizeData(data));
          }
        }
      } catch (error) {
        console.error('Fitbit polling error:', error);
      }
    }, 10000); // Poll every 10 seconds

    this.pollingIntervals.set('fitbit', pollInterval);
  }

  subscribeToGarminData() {
    if (!this.activeDevice || this.activeDevice.type !== 'garmin') return;

    const device = this.activeDevice.device;

    // Subscribe to heart rate
    device.subscribe('heartRate', (data) => {
      this.emit('data', this.normalizeData({
        timestamp: Date.now(),
        heartRate: data.value,
        source: 'garmin'
      }));
    });

    // Subscribe to stress
    device.subscribe('stress', (data) => {
      this.emit('data', this.normalizeData({
        timestamp: Date.now(),
        stressLevel: data.value / 100, // Normalize to 0-1
        source: 'garmin'
      }));
    });

    // Subscribe to body battery
    device.subscribe('bodyBattery', (data) => {
      this.emit('data', this.normalizeData({
        timestamp: Date.now(),
        recoveryScore: data.value / 100, // Normalize to 0-1
        source: 'garmin'
      }));
    });
  }

  handleBluetoothHRData(value) {
    // Parse heart rate measurement characteristic
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    const contactDetected = flags & 0x2;
    const contactSupported = flags & 0x4;
    const energyPresent = flags & 0x8;
    const rrPresent = flags & 0x10;

    let heartRate;
    let index = 1;

    if (rate16Bits) {
      heartRate = value.getUint16(index, true);
      index += 2;
    } else {
      heartRate = value.getUint8(index);
      index += 1;
    }

    const data = {
      timestamp: Date.now(),
      heartRate,
      contactDetected: contactSupported ? contactDetected : null,
      source: 'bluetooth-hrm'
    };

    // Extract RR intervals for HRV calculation
    if (rrPresent) {
      const rrIntervals = [];
      while (index < value.byteLength) {
        const rrInterval = value.getUint16(index, true);
        rrIntervals.push(rrInterval);
        index += 2;
      }
      
      if (rrIntervals.length > 0) {
        data.rrIntervals = rrIntervals;
        data.hrv = this.calculateHRVFromRR(rrIntervals);
      }
    }

    this.emit('data', this.normalizeData(data));
  }

  calculateHRVFromRR(rrIntervals) {
    // Calculate RMSSD (Root Mean Square of Successive Differences)
    if (rrIntervals.length < 2) return null;

    let sumSquaredDiffs = 0;
    for (let i = 1; i < rrIntervals.length; i++) {
      const diff = rrIntervals[i] - rrIntervals[i - 1];
      sumSquaredDiffs += diff * diff;
    }

    const rmssd = Math.sqrt(sumSquaredDiffs / (rrIntervals.length - 1));
    return Math.round(rmssd * 0.625); // Convert to milliseconds
  }

  normalizeData(rawData) {
    // Normalize data from different sources into a common format
    const normalized = {
      timestamp: rawData.timestamp || Date.now(),
      source: rawData.source,
      heartRate: rawData.heartRate || 0,
      hrv: rawData.hrv || 0,
      stressLevel: rawData.stressLevel || this.estimateStressFromHR(rawData.heartRate),
      respiratoryRate: rawData.respiratoryRate || 0,
      oxygenSaturation: rawData.oxygenSaturation || 0,
      skinTemperature: rawData.skinTemperature || 0,
      emotionalState: rawData.emotionalState || 'neutral',
      activityLevel: rawData.activityLevel || 'resting',
      sleepStage: rawData.sleepStage || 'awake',
      recoveryScore: rawData.recoveryScore || 0
    };

    // Calculate derived metrics
    if (normalized.heartRate && normalized.hrv) {
      normalized.autonomicBalance = this.calculateAutonomicBalance(normalized.heartRate, normalized.hrv);
    }

    // Update meditation tracking
    if (rawData.mindfulSession) {
      normalized.meditationMinutes = rawData.mindfulSession.duration / 60;
    }

    return normalized;
  }

  estimateStressFromHR(heartRate) {
    if (!heartRate) return 0.5;
    
    // Simple stress estimation based on heart rate
    // This should be calibrated per individual
    const restingHR = 60; // Should be personalized
    const maxHR = 200; // Should be age-adjusted
    
    const normalizedHR = (heartRate - restingHR) / (maxHR - restingHR);
    return Math.max(0, Math.min(1, normalizedHR));
  }

  calculateAutonomicBalance(heartRate, hrv) {
    // Higher HRV generally indicates better parasympathetic (rest/digest) activity
    // Lower HRV with higher HR indicates sympathetic (fight/flight) dominance
    
    const hrvScore = Math.min(hrv / 100, 1); // Normalize HRV (assuming max ~100ms)
    const hrScore = 1 - Math.min(heartRate / 100, 1); // Inverse HR score
    
    return (hrvScore + hrScore) / 2;
  }

  processSleepData(sleepData) {
    // Process sleep data and calculate sleep quality
    const totalSleep = sleepData.reduce((sum, period) => {
      const duration = new Date(period.endDate) - new Date(period.startDate);
      return sum + duration;
    }, 0);

    const deepSleep = sleepData.filter(p => p.value === 'ASLEEP_DEEP')
      .reduce((sum, period) => {
        const duration = new Date(period.endDate) - new Date(period.startDate);
        return sum + duration;
      }, 0);

    const sleepQuality = {
      totalHours: totalSleep / 3600000,
      deepSleepHours: deepSleep / 3600000,
      efficiency: deepSleep / totalSleep,
      score: Math.min((deepSleep / totalSleep) * 1.5, 1) // Simple quality score
    };

    this.emit('sleep-update', sleepQuality);
  }

  async getCurrentData() {
    // Get the most recent data from the active device
    if (!this.activeDevice) return null;

    // Return the last emitted data
    return this.lastEmittedData || null;
  }

  isConnected() {
    return this.activeDevice !== null;
  }

  disconnect() {
    if (this.activeDevice) {
      // Clear polling intervals
      for (const [key, interval] of this.pollingIntervals) {
        clearInterval(interval);
      }
      this.pollingIntervals.clear();

      // Disconnect Bluetooth devices
      if (this.activeDevice.device && this.activeDevice.device.gatt) {
        this.activeDevice.device.gatt.disconnect();
      }

      // Clear Garmin subscriptions
      if (this.activeDevice.type === 'garmin' && this.activeDevice.device) {
        this.activeDevice.device.unsubscribeAll();
      }

      this.emit('disconnected', this.activeDevice);
      this.activeDevice = null;
    }
  }

  // Store last emitted data for getCurrentData
  emit(event, data) {
    if (event === 'data') {
      this.lastEmittedData = data;
    }
    super.emit(event, data);
  }
}

export default WearableIntegration;