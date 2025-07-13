import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Psychology,
  Security,
  Connect,
  Block,
  Report,
  CheckCircle,
  Info,
  PersonSearch,
  Refresh,
  Shield,
  Favorite
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import TraumaPatternMatcher from '../utils/TraumaPatternMatcher';
import P2PSupportService from '../services/P2PSupportService';

const SupportMatching = ({ userPattern, onConnectionInitiated }) => {
  const theme = useTheme();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connectionDialog, setConnectionDialog] = useState(false);
  const [activeConnections, setActiveConnections] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch potential matches
  const findMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would fetch from a secure server
      // For now, we'll simulate with mock data
      const mockCandidates = generateMockCandidates();
      
      const matchResults = TraumaPatternMatcher.findBestMatches(
        userPattern,
        mockCandidates,
        {
          maxMatches: 5,
          minimumScore: 0.6,
          diversityBonus: true
        }
      );
      
      setMatches(matchResults);
    } catch (err) {
      setError('Failed to find matches. Please try again.');
      console.error('Matching error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize connection with selected match
  const initiateConnection = async (match) => {
    try {
      // Create offer for peer connection
      const offer = await P2PSupportService.createOffer(match.candidateId);
      
      // In production, this would be sent through a signaling server
      // For now, we'll simulate the connection process
      setSuccessMessage('Connection request sent. Waiting for response...');
      
      // Update active connections
      setActiveConnections(prev => [...prev, {
        peerId: match.candidateId,
        status: 'pending',
        compatibility: match.compatibility
      }]);
      
      if (onConnectionInitiated) {
        onConnectionInitiated(match);
      }
      
      setConnectionDialog(false);
    } catch (err) {
      setError('Failed to initiate connection. Please try again.');
      console.error('Connection error:', err);
    }
  };

  // Handle connection events
  useEffect(() => {
    const handlePeerConnected = ({ peerId }) => {
      setActiveConnections(prev => 
        prev.map(conn => 
          conn.peerId === peerId 
            ? { ...conn, status: 'connected' }
            : conn
        )
      );
      setSuccessMessage('Successfully connected to peer support partner!');
    };

    const handlePeerDisconnected = ({ peerId }) => {
      setActiveConnections(prev => 
        prev.filter(conn => conn.peerId !== peerId)
      );
    };

    P2PSupportService.on('peer-connected', handlePeerConnected);
    P2PSupportService.on('peer-disconnected', handlePeerDisconnected);

    return () => {
      P2PSupportService.off('peer-connected', handlePeerConnected);
      P2PSupportService.off('peer-disconnected', handlePeerDisconnected);
    };
  }, []);

  // Generate mock candidate data (replace with real data in production)
  const generateMockCandidates = () => {
    return [
      {
        id: 'user_001',
        traumaTypes: [
          { category: 'developmental' },
          { category: 'relational' }
        ],
        healingStage: 'active-healing',
        brainImpactPattern: {
          affectedRegions: {
            amygdala: 0.7,
            hippocampus: 0.6,
            prefrontal_cortex: 0.5
          },
          overallSeverity: 'moderate'
        },
        copingStyles: ['emotional-support', 'mindfulness', 'creative-expression'],
        strengths: ['resilience', 'empathy', 'creativity']
      },
      {
        id: 'user_002',
        traumaTypes: [
          { category: 'acute' },
          { category: 'developmental' }
        ],
        healingStage: 'integration',
        brainImpactPattern: {
          affectedRegions: {
            amygdala: 0.8,
            anterior_cingulate: 0.6,
            insula: 0.5
          },
          overallSeverity: 'significant'
        },
        copingStyles: ['problem-solving', 'physical-activity', 'social-support'],
        strengths: ['determination', 'analytical-thinking', 'leadership']
      },
      // Add more mock candidates as needed
    ];
  };

  // Get match quality color
  const getMatchQualityColor = (quality) => {
    switch (quality) {
      case 'excellent':
        return theme.palette.success.main;
      case 'recommended':
        return theme.palette.primary.main;
      case 'compatible':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get match quality icon
  const getMatchQualityIcon = (quality) => {
    switch (quality) {
      case 'excellent':
        return <Favorite sx={{ color: theme.palette.success.main }} />;
      case 'recommended':
        return <CheckCircle sx={{ color: theme.palette.primary.main }} />;
      default:
        return <Info sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 1
        }}>
          <Shield sx={{ color: theme.palette.primary.main }} />
          Secure Support Matching
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Find peers with similar experiences for anonymous, encrypted support
        </Typography>
      </Box>

      {/* Privacy Notice */}
      <Alert 
        severity="info" 
        icon={<Security />}
        sx={{ mb: 3 }}
      >
        All connections are end-to-end encrypted. No personal information is shared.
        You remain completely anonymous.
      </Alert>

      {/* Find Matches Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<PersonSearch />}
          onClick={findMatches}
          disabled={loading}
          size="large"
        >
          {loading ? 'Finding Matches...' : 'Find Support Partners'}
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Analyzing compatibility patterns...
          </Typography>
        </Box>
      )}

      {/* Active Connections */}
      {activeConnections.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Active Connections
          </Typography>
          {activeConnections.map((connection) => (
            <Chip
              key={connection.peerId}
              label={`Partner ${connection.peerId.slice(-4)}`}
              color={connection.status === 'connected' ? 'success' : 'default'}
              icon={<Connect />}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      )}

      {/* Matches Grid */}
      {matches.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Compatible Support Partners
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {matches.map((match) => (
              <Card 
                key={match.candidateId}
                sx={{ 
                  position: 'relative',
                  borderLeft: `4px solid ${getMatchQualityColor(match.compatibility.matchQuality)}`,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardContent>
                  {/* Match Quality Badge */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    {getMatchQualityIcon(match.compatibility.matchQuality)}
                    <Typography variant="caption" sx={{ 
                      color: getMatchQualityColor(match.compatibility.matchQuality),
                      fontWeight: 'bold'
                    }}>
                      {Math.round(match.compatibility.totalScore * 100)}% Match
                    </Typography>
                  </Box>

                  {/* Anonymous Avatar */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: theme.palette.primary.main,
                      mr: 2
                    }}>
                      <Psychology />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        Anonymous Partner
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {match.candidateId.slice(-6)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Shared Factors */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Shared Experiences:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {match.compatibility.sharedFactors.traumaCategories.map((category, idx) => (
                        <Chip
                          key={idx}
                          label={category}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Healing Stage */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Healing Stage: {match.candidate.healingStage.replace('-', ' ')}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Connect />}
                      onClick={() => {
                        setSelectedMatch(match);
                        setConnectionDialog(true);
                      }}
                      fullWidth
                    >
                      Connect
                    </Button>
                    <Tooltip title="Block this match">
                      <IconButton size="small">
                        <Block fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Connection Dialog */}
      <Dialog 
        open={connectionDialog} 
        onClose={() => setConnectionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Connect with Support Partner
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You're about to establish a secure, encrypted connection. 
            Your identity will remain anonymous.
          </Alert>
          
          {selectedMatch && (
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Compatibility Score:</strong> {Math.round(selectedMatch.compatibility.totalScore * 100)}%
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Match Quality:</strong> {selectedMatch.compatibility.matchQuality}
              </Typography>
              <Typography variant="body2">
                <strong>Shared Factors:</strong> {selectedMatch.compatibility.sharedFactors.traumaCategories.length} common experiences
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectionDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => initiateConnection(selectedMatch)}
            startIcon={<Shield />}
          >
            Connect Securely
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportMatching;