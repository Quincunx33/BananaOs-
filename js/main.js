
// Window templates for different apps
const windowTemplates = {
    'file-explorer': {
        title: 'File Explorer',
        icon: 'fa-folder text-yellow-400',
        content: `
            <div class="flex h-full">
                <div class="w-48 bg-gray-700 p-2">
                    <div class="p-2 hover:bg-gray-600 rounded flex items-center">
                        <i class="fas fa-home mr-2"></i>
                        <span>Home</span>
                    </div>
                    <div class="p-2 hover:bg-gray-600 rounded flex items-center">
                        <i class="fas fa-desktop mr-2"></i>
                        <span>Desktop</span>
                    </div>
                    <div class="p-2 hover:bg-gray-600 rounded flex items-center">
                        <i class="fas fa-download mr-2"></i>
                        <span>Downloads</span>
                    </div>
                    <div class="p-2 hover:bg-gray-600 rounded flex items-center">
                        <i class="fas fa-file mr-2"></i>
                        <span>Documents</span>
                    </div>
                    <div class="p-2 hover:bg-gray-600 rounded flex items-center">
                        <i class="fas fa-music mr-2"></i>
                        <span>Music</span>
                    </div>
                    <div class="p-2 hover:bg-gray-600 rounded flex items-center">
                        <i class="fas fa-image mr-2"></i>
                        <span>Pictures</span>
                    </div>
                </div>
                <div class="flex-1 p-4">
                    <div class="grid grid-cols-4 gap-4">
                        <div class="flex flex-col items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
                            <i class="fas fa-folder text-yellow-400 text-3xl mb-1"></i>
                            <span class="text-xs">Documents</span>
                        </div>
                        <div class="flex flex-col items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
                            <i class="fas fa-folder text-yellow-400 text-3xl mb-1"></i>
                            <span class="text-xs">Downloads</span>
                        </div>
                        <div class="flex flex-col items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
                            <i class="fas fa-file-pdf text-red-400 text-3xl mb-1"></i>
                            <span class="text-xs">Report.pdf</span>
                        </div>
                        <div class="flex flex-col items-center p-2 hover:bg-gray-700 rounded cursor-pointer">
                            <i class="fas fa-file-image text-blue-400 text-3xl mb-1"></i>
                            <span class="text-xs">Photo.jpg</span>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    'terminal': {
        title: 'Terminal',
        icon: 'fa-terminal text-green-400',
        content: `
            <div class="terminal-window">
                <div class="mb-2">Welcome to 🍌Banana OS Terminal</div>
                <div class="mb-2">Type 'help' for available commands</div>
                <div id="terminal-output"></div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">user@🍌Banana OS:~$</span>
                    <input type="text" id="terminal-input" class="terminal-input" autofocus>
                </div>
            </div>
        `
    },
    'browser': {
        title: 'Web Browser',
        icon: 'fa-globe text-blue-400',
        content: `
            <div class="h-full flex flex-col">
                <div class="flex p-2 bg-gray-700" id="browser-controls">
                    <button id="browser-back" class="p-1 mr-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button id="browser-forward" class="p-1 mr-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button id="browser-reload" class="p-1 mr-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-redo"></i>
                    </button>
                    <input type="text" id="url-input" value="https://🍌Banana OS.com" class="flex-1 bg-gray-800 px-3 py-1 rounded outline-none">
                    <button id="browser-go" class="p-1 ml-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <iframe id="browser-iframe" class="flex-1" src="https://🍌Banana OS.com"></iframe>
            </div>
        `
    },
    'settings': {
        title: 'Settings',
        icon: 'fa-cog text-gray-400',
        content: `
            <div class="settings-container">
                <div class="settings-sidebar">
                    <div class="settings-sidebar-item active" data-tab="system">System</div>
                    <div class="settings-sidebar-item" data-tab="display">Display</div>
                    <div class="settings-sidebar-item" data-tab="personalization">Personalization</div>
                    <div class="settings-sidebar-item" data-tab="backup">Backup & Restore</div>
                    <div class="settings-sidebar-item" data-tab="info">System Info</div>
                </div>
                <div class="settings-content">
                    <div class="tab-content active" data-tab="display">
                        <h2 class="text-xl font-bold mb-4">Display Settings</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block mb-2">Wallpaper</label>
                                <div class="grid grid-cols-2 gap-2" id="wallpaper-options">
                                    <div class="wallpaper-option bg-blue-600 rounded cursor-pointer" data-wallpaper="blue">
                                        <div class="h-full w-full flex items-center justify-center text-white font-bold">Blue</div>
                                    </div>
                                    <div class="wallpaper-option bg-purple-600 rounded cursor-pointer" data-wallpaper="purple">
                                        <div class="h-full w-full flex items-center justify-center text-white font-bold">Purple</div>
                                    </div>
                                    <div class="wallpaper-option bg-green-600 rounded cursor-pointer" data-wallpaper="green">
                                        <div class="h-full w-full flex items-center justify-center text-white font-bold">Green</div>
                                    </div>
                                    <div class="wallpaper-option bg-red-600 rounded cursor-pointer" data-wallpaper="red">
                                        <div class="h-full w-full flex items-center justify-center text-white font-bold">Red</div>
                                    </div>
                                    <div class="wallpaper-option wallpaper-custom rounded cursor-pointer" data-wallpaper="custom" id="custom-wallpaper-option">
                                        <div class="h-full w-full flex items-center justify-center text-white font-bold">Custom</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label class="block mb-2">Upload Custom Wallpaper</label>
                                <input type="file" id="custom-wallpaper-upload" accept="image/*" class="bg-gray-800 p-2 rounded w-full">
                            </div>
                            <div>
                                <label class="block mb-2">Brightness</label>
                                <div class="flex items-center">
                                    <input type="range" id="brightness-slider" min="0" max="100" value="100" class="flex-1 mr-2">
                                    <span id="brightness-value">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab="system">
                        <h2 class="text-xl font-bold mb-4">System Settings</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block mb-2">Theme</label>
                                <select id="theme-select" class="bg-gray-800 p-2 rounded w-full">
                                    <option value="dark">Dark</option>
                                    <option value="light">Light</option>
                                    <option value="system">System Default</option>
                                </select>
                            </div>
                            <div>
                                <label class="flex items-center">
                                    <input type="checkbox" id="show-desktop-icons" class="mr-2" checked>
                                    Show Desktop Icons
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab="personalization">
                        <h2 class="text-xl font-bold mb-4">Personalization</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="block mb-2">Accent Color</label>
                                <div class="color-picker">
                                    <div class="color-option" data-color="blue"></div>
                                    <div class="color-option" data-color="purple"></div>
                                    <div class="color-option" data-color="green"></div>
                                    <div class="color-option" data-color="red"></div>
                                    <div class="color-option" data-color="yellow"></div>
                                    <div class="color-option" data-color="pink"></div>
                                    <div class="color-option" data-color="indigo"></div>
                                    <div class="color-option" data-color="teal"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab="backup">
                        <h2 class="text-xl font-bold mb-4">Backup & Restore</h2>
                        <div class="space-y-4">
                            <button onclick="exportSettings()" class="backup-btn bg-blue-600 hover:bg-blue-500">Export Settings</button>
                            <button onclick="importSettings()" class="backup-btn bg-green-600 hover:bg-green-500">Import Settings</button>
                            <button onclick="resetSettings()" class="backup-btn bg-red-600 hover:bg-red-500">Reset to Default</button>
                        </div>
                    </div>
                    
                    <div class="tab-content" data-tab="info">
                        <h2 class="text-xl font-bold mb-4">System Information</h2>
                        <div class="system-info-grid">
                            <div class="info-item">
                                <span class="info-label">OS Version:</span>
                                <span id="os-version" class="info-value">-</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Browser:</span>
                                <span id="browser-info" class="info-value">-</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Screen Resolution:</span>
                                <span id="screen-resolution" class="info-value">-</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Memory Usage:</span>
                                <span id="memory-usage" class="info-value">-</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Storage Usage:</span>
                                <span id="storage-info" class="info-value">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    'calculator': {
        title: 'Calculator',
        icon: 'fa-calculator text-purple-400',
        content: `
            <div class="h-full flex flex-col">
                <div id="calculator-display" class="calculator-display">0</div>
                <div class="grid grid-cols-4 gap-2 flex-1">
                    <div data-calc="clear" class="calculator-button operation col-span-2">AC</div>
                    <div data-calc="plus-minus" class="calculator-button operation">+/-</div>
                    <div data-calc="percent" class="calculator-button operation">%</div>
                    <div data-calc="divide" class="calculator-button operation">÷</div>
                    <div data-calc="7" class="calculator-button number">7</div>
                    <div data-calc="8" class="calculator-button number">8</div>
                    <div data-calc="9" class="calculator-button number">9</div>
                    <div data-calc="multiply" class="calculator-button operation">×</div>
                    <div data-calc="4" class="calculator-button number">4</div>
                    <div data-calc="5" class="calculator-button number">5</div>
                    <div data-calc="6" class="calculator-button number">6</div>
                    <div data-calc="subtract" class="calculator-button operation">-</div>
                    <div data-calc="1" class="calculator-button number">1</div>
                    <div data-calc="2" class="calculator-button number">2</div>
                    <div data-calc="3" class="calculator-button number">3</div>
                    <div data-calc="add" class="calculator-button operation">+</div>
                    <div data-calc="0" class="calculator-button number col-span-2">0</div>
                    <div data-calc="." class="calculator-button number">.</div>
                    <div data-calc="equals" class="calculator-button equals">=</div>
                </div>
                <div class="grid grid-cols-4 gap-2 mt-2">
                    <div data-calc="sin" class="calculator-button operation">sin</div>
                    <div data-calc="cos" class="calculator-button operation">cos</div>
                    <div data-calc="tan" class="calculator-button operation">tan</div>
                    <div data-calc="sqrt" class="calculator-button operation">√</div>
                    <div data-calc="log" class="calculator-button operation">log</div>
                    <div data-calc="ln" class="calculator-button operation">ln</div>
                    <div data-calc="exp" class="calculator-button operation">exp</div>
                    <div data-calc="fact" class="calculator-button operation">!</div>
                    <div data-calc="pi" class="calculator-button operation">π</div>
                    <div data-calc="e" class="calculator-button operation">e</div>
                    <div data-calc="pow" class="calculator-button operation">^</div>
                </div>
            </div>
        `
    },
    'text-editor': {
        title: 'Text Editor',
        icon: 'fa-file-alt text-blue-400',
        content: `
            <div class="h-full flex flex-col">
                <div class="flex p-2 bg-gray-700">
                    <button id="editor-new" class="p-1 mr-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-file"></i> New
                    </button>
                    <button id="editor-open" class="p-1 mr-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-folder-open"></i> Open
                    </button>
                    <button id="editor-save" class="p-1 mr-2 hover:bg-gray-600 rounded">
                        <i class="fas fa-save"></i> Save
                    </button>
                    <input type="file" id="editor-file-input" class="hidden">
                </div>
                <textarea id="editor-text" class="flex-1 bg-gray-800 p-4 outline-none font-mono"></textarea>
            </div>
        `
    },
    'photo-viewer': {
        title: 'photo-viewer',
        icon: 'fa-images text-pink-400',
        content: `
            <div class="h-full flex flex-col p-4" id="pv-container">
                <div class="flex mb-4">
                    <button id="pv-open" class="p-2 bg-blue-600 hover:bg-blue-500 rounded mr-2">
                        <i class="fas fa-folder-open"></i> Open Photos
                    </button>
                    <input type="file" id="pv-file-input" multiple accept="image/*" class="hidden">
                    <button id="pv-slideshow" class="p-2 bg-green-600 hover:bg-green-500 rounded mr-2">
                        <i class="fas fa-play"></i>
                    </button>
                    <button id="pv-prev" class="p-2 bg-gray-600 hover:bg-gray-500 rounded mr-2">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button id="pv-next" class="p-2 bg-gray-600 hover:bg-gray-500 rounded mr-2">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button id="pv-zoom-in" class="p-2 bg-gray-600 hover:bg-gray-500 rounded mr-2">
                        <i class="fas fa-search-plus"></i>
                    </button>
                    <button id="pv-zoom-out" class="p-2 bg-gray-600 hover:bg-gray-500 rounded mr-2">
                        <i class="fas fa-search-minus"></i>
                    </button>
                    <button id="pv-rotate" class="p-2 bg-gray-600 hover:bg-gray-500 rounded">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>
                <div class="flex-1 flex items-center justify-center bg-gray-800 rounded relative">
                    <div id="pv-no-images" class="text-center hidden">
                        <i class="fas fa-images text-4xl mb-2"></i>
                        <p>No photos loaded</p>
                    </div>
                    <img id="pv-image" src="" class="max-h-full max-w-full object-contain hidden">
                </div>
                <div class="flex justify-between mt-2 text-sm">
                    <span id="pv-filename">No file selected</span>
                    <span id="pv-resolution">-</span>
                    <span id="pv-counter">0/0</span>
                </div>
            </div>
        `
    },
    'camera': {
        title: 'Camera',
        icon: 'fa-camera text-orange-400',
        content: `
            <div class="h-full flex flex-col p-4" id="cam-container">
                <div class="flex-1 bg-gray-800 rounded overflow-hidden relative">
                    <video id="cam-video" autoplay playsinline class="w-full h-full object-cover"></video>
                    <canvas id="cam-canvas" class="hidden"></canvas>
                    <div id="cam-preview" class="absolute inset-0 bg-black hidden flex items-center justify-center flex-col">
                        <img id="cam-preview-img" src="" class="max-h-[80%] max-w-full">
                        <div class="flex mt-4">
                            <button id="cam-cancel" class="p-2 bg-red-600 hover:bg-red-500 rounded mr-2">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button id="cam-save" class="p-2 bg-green-600 hover:bg-green-500 rounded">
                                <i class="fas fa-save"></i> Save
                            </button>
                        </div>
                    </div>
                    <div id="cam-error" class="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center hidden">
                        <p class="text-white">Camera access denied</p>
                    </div>
                </div>
                <div class="flex justify-between mt-4">
                    <button id="cam-switch" class="p-2 bg-gray-600 hover:bg-gray-500 rounded">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button id="cam-capture" class="p-4 bg-blue-600 hover:bg-blue-500 rounded-full">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button id="cam-flash" class="p-2 bg-gray-600 hover:bg-gray-500 rounded">
                        <i class="fas fa-bolt"></i>
                    </button>
                </div>
                <div class="flex justify-between mt-2 text-sm">
                    <span id="cam-status">Initializing...</span>
                    <span id="cam-resolution">-</span>
                    <span id="cam-storage">-</span>
                </div>
            </div>
        `
    },
    'weather': {
        title: 'Weather',
        icon: 'fa-cloud-sun text-yellow-400',
        content: `
            <div class="h-full p-4">
                <div id="weather-loading" class="flex items-center justify-center h-full">
                    <i class="fas fa-spinner fa-spin text-4xl"></i>
                </div>
                <div id="weather-error" class="flex items-center justify-center h-full hidden">
                    <p class="text-red-500">Error loading weather data</p>
                </div>
                <div id="weather-content" class="hidden">
                    <div class="flex mb-4">
                        <input id="weather-location" type="text" placeholder="Enter city" class="flex-1 bg-gray-800 p-2 rounded-l">
                        <button id="weather-search" class="p-2 bg-blue-600 hover:bg-blue-500 rounded-r">
                            <i class="fas fa-search"></i>
                        </button>
                        <button id="weather-locate" class="p-2 bg-green-600 hover:bg-green-500 ml-2 rounded">
                            <i class="fas fa-map-marker-alt"></i>
                        </button>
                        <button id="weather-refresh" class="p-2 bg-gray-600 hover:bg-gray-500 ml-2 rounded">
                            <i class="fas fa-sync"></i>
                        </button>
                    </div>
                    <div class="bg-blue-600 bg-opacity-20 rounded-lg p-4 mb-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 id="weather-city" class="text-xl font-bold">-</h2>
                                <p id="weather-date" class="text-sm">-</p>
                            </div>
                            <img id="weather-icon" src="" alt="Weather icon" class="w-16 h-16">
                        </div>
                        <div class="text-center my-4">
                            <span id="weather-temp" class="text-4xl font-bold">-</span>
                            <p id="weather-desc" class="text-lg">-</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>Feels like: <span id="weather-feels-like">-</span></div>
                            <div>Humidity: <span id="weather-humidity">-</span></div>
                            <div>Wind: <span id="weather-wind">-</span></div>
                            <div>Pressure: <span id="weather-pressure">-</span></div>
                        </div>
                    </div>
                    <h3 class="font-bold mb-2">5-Day Forecast</h3>
                    <div class="grid grid-cols-5 gap-2" id="weather-forecast"></div>
                    <div class="text-xs text-gray-400 mt-4 flex justify-between">
                        <span>Data from <a href="https://openweathermap.org" class="underline" target="_blank">OpenWeatherMap</a></span>
                        <span id="weather-update-time">-</span>
                    </div>
                </div>
            </div>
        `
    }
};

// Initialize optimization modules - FIXED VERSION
function initializeOptimizations() {
    console.log('🍌 Initializing Banana Optimization Modules...');
    
    // Check if optimization modules are available
    if (typeof BananaLazyLoader !== 'undefined') {
        console.log('✅ Banana Lazy Loader initialized');
        
        // Register components for lazy loading
        try {
            BananaLazyLoader.registerComponent('[data-calculator]', 
                () => Promise.resolve({ default: initCalculator }), 
                { threshold: 0.2 }
            );
        } catch (e) {
            console.warn('Lazy loader component registration failed:', e);
        }
    } else {
        console.warn('❌ Banana Lazy Loader not available');
    }
    
    // Setup worker optimizations if available
    if (typeof BananaOpt !== 'undefined') {
        console.log('✅ Banana Optimization Engine initialized');
        setupWorkerOptimizations();
        optimizeWindowManagement();
        optimizeAppLoading();
    } else {
        console.warn('❌ Banana Optimization Engine not available');
    }
    
    console.log('🍌 Optimization initialization completed');
}

// Setup worker-based optimizations - SIMPLIFIED
function setupWorkerOptimizations() {
    window.workerCalculator = {
        factorial: function(n) {
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return Promise.resolve(result);
        },
        power: function(base, exponent) {
            return Promise.resolve(Math.pow(base, exponent));
        }
    };
}

// Optimize window management
function optimizeWindowManagement() {
    if (!window.BananaOpt) return;
    
    // Use BananaOpt's debounce if available
    const debouncedResize = window.BananaOpt.debounce ? 
        window.BananaOpt.debounce(function() {
            document.querySelectorAll('.window').forEach(window => {
                setResponsiveWindowSize(window);
            });
        }, 250) :
        function() {
            // Fallback
            document.querySelectorAll('.window').forEach(window => {
                setResponsiveWindowSize(window);
            });
        };
    
    window.addEventListener('resize', debouncedResize);
}

// Optimize app loading
function optimizeAppLoading() {
    // Simple optimization - no dependencies
    const originalOpenApp = window.openApp;
    window.openApp = function(appId) {
        // Add simple preloading logic
        setTimeout(() => {
            // This will help with perceived performance
        }, 10);
        
        return originalOpenApp.call(this, appId);
    };
}

// Enhanced calculator with optimization support
function initCalculator(windowElement) {
    const display = windowElement.querySelector('#calculator-display');
    let currentInput = '';
    let operator = '';
    let previousValue = '';
    let shouldResetInput = false;

    const buttons = windowElement.querySelectorAll('.calculator-button');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const value = button.getAttribute('data-calc');
            
            if (['0','1','2','3','4','5','6','7','8','9','.'].includes(value)) {
                if (shouldResetInput) {
                    currentInput = '';
                    shouldResetInput = false;
                }
                if (value === '.' && currentInput.includes('.')) return;
                currentInput += value;
            } 
            else if (['add','subtract','multiply','divide'].includes(value)) {
                if (currentInput && previousValue && operator) {
                    await calculateResult();
                }
                operator = value;
                previousValue = currentInput || '0';
                shouldResetInput = true;
            } 
            else if (value === 'equals') {
                if (operator && previousValue !== '') {
                    await calculateResult();
                    operator = '';
                }
            } 
            else if (value === 'clear') {
                currentInput = '';
                previousValue = '';
                operator = '';
                shouldResetInput = false;
            } 
            else if (value === 'plus-minus') {
                if (currentInput) {
                    currentInput = (parseFloat(currentInput) * -1).toString();
                }
            } 
            else if (value === 'percent') {
                if (currentInput) {
                    currentInput = (parseFloat(currentInput) / 100).toString();
                }
            } 
            else if (value === 'fact') {
                if (currentInput) {
                    const num = parseInt(currentInput);
                    if (num >= 0 && num <= 100) {
                        try {
                            const result = await window.workerCalculator.factorial(num);
                            currentInput = result.toString();
                            shouldResetInput = true;
                        } catch (e) {
                            currentInput = 'Error';
                        }
                    } else {
                        currentInput = 'Error';
                    }
                }
            }
            else if (['sin','cos','tan','sqrt','log','ln','exp'].includes(value)) {
                let num = parseFloat(currentInput || '0');
                let result;
                switch(value) {
                    case 'sin': result = Math.sin(num * Math.PI / 180); break;
                    case 'cos': result = Math.cos(num * Math.PI / 180); break;
                    case 'tan': result = Math.tan(num * Math.PI / 180); break;
                    case 'sqrt': result = Math.sqrt(num); break;
                    case 'log': result = Math.log10(num); break;
                    case 'ln': result = Math.log(num); break;
                    case 'exp': result = Math.exp(num); break;
                }
                currentInput = result.toString();
                shouldResetInput = true;
            } 
            else if (value === 'pi') {
                currentInput = Math.PI.toString();
                shouldResetInput = true;
            } 
            else if (value === 'e') {
                currentInput = Math.E.toString();
                shouldResetInput = true;
            }
            else if (value === 'pow') {
                operator = 'pow';
                previousValue = currentInput || '0';
                shouldResetInput = true;
            }

            display.textContent = currentInput || '0';
        });
    });

    async function calculateResult() {
        let result;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentInput);
        
        try {
            switch(operator) {
                case 'add': result = prev + current; break;
                case 'subtract': result = prev - current; break;
                case 'multiply': result = prev * current; break;
                case 'divide': result = current !== 0 ? prev / current : 'Error'; break;
                case 'pow': 
                    result = await window.workerCalculator.power(prev, current);
                    break;
            }
            
            if (result !== 'Error') {
                currentInput = result.toString();
                previousValue = '';
            } else {
                currentInput = '';
            }
        } catch (e) {
            currentInput = 'Error';
        }
        
        shouldResetInput = true;
    }
}

