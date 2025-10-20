// 🍌 Banana OS Kernel - Render Backend Integrated
class BananaKernel {
    constructor() {
        this.system = {
            version: '2.0.0',
            security: {
                enabled: true,
                accessLevel: 'TRIAL',
                features: ['basic_apps'],
                licenseKey: null,
                userToken: null
            },
            apps: {},
            processes: {}
        };
        
        this.services = {};
        // ✅ YOUR RENDER BACKEND URL
        this.API_URL = 'https://bananaos.onrender.com';
        
        console.log('🍌 Banana Kernel Starting...');
        this.init();
    }

    async init() {
        try {
            this.initServices();
            await this.initSecurity();
            this.startSystemMonitor();
            
            console.log('✅ Banana Kernel Ready!');
            console.log('🔐 Security Level:', this.system.security.accessLevel);
            
        } catch (error) {
            console.error('❌ Kernel Boot Failed:', error);
            this.emergencyFallback();
        }
    }

    async initSecurity() {
        try {
            console.log('🔐 Contacting Render Backend...');
            
            const deviceId = this.getDeviceId();
            const response = await this.safeApiCall('/verify-license', {
                deviceId: deviceId
            });
            
            if (response && response.valid) {
                this.system.security.accessLevel = response.accessLevel;
                this.system.security.features = response.features;
                this.system.security.licenseKey = response.licenseKey;
                this.system.security.userToken = response.userToken;
                
                console.log('🎉 Backend License:', response.accessLevel);
                console.log('📦 Features:', response.features);
                
                // Log successful verification
                await this.logToBackend('kernel_boot', {
                    accessLevel: response.accessLevel,
                    deviceId: deviceId
                });
            }
            
        } catch (error) {
            console.warn('⚠️ Backend unavailable, using local mode');
            this.useLocalFallback();
        }
    }

