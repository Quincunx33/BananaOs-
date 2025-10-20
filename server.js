const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ YOUR PRIVATE LICENSE DATABASE
const licenseDatabase = {
  'PREMIUM123': { accessLevel: 'PREMIUM', features: ['all_features'], status: 'ACTIVE' },
  'BASIC456': { accessLevel: 'BASIC', features: ['basic_apps'], status: 'ACTIVE' },
  'TEST789': { accessLevel: 'PREMIUM', features: ['all_features'], status: 'ACTIVE' }
};

const userDevices = new Map();

// ✅ License Verification - PRIVATE
app.post('/verify-license', (req, res) => {
  const { deviceId } = req.body;
  
  console.log('🔍 License check for device:', deviceId);
  
  // Check if device already registered
  if (userDevices.has(deviceId)) {
    const licenseKey = userDevices.get(deviceId);
    const license = licenseDatabase[licenseKey];
    
    return res.json({
      valid: true,
      accessLevel: license.accessLevel,
      features: license.features,
      message: 'Device already registered'
    });
  }
  
  // Find available license
  for (const [key, license] of Object.entries(licenseDatabase)) {
    if (license.status === 'ACTIVE') {
      // Assign to device
      userDevices.set(deviceId, key);
      
      return res.json({
        valid: true,
        accessLevel: license.accessLevel,
        licenseKey: key,
        features: license.features,
        message: 'License assigned successfully'
      });
    }
  }
  
  // No license available - trial mode
  res.json({
    valid: true,
    accessLevel: 'TRIAL',
    features: ['basic_apps'],
    message: 'Trial mode activated'
  });
});

// ✅ License Activation - PRIVATE  
app.post('/activate-license', (req, res) => {
  const { deviceId, licenseKey } = req.body;
  
  console.log('🔑 Activation request:', { deviceId, licenseKey });
  
  const license = licenseDatabase[licenseKey];
  
  if (license && license.status === 'ACTIVE') {
    // Register device
    userDevices.set(deviceId, licenseKey);
    
    res.json({
      success: true,
      accessLevel: license.accessLevel,
      features: license.features,
      message: 'License activated successfully'
    });
  } else {
    res.json({
      success: false,
      error: 'Invalid or expired license key'
    });
  }
});

// ✅ Security Logging - PRIVATE
app.post('/log-event', (req, res) => {
  const { event, deviceId, data } = req.body;
  
  console.log('📝 Security Event:', {
    timestamp: new Date().toISOString(),
    event,
    deviceId,
    data
  });
  
  res.json({ success: true, logged: true });
});

// ✅ Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Banana OS Backend',
    timestamp: new Date().toISOString(),
    stats: {
      totalLicenses: Object.keys(licenseDatabase).length,
      activeDevices: userDevices.size
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🍌 Banana OS Backend running on port ${PORT}`);
  console.log(`🔑 Available licenses: ${Object.keys(licenseDatabase).join(', ')}`);
});