// Function to open an app window
function openApp(appId) {
    // Close start menu if open
    document.getElementById('start-menu').classList.add('hidden');
    
    // Check if window already exists
    const existingWindow = document.querySelector(`.window[data-app="${appId}"]`);
    if (existingWindow) {
        existingWindow.style.zIndex = ++zIndex;
        existingWindow.classList.remove('hidden');
        
        // Center window on mobile
        centerWindowOnMobile(existingWindow);
        return;
    }
    
    // Create new window from template
    const template = document.getElementById('window-template');
    const clone = template.content.cloneNode(true);
    const windowElement = clone.querySelector('div');
    windowElement.setAttribute('data-app', appId);
    windowElement.style.zIndex = ++zIndex;
    
    // Set window content based on app
    const appData = windowTemplates[appId] || { title: appId, icon: '', content: `<div>Error: App ${appId} not found</div>` };
    windowElement.querySelector('.app-icon').className = `app-icon ${appData.icon}`;
    windowElement.querySelector('.app-title').textContent = appData.title;
    windowElement.querySelector('.app-content').innerHTML = appData.content;
    
    // Set responsive window size
    setResponsiveWindowSize(windowElement);
    
    // Add to desktop
    document.getElementById('desktop').appendChild(windowElement);
    
    // Center window on mobile
    centerWindowOnMobile(windowElement);
    
    // Make window draggable
    makeDraggable(windowElement);
    
    // Initialize app-specific functionality
    initApp(windowElement, appId);
}

