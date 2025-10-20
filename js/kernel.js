// kernel.js - FIXED GAS CALLS VERSION
class BananaKernel {
    constructor() {
        this.system = {
            version: '1.0.0',
            security: {
                enabled: true,
                accessLevel: 'TRIAL', // Default
                features: ['basic_apps'],
                licenseKey: null,
                userToken: null
            },
            apps: {},
            processes: {}
        };
        
        this.services = {};
        // ✅ FIXED: Use your actual GAS URL
        this.GAS_URL = 'https://script.google.com/macros/s/AKfycbwpnyBcXzi6vZbEjFOWAX_2lE98uiK_PEW5uCEjYpQ/exec';
        
        console.log('🍌 Kernel Starting...');
        this.init();
    }

    async init() {
        try {
            this.initServices();
            
            // ✅ FIXED: Better GAS call with error handling
            await this.initSecurity();
            
            this.startSystemMonitor();
            console.log('✅ Banana Kernel Ready');
            
        } catch (error) {
            console.error('❌ Kernel Boot Failed:', error);
            this.emergencyFallback();
        }
    }

    async initSecurity() {
        console.log('🔐 Checking license...');
        
        try {
            // ✅ FIXED: Simple GAS call with timeout
            const licenseData = await this.safeGASCall('verifyLicense');
            
            if (licenseData && licenseData.valid !== false) {
                this.system.security.accessLevel = licenseData.accessLevel || 'PREMIUM';
                this.system.security.features = licenseData.features || ['all_features'];
                this.system.security.userToken = licenseData.userToken;
                
                console.log('🎉 License Valid:', this.system.security.accessLevel);
            } else {
                throw new Error('Invalid license response');
            }
            
        } catch (error) {
            console.warn('⚠️ GAS failed, using local fallback');
            this.useLocalFallback();
        }
    }

