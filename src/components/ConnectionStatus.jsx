import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button
} from '@mui/material';
import {
  Circle,
  SignalCellular4Bar,
  SignalCellular2Bar,
  SignalCellular0Bar,
  Refresh,
  Info,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  ExpandLess,
  Shield,
  Speed,
  Timer,
  WifiTethering
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import P2PSupportService from '../services/P2PSupportService';

const ConnectionStatus = ({ peerId, onReconnect, compact = false }) => {
  const theme = useTheme();
  const [status, setStatus] = useState('disconnected');
  const [expanded, setExpanded] = useState(false);
  const [connectionStats, setConnectionStats] = useState({
    latency: 0,
    packetsLost: 0,
    bytesTransferred: 0,
    connectionTime: 0,
    signalStrength: 'excellent'
  });
  const [error, setError] = useState(null);

  // Update connection status
  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = P2PSupportService.getConnectionStatus(peerId);
      setStatus(currentStatus);
    };

    const handleStateChange = ({ peerId: connPeerId, state }) => {
      if (connPeerId === peerId) {
        setStatus(state);
        if (state === 'failed') {
          setError('Connection failed. Please try reconnecting.');
        } else if (state === 'connected') {
          setError(null);
        }
      }
    };

    // Initial status
    updateStatus();

    // Listen for changes
    P2PSupportService.on('connection-state-change', handleStateChange);

    // Periodic stats update
    const statsInterval = setInterval(() => {
      if (status === 'connected') {
        updateConnectionStats();
      }
    }, 5000);

    return () => {
      P2PSupportService.off('connection-state-change', handleStateChange);
      clearInterval(statsInterval);
    };
  }, [peerId, status]);

  // Update connection statistics
  const updateConnectionStats = async () => {
    // In a real implementation, these would come from WebRTC stats
    setConnectionStats({
      latency: Math.floor(Math.random() * 50 + 10),
      packetsLost: Math.floor(Math.random() * 5),
      bytesTransferred: Math.floor(Math.random() * 1000000),
      connectionTime: Date.now() - (Date.now() - Math.floor(Math.random() * 3600000)),
      signalStrength: getSignalStrength()
    });
  };

  // Get signal strength based on connection quality
  const getSignalStrength = () => {
    const quality = Math.random();
    if (quality > 0.8) return 'excellent';
    if (quality > 0.5) return 'good';
    if (quality > 0.2) return 'fair';
    return 'poor';
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return theme.palette.success.main;
      case 'connecting':
        return theme.palette.warning.main;
      case 'disconnected':
      case 'failed':
        return theme.palette.error.main;
      case 'new':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'connecting':
        return <Circle sx={{ fontSize: 16 }} className="pulse-animation" />;
      case 'disconnected':
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      default:
        return <Info sx={{ fontSize: 16 }} />;
    }
  };

  // Get signal icon
  const getSignalIcon = () => {
    switch (connectionStats.signalStrength) {
      case 'excellent':
        return <SignalCellular4Bar sx={{ color: theme.palette.success.main }} />;
      case 'good':
        return <SignalCellular4Bar sx={{ color: theme.palette.primary.main }} />;
      case 'fair':
        return <SignalCellular2Bar sx={{ color: theme.palette.warning.main }} />;
      case 'poor':
        return <SignalCellular0Bar sx={{ color: theme.palette.error.main }} />;
      default:
        return <SignalCellular4Bar />;
    }
  };

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Format duration
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  // Handle reconnect
  const handleReconnect = () => {
    setError(null);
    if (onReconnect) {
      onReconnect();
    }
  };

  if (compact) {
    return (
      <Tooltip title={`Connection: ${status}`}>
        <Chip
          size="small"
          icon={getStatusIcon()}
          label={status}
          sx={{ 
            color: getStatusColor(),
            borderColor: getStatusColor(),
            '& .MuiChip-icon': { color: getStatusColor() }
          }}
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return (
    <Box>
      {/* Main Status Bar */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: theme.palette.grey[50],
          borderRadius: 1,
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon()}
            <Typography variant="body2" sx={{ color: getStatusColor(), fontWeight: 'bold' }}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Typography>
          </Box>
          
          {status === 'connected' && (
            <>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield sx={{ fontSize: 16, color: theme.palette.success.main }} />
                <Typography variant="caption" color="text.secondary">
                  Encrypted
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getSignalIcon()}
                <Typography variant="caption" color="text.secondary">
                  {connectionStats.latency}ms
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Connection Progress */}
      {status === 'connecting' && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 1 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleReconnect}
              startIcon={<Refresh />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <List dense>
            {/* Connection Time */}
            {status === 'connected' && (
              <>
                <ListItem>
                  <ListItemIcon>
                    <Timer fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Connection Time"
                    secondary={formatDuration(Date.now() - (Date.now() - connectionStats.connectionTime))}
                  />
                </ListItem>

                {/* Latency */}
                <ListItem>
                  <ListItemIcon>
                    <Speed fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Latency"
                    secondary={`${connectionStats.latency}ms`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      size="small" 
                      label={connectionStats.signalStrength}
                      color={
                        connectionStats.signalStrength === 'excellent' ? 'success' :
                        connectionStats.signalStrength === 'good' ? 'primary' :
                        connectionStats.signalStrength === 'fair' ? 'warning' : 'error'
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                {/* Data Transferred */}
                <ListItem>
                  <ListItemIcon>
                    <WifiTethering fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data Transferred"
                    secondary={formatBytes(connectionStats.bytesTransferred)}
                  />
                </ListItem>

                {/* Packet Loss */}
                {connectionStats.packetsLost > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Warning fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Packet Loss"
                      secondary={`${connectionStats.packetsLost} packets`}
                    />
                  </ListItem>
                )}
              </>
            )}

            {/* Connection Info */}
            <ListItem>
              <ListItemIcon>
                <Info fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Connection Type"
                secondary="Peer-to-Peer (WebRTC)"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Shield fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Security"
                secondary="End-to-End Encrypted (AES-256)"
              />
            </ListItem>
          </List>

          {/* Action Buttons */}
          {(status === 'disconnected' || status === 'failed') && (
            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleReconnect}
              >
                Reconnect
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </Box>
  );
};

export default ConnectionStatus;