    // ✅ SAFE API CALL WITH ERROR HANDLING
    async safeApiCall(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn(`API Call failed (${endpoint}):`, error.message);
            throw error;
        }
    }

    async logToBackend(event, data = {}) {
        try {
            await this.safeApiCall('/log-event', {
                event: event,
                deviceId: this.getDeviceId(),
                data: data
            });
        } catch (error) {
            // Silent fail - not critical
        }
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
        const localLicense = localStorage.getItem('banana_license');
        if (localLicense) {
            this.system.security.accessLevel = 'PREMIUM';
            this.system.security.features = ['all_features'];
            this.system.security.licenseKey = localLicense;
            console.log('🔑 Using local premium license');
        } else {
            this.system.security.accessLevel = 'TRIAL';
            this.system.security.features = ['file_explorer', 'calculator', 'terminal_basic', 'browser_basic'];
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

        console.log('✅ Services initialized');
    }

    hasPermission(appId, action) {
        if (this.system.security.accessLevel === 'PREMIUM') {
            return true;
        }
        
        // Trial mode restrictions
        const allowedApps = ['file-explorer', 'terminal', 'calculator', 'browser', 'settings'];
        return allowedApps.includes(appId);
    }

    emergencyFallback() {
        console.log('🚨 Emergency fallback activated');
        this.system.security.accessLevel = 'TRIAL';
        this.system.security.features = ['basic_apps'];
    }

    // ✅ LICENSE ACTIVATION WITH RENDER BACKEND
    async activateLicense(licenseKey) {
        console.log('🔑 Activating license via Render...');
        
        try {
            const result = await this.safeApiCall('/activate-license', {
                deviceId: this.getDeviceId(),
                licenseKey: licenseKey
            });
            
            if (result && result.success) {
                this.system.security.accessLevel = result.accessLevel;
                this.system.security.features = result.features;
                this.system.security.licenseKey = licenseKey;
                
                // Save locally for fallback
                localStorage.setItem('banana_license', licenseKey);
                
                await this.logToBackend('license_activated', {
                    licenseKey: licenseKey,
                    accessLevel: result.accessLevel
                });
                
                console.log('✅ License activated via Render!');
                return true;
            } else {
                console.error('❌ Activation failed:', result.error);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Activation failed:', error);
            
            // Local activation fallback
            if (licenseKey && licenseKey.length > 3) {
                this.system.security.accessLevel = 'PREMIUM';
                this.system.security.licenseKey = licenseKey;
                localStorage.setItem('banana_license', licenseKey);
                console.log('✅ License activated locally (fallback)');
                return true;
            }
            
            return false;
        }
    }

    // ✅ APP MANAGEMENT
    async launchApp(appId, config = {}) {
        if (!this.hasPermission(appId, 'launch')) {
            throw new Error(`Permission denied for ${appId}`);
        }

        const processId = `process_${Date.now()}`;
        this.system.processes[processId] = {
            id: processId,
            appId: appId,
            status: 'running',
            startTime: Date.now(),
            config: config
        };

        await this.logToBackend('app_launched', { appId, processId });
        console.log(`🚀 App launched: ${appId}`);
        
        return processId;
    }

    terminateApp(processId) {
        const process = this.system.processes[processId];
        if (process) {
            delete this.system.processes[processId];
            this.logToBackend('app_terminated', { appId: process.appId });
            console.log(`🔴 App terminated: ${process.appId}`);
            return true;
        }
        return false;
    }

    startSystemMonitor() {
        console.log('📊 System monitor started');
        
        // Immediate health check
        this.monitorSystemHealth();
        
        // Periodic monitoring
        setInterval(() => {
            this.monitorSystemHealth();
        }, 30000);
    }

    monitorSystemHealth() {
        const stats = {
            memory: this.getMemoryUsage(),
            processes: Object.keys(this.system.processes).length,
            security: this.system.security.accessLevel,
            timestamp: Date.now()
        };

        this.logToBackend('system_health', stats);
        
        // Auto cleanup if too many processes
        if (stats.memory > 80) {
            this.cleanupMemory();
        }
    }

    getMemoryUsage() {
        return Math.min(100, Object.keys(this.system.processes).length * 15);
    }

    cleanupMemory() {
        const processes = Object.values(this.system.processes);
        if (processes.length > 5) {
            const oldest = processes.sort((a, b) => a.startTime - b.startTime)[0];
            this.terminateApp(oldest.id);
            console.log('🧹 Memory cleanup: Terminated oldest process');
        }
    }

    // ✅ PUBLIC API
    getSystemInfo() {
        return {
            version: this.system.version,
            security: {
                level: 'HIGH',
                accessLevel: this.system.security.accessLevel,
                features: this.system.security.features
            },
            processes: Object.keys(this.system.processes).length,
            backend: 'Render.com',
            status: 'OPERATIONAL'
        };
    }

    getService(serviceName) {
        return this.services[serviceName];
    }

    getStatus() {
        return {
            kernel: 'running',
            security: this.system.security.accessLevel,
            backend: 'connected',
            services: Object.keys(this.services).length
        };
    }
}

// ✅ KERNEL INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Banana OS Booting...');
    
    try {
        window.BananaKernel = new BananaKernel();
        
        // Global access test
        setTimeout(() => {
            const info = window.BananaKernel.getSystemInfo();
            console.log('🎉 Banana OS Ready!', info);
        }, 1000);
        
    } catch (error) {
        console.error('💥 Kernel failed to start:', error);
        
        // Emergency kernel
        window.BananaKernel = {
            getSystemInfo: () => ({ version: '2.0.0', status: 'EMERGENCY_MODE' }),
            getStatus: () => ({ kernel: 'fallback' }),
            launchApp: (appId) => console.log('Launching (fallback):', appId)
        };
    }
});

// ✅ GLOBAL FALLBACK
if (typeof window !== 'undefined' && !window.BananaKernel) {
    window.BananaKernel = {
        getSystemInfo: () => ({ version: '2.0.0', status: 'GLOBAL_FALLBACK' }),
        getStatus: () => ({ kernel: 'global_fallback' })
    };
}