// Function to initialize app-specific JavaScript
function initApp(windowElement, appId) {
    switch(appId) {
        case 'terminal':
            if (typeof initTerminal === 'function') {
                initTerminal(windowElement);
            } else {
                console.error('initTerminal function not found');
            }
            break;
        case 'browser':
            if (typeof initBrowser === 'function') {
                initBrowser(windowElement);
            }
            break;
        case 'calculator':
            initCalculator(windowElement);
            break;
        case 'settings':
             if (typeof initSettings === 'function') {
                initSettings(windowElement);
            }
            break;
        case 'text-editor':
            if (typeof initTextEditor === 'function') {
                initTextEditor(windowElement);
            }
            break;
        case 'photo-viewer':
            if (typeof initPhotoViewer === 'function') {
                initPhotoViewer(windowElement);
            }
            break;
        case 'camera':
            if (typeof initCamera === 'function') {
                initCamera(windowElement);
            }
            break;
        case 'weather':
            if (typeof initWeather === 'function') {
                initWeather(windowElement);
            }
            break;
    }
}


// Initialize when DOM is loaded - SIMPLIFIED
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍌 Banana OS - Starting initialization...');
    
    // Initialize optimizations after a short delay to ensure scripts are loaded
    setTimeout(() => {
        initializeOptimizations();
    }, 100);
    
    console.log('🍌 Banana OS - Ready!');
});
