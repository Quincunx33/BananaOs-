const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ YOUR PRIVATE LICENSE DATABASE
const licenseDatabase = {
  'PREMIUM123': { accessLevel: 'PREMIUM', features: ['all_features', 'file_system', 'advanced_security'], status: 'ACTIVE' },
  'BASIC456': { accessLevel: 'BASIC', features: ['basic_apps', 'file_system_basic'], status: 'ACTIVE' },
  'TEST789': { accessLevel: 'PREMIUM', features: ['all_features', 'premium_apps'], status: 'ACTIVE' },
  'BANANA2024': { accessLevel: 'PREMIUM', features: ['all_features'], status: 'ACTIVE' }
};

const userDevices = new Map();
const securityLogs = [];

// ✅ ROOT ROUTE - FIX "Cannot GET /"
app.get('/', (req, res) => {
  res.json({
    message: '🍌 Banana OS Backend Server',
    status: 'RUNNING',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      verifyLicense: 'POST /verify-license',
      activateLicense: 'POST /activate-license', 
      logEvent: 'POST /log-event'
    }
  });
});

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Banana OS Backend',
    timestamp: new Date().toISOString(),
    stats: {
      totalLicenses: Object.keys(licenseDatabase).length,
      activeDevices: userDevices.size,
      totalLogs: securityLogs.length
    }
  });
});

// ✅ LICENSE VERIFICATION
app.post('/verify-license', (req, res) => {
  const { deviceId } = req.body;
  
  console.log('🔍 License verification for:', deviceId);
  
  // Check if device already has license
  if (userDevices.has(deviceId)) {
    const licenseKey = userDevices.get(deviceId);
    const license = licenseDatabase[licenseKey];
    
    securityLogs.push({
      event: 'license_verified',
      deviceId,
      licenseKey,
      timestamp: new Date().toISOString()
    });
    
    return res.json({
      valid: true,
      accessLevel: license.accessLevel,
      licenseKey: licenseKey,
      features: license.features,
      message: 'Existing license verified'
    });
  }
  
  // Find available license for new device
  for (const [key, license] of Object.entries(licenseDatabase)) {
    if (license.status === 'ACTIVE') {
      // Assign license to device
      userDevices.set(deviceId, key);
      
      securityLogs.push({
        event: 'license_assigned',
        deviceId,
        licenseKey: key,
        timestamp: new Date().toISOString()
      });
      
      return res.json({
        valid: true,
        accessLevel: license.accessLevel,
        licenseKey: key,
        features: license.features,
        message: 'New license assigned'
      });
    }
  }
  
  // No license available - trial mode
  securityLogs.push({
    event: 'trial_activated',
    deviceId,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    valid: true,
    accessLevel: 'TRIAL',
    features: ['file_explorer', 'calculator', 'terminal_basic', 'browser_basic'],
    message: 'Trial mode activated'
  });
});

// ✅ LICENSE ACTIVATION
app.post('/activate-license', (req, res) => {
  const { deviceId, licenseKey } = req.body;
  
  console.log('🔑 License activation:', { deviceId, licenseKey });
  
  const license = licenseDatabase[licenseKey];
  
  if (license && license.status === 'ACTIVE') {
    // Register device with license
    userDevices.set(deviceId, licenseKey);
    
    securityLogs.push({
      event: 'license_activated',
      deviceId,
      licenseKey,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      accessLevel: license.accessLevel,
      features: license.features,
      message: 'License activated successfully!'
    });
  } else {
    securityLogs.push({
      event: 'activation_failed',
      deviceId,
      licenseKey,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: false,
      error: 'Invalid license key or license expired'
    });
  }
});

// ✅ SECURITY LOGGING
app.post('/log-event', (req, res) => {
  const { event, deviceId, data } = req.body;
  
  const logEntry = {
    event,
    deviceId,
    data: data || {},
    timestamp: new Date().toISOString()
  };
  
  securityLogs.push(logEntry);
  console.log('📝 Security Log:', logEntry);
  
  // Keep only last 1000 logs
  if (securityLogs.length > 1000) {
    securityLogs.splice(0, securityLogs.length - 1000);
  }
  
  res.json({
    success: true,
    logged: true,
    logId: securityLogs.length
  });
});

// ✅ GET LOGS (for debugging)
app.get('/logs', (req, res) => {
  res.json({
    totalLogs: securityLogs.length,
    logs: securityLogs.slice(-10) // Last 10 logs
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🍌 Banana OS Backend running on port ${PORT}`);
  console.log(`🔑 Available licenses: ${Object.keys(licenseDatabase).join(', ')}`);
  console.log(`🌐 Server URL: https://bananaos.onrender.com`);
});