    // ✅ FIXED: Safe GAS call function
    async safeGASCall(action, data = {}) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('GAS timeout'));
            }, 8000); // 8 second timeout

            try {
                // Add deviceId to all calls
                const deviceId = this.getDeviceId();
                const params = {
                    deviceId: deviceId,
                    version: this.system.version,
                    ...data
                };

                // Build URL with parameters
                const url = `${this.GAS_URL}?action=${action}&${new URLSearchParams(params)}`;
                
                console.log('📡 Calling GAS:', url);
                
                fetch(url)
                    .then(response => {
                        clearTimeout(timeout);
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('✅ GAS response:', data);
                        resolve(data);
                    })
                    .catch(error => {
                        clearTimeout(timeout);
                        console.warn('❌ GAS call failed:', error.message);
                        reject(error);
                    });
                    
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('banana_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('banana_device_id', deviceId);
        }
        return deviceId;
    }

    useLocalFallback() {
        // Check if user has local license
        const localLicense = localStorage.getItem('banana_license');
        if (localLicense) {
            this.system.security.accessLevel = 'PREMIUM';
            this.system.security.features = ['all_features'];
            this.system.security.licenseKey = localLicense;
            console.log('🔑 Using local premium license');
        } else {
            this.system.security.accessLevel = 'TRIAL';
            this.system.security.features = ['basic_apps'];
            console.log('🆓 Trial mode activated');
        }
    }

    initServices() {
        console.log('🔧 Initializing services...');
        
        this.services.fileSystem = {
            read: (path) => {
                try {
                    const data = localStorage.getItem(`banana_fs_${path}`);
                    return data ? JSON.parse(data) : null;
                } catch (error) {
                    return null;
                }
            },
            write: (path, data) => {
                try {
                    localStorage.setItem(`banana_fs_${path}`, JSON.stringify(data));
                    return true;
                } catch (error) {
                    return false;
                }
            },
            delete: (path) => {
                try {
                    localStorage.removeItem(`banana_fs_${path}`);
                    return true;
                } catch (error) {
                    return false;
                }
            }
        };

        this.services.network = {
            request: (url, options) => fetch(url, options)
        };

        this.services.security = {
            checkPermission: (appId, action) => this.hasPermission(appId, action),
            getAccessLevel: () => this.system.security.accessLevel,
            getSystemInfo: () => this.getSystemInfo(),
            activateLicense: (key) => this.activateLicense(key)
        };

        console.log('✅ Services ready');
    }

    hasPermission(appId, action) {
        // Basic permission system
        if (this.system.security.accessLevel === 'PREMIUM') {
            return true;
        }
        
        // Trial mode restrictions
        const allowedApps = ['file-explorer', 'terminal', 'calculator', 'browser', 'settings'];
        return allowedApps.includes(appId);
    }

    emergencyFallback() {
        console.log('🚨 Emergency fallback');
        this.system.security.accessLevel = 'TRIAL';
        this.system.security.features = ['basic_apps'];
    }

    // ✅ FIXED: License activation with GAS
    async activateLicense(licenseKey) {
        console.log('🔑 Activating license:', licenseKey);
        
        try {
            const result = await this.safeGASCall('activateLicense', {
                licenseKey: licenseKey
            });
            
            if (result && result.success) {
                this.system.security.accessLevel = result.accessLevel || 'PREMIUM';
                this.system.security.features = result.features || ['all_features'];
                this.system.security.licenseKey = licenseKey;
                
                // Save locally for fallback
                localStorage.setItem('banana_license', licenseKey);
                
                console.log('✅ License activated via GAS');
                return true;
            } else {
                console.error('❌ GAS activation failed:', result.error);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Activation failed:', error);
            
            // Local activation as fallback
            if (licenseKey && licenseKey.length > 5) {
                this.system.security.accessLevel = 'PREMIUM';
                this.system.security.licenseKey = licenseKey;
                localStorage.setItem('banana_license', licenseKey);
                console.log('✅ License activated locally (fallback)');
                return true;
            }
            
            return false;
        }
    }

    // ✅ App management
    async launchApp(appId, config = {}) {
        if (!this.hasPermission(appId, 'launch')) {
            throw new Error(`Permission denied for ${appId}`);
        }

        const processId = `process_${Date.now()}`;
        this.system.processes[processId] = {
            id: processId,
            appId: appId,
            status: 'running',
            startTime: Date.now()
        };

        console.log(`🚀 Launched: ${appId}`);
        return processId;
    }

    terminateApp(processId) {
        if (this.system.processes[processId]) {
            delete this.system.processes[processId];
            return true;
        }
        return false;
    }

    startSystemMonitor() {
        setInterval(() => {
            this.monitorSystemHealth();
        }, 30000);
    }

    monitorSystemHealth() {
        const stats = {
            memory: Object.keys(this.system.processes).length * 10,
            processes: Object.keys(this.system.processes).length,
            security: this.system.security.accessLevel
        };
        
        // Log to GAS if available
        this.logToGAS('system_health', stats);
    }

    async logToGAS(event, data) {
        try {
            await this.safeGASCall('logEvent', {
                event: event,
                data: data
            });
        } catch (error) {
            // Silent fail - not critical
        }
    }

    getSystemInfo() {
        return {
            version: this.system.version,
            security: {
                accessLevel: this.system.security.accessLevel,
                features: this.system.security.features
            },
            processes: Object.keys(this.system.processes).length,
            status: 'READY'
        };
    }

    getService(serviceName) {
        return this.services[serviceName];
    }

    getStatus() {
        return {
            kernel: 'running',
            security: this.system.security.accessLevel,
            GAS: 'connected'
        };
    }
}

// ✅ Initialize kernel
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Banana OS with GAS...');
    
    try {
        window.BananaKernel = new BananaKernel();
        
        // Test after initialization
        setTimeout(() => {
            console.log('🧪 Kernel Status:', window.BananaKernel.getStatus());
        }, 2000);
        
    } catch (error) {
        console.error('💥 Kernel failed:', error);
        window.BananaKernel = {
            getSystemInfo: () => ({ status: 'FALLBACK' }),
            getStatus: () => ({ kernel: 'failed' })
        };
    }
});