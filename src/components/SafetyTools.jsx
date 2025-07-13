import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Shield,
  Block,
  Report,
  Warning,
  PhoneInTalk,
  LocalHospital,
  Policy,
  Gavel,
  VerifiedUser,
  NotificationsOff,
  PersonOff,
  Security,
  Help,
  Emergency
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SafetyTools = ({ onBlock, onReport, onEmergencyContact }) => {
  const theme = useTheme();
  const [reportDialog, setReportDialog] = useState(false);
  const [blockDialog, setBlockDialog] = useState(false);
  const [emergencyDialog, setEmergencyDialog] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [safetySettings, setSafetySettings] = useState({
    autoBlockHarrassment: true,
    alertOnRedFlags: true,
    requireModeration: false,
    limitNewConnections: false
  });
  const [successMessage, setSuccessMessage] = useState('');

  // Emergency resources
  const emergencyResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support',
      icon: <PhoneInTalk />
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Text-based crisis support',
      icon: <PhoneInTalk />
    },
    {
      name: 'RAINN National Sexual Assault Hotline',
      number: '1-800-656-4673',
      description: 'Confidential support for survivors',
      icon: <LocalHospital />
    },
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      description: '24/7 support for domestic violence',
      icon: <Emergency />
    }
  ];

  // Safety guidelines
  const safetyGuidelines = [
    {
      title: 'Never share personal information',
      description: 'Keep your real name, address, phone number, and other identifying details private',
      icon: <PersonOff />
    },
    {
      title: 'Trust your instincts',
      description: 'If something feels wrong, it probably is. End the conversation immediately',
      icon: <Warning />
    },
    {
      title: 'Report concerning behavior',
      description: 'Help keep the community safe by reporting harassment or harmful content',
      icon: <Report />
    },
    {
      title: 'Use blocking freely',
      description: "You don't need to justify blocking someone. Your safety comes first",
      icon: <Block />
    }
  ];

  // Handle report submission
  const handleReportSubmit = () => {
    if (!reportType || !reportDetails.trim()) {
      return;
    }

    const report = {
      type: reportType,
      details: reportDetails,
      timestamp: new Date().toISOString()
    };

    if (onReport) {
      onReport(report);
    }

    setReportDialog(false);
    setReportType('');
    setReportDetails('');
    setSuccessMessage('Report submitted. Thank you for helping keep our community safe.');
  };

  // Handle block submission
  const handleBlockSubmit = () => {
    const blockData = {
      reason: blockReason,
      timestamp: new Date().toISOString()
    };

    if (onBlock) {
      onBlock(blockData);
    }

    setBlockDialog(false);
    setBlockReason('');
    setSuccessMessage('User blocked successfully.');
  };

  // Handle safety setting change
  const handleSettingChange = (setting) => (event) => {
    setSafetySettings({
      ...safetySettings,
      [setting]: event.target.checked
    });
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
          Safety Tools & Resources
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your safety and wellbeing are our top priority
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<Block />}
              onClick={() => setBlockDialog(true)}
            >
              Block User
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<Report />}
              onClick={() => setReportDialog(true)}
            >
              Report Issue
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<Emergency />}
              onClick={() => setEmergencyDialog(true)}
            >
              Emergency Help
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Safety Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <Security />
            Safety Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Shield />
              </ListItemIcon>
              <ListItemText
                primary="Auto-block harassment"
                secondary="Automatically block users who send inappropriate messages"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={handleSettingChange('autoBlockHarrassment')}
                  checked={safetySettings.autoBlockHarrassment}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Warning />
              </ListItemIcon>
              <ListItemText
                primary="Alert on red flags"
                secondary="Get warnings about potentially harmful behavior patterns"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={handleSettingChange('alertOnRedFlags')}
                  checked={safetySettings.alertOnRedFlags}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VerifiedUser />
              </ListItemIcon>
              <ListItemText
                primary="Require moderation"
                secondary="Have messages reviewed before delivery (may delay conversations)"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={handleSettingChange('requireModeration')}
                  checked={safetySettings.requireModeration}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <NotificationsOff />
              </ListItemIcon>
              <ListItemText
                primary="Limit new connections"
                secondary="Restrict the number of new connections per day"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={handleSettingChange('limitNewConnections')}
                  checked={safetySettings.limitNewConnections}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Safety Guidelines */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <Policy />
            Safety Guidelines
          </Typography>
          <List>
            {safetyGuidelines.map((guideline, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {guideline.icon}
                </ListItemIcon>
                <ListItemText
                  primary={guideline.title}
                  secondary={guideline.description}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Emergency Resources */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <Emergency sx={{ color: theme.palette.error.main }} />
            Emergency Resources
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            If you're in immediate danger, call 911 or your local emergency number
          </Alert>
          <List>
            {emergencyResources.map((resource, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {resource.icon}
                </ListItemIcon>
                <ListItemText
                  primary={resource.name}
                  secondary={
                    <>
                      <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                        {resource.number}
                      </Typography>
                      <br />
                      {resource.description}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog 
        open={reportDialog} 
        onClose={() => setReportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report an Issue</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Your report will be reviewed by our safety team. All reports are confidential.
          </Alert>
          
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">What would you like to report?</FormLabel>
            <RadioGroup
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <FormControlLabel value="harassment" control={<Radio />} label="Harassment or bullying" />
              <FormControlLabel value="inappropriate" control={<Radio />} label="Inappropriate content" />
              <FormControlLabel value="scam" control={<Radio />} label="Scam or fraud attempt" />
              <FormControlLabel value="threat" control={<Radio />} label="Threats or violence" />
              <FormControlLabel value="other" control={<Radio />} label="Other concern" />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Please provide details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Describe what happened..."
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleReportSubmit}
            disabled={!reportType || !reportDetails.trim()}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Dialog */}
      <Dialog 
        open={blockDialog} 
        onClose={() => setBlockDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Block User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Blocking a user will immediately end all connections and prevent future contact.
            This action cannot be undone.
          </Alert>
          
          <FormControl component="fieldset">
            <FormLabel component="legend">Reason for blocking (optional)</FormLabel>
            <RadioGroup
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            >
              <FormControlLabel value="uncomfortable" control={<Radio />} label="Made me uncomfortable" />
              <FormControlLabel value="inappropriate" control={<Radio />} label="Inappropriate behavior" />
              <FormControlLabel value="spam" control={<Radio />} label="Spam or unwanted messages" />
              <FormControlLabel value="safety" control={<Radio />} label="Safety concerns" />
              <FormControlLabel value="personal" control={<Radio />} label="Personal preference" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleBlockSubmit}
          >
            Block User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Dialog */}
      <Dialog 
        open={emergencyDialog} 
        onClose={() => setEmergencyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: theme.palette.error.main }}>
          Emergency Help
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            If you're in immediate danger, call 911 or your local emergency number
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            Crisis support is available 24/7:
          </Typography>
          
          <List>
            {emergencyResources.slice(0, 2).map((resource, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="h6" color="primary">
                      {resource.number}
                    </Typography>
                  }
                  secondary={resource.name}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => {
              if (onEmergencyContact) onEmergencyContact();
              setEmergencyDialog(false);
            }}
          >
            Contact Emergency Services
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmergencyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default SafetyTools;