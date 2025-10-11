// Settings functionality
function initSettings(windowElement) {
    console.log('Initializing settings...');
    
    // Load saved settings first
    loadSavedSettings();
    
    // Theme selection
    const themeSelect = windowElement.querySelector('#theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            localStorage.setItem('theme', e.target.value);
            applyTheme(e.target.value);
            showToast('Theme changed successfully!');
        });
    }
    
    // Wallpaper selection
    const wallpaperOptions = windowElement.querySelectorAll('.wallpaper-option');
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', () => {
            const wallpaper = option.getAttribute('data-wallpaper');
            localStorage.setItem('wallpaper', wallpaper);
            applyWallpaper(wallpaper);
            
            // Visual feedback
            wallpaperOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            showToast('Wallpaper changed successfully!');
        });
    });
    
    // Desktop icons toggle
    const showIconsToggle = windowElement.querySelector('#show-desktop-icons');
    if (showIconsToggle) {
        showIconsToggle.addEventListener('change', (e) => {
            const desktopIcons = document.getElementById('desktop-icons');
            if (e.target.checked) {
                desktopIcons.classList.remove('hidden');
            } else {
                desktopIcons.classList.add('hidden');
            }
            localStorage.setItem('showDesktopIcons', e.target.checked);
            showToast('Desktop icons setting updated!');
        });
    }
    
    // Settings sidebar tabs
    const sidebarItems = windowElement.querySelectorAll('.settings-sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Handle tab switching
            const tab = item.getAttribute('data-tab');
            switchSettingsTab(windowElement, tab);
        });
    });
    
    // Color theme picker
    initColorThemePicker(windowElement);
    
    // Backup and restore functionality
    initBackupRestore(windowElement);
    
    // System information
    initSystemInfo(windowElement);
    
    // File upload for custom wallpapers
    initFileUpload(windowElement);
    
    // Brightness control
    initBrightnessControl(windowElement);
}

function loadSavedSettings() {
    console.log('Loading saved settings...');
    
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        const themeSelect = document.querySelector('#theme-select');
        if (themeSelect) themeSelect.value = savedTheme;
    }
    
    // Load wallpaper
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        applyWallpaper(savedWallpaper);
        const wallpaperOption = document.querySelector(`.wallpaper-option[data-wallpaper="${savedWallpaper}"]`);
        if (wallpaperOption) wallpaperOption.classList.add('selected');
    }
    
    // Load desktop icons preference
    const showIcons = localStorage.getItem('showDesktopIcons');
    if (showIcons !== null) {
        const showIconsToggle = document.querySelector('#show-desktop-icons');
        if (showIconsToggle) {
            showIconsToggle.checked = showIcons === 'true';
            const desktopIcons = document.getElementById('desktop-icons');
            if (showIcons !== 'true') {
                desktopIcons.classList.add('hidden');
            }
        }
    }
    
    // Load accent color
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        applyAccentColor(savedColor);
        const colorOption = document.querySelector(`.color-option[data-color="${savedColor}"]`);
        if (colorOption) colorOption.classList.add('selected');
    }
    
    // Load brightness
    const savedBrightness = localStorage.getItem('brightness');
    if (savedBrightness) {
        applyBrightness(savedBrightness);
        const brightnessSlider = document.querySelector('#brightness-slider');
        if (brightnessSlider) brightnessSlider.value = savedBrightness;
        const brightnessValue = document.querySelector('#brightness-value');
        if (brightnessValue) brightnessValue.textContent = `${savedBrightness}%`;
    }
}

function applyTheme(theme) {
    console.log('Applying theme:', theme);
    document.body.classList.remove('dark-mode', 'light-mode', 'system-mode');
    
    if (theme === 'system') {
        // Detect system preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.add(isDark ? 'dark-mode' : 'light-mode');
    } else {
        document.body.classList.add(`${theme}-mode`);
    }
}

function applyWallpaper(wallpaper) {
    console.log('Applying wallpaper:', wallpaper);
    document.body.classList.remove(
        'wallpaper-blue', 'wallpaper-purple', 'wallpaper-green',
        'wallpaper-red', 'wallpaper-custom'
    );
    
    if (wallpaper === 'custom') {
        const customWallpaper = localStorage.getItem('customWallpaper');
        if (customWallpaper) {
            document.body.style.backgroundImage = `url(${customWallpaper})`;
            document.body.classList.add('wallpaper-custom');
        }
    } else {
        document.body.style.backgroundImage = '';
        document.body.classList.add(`wallpaper-${wallpaper}`);
    }
}

// Load saved wallpaper on page load
function loadWallpaperOnStartup() {
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        applyWallpaper(savedWallpaper);
        
        // Also update the selected state in UI if settings window is open
        const wallpaperOption = document.querySelector(`.wallpaper-option[data-wallpaper="${savedWallpaper}"]`);
        if (wallpaperOption) {
            document.querySelectorAll('.wallpaper-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            wallpaperOption.classList.add('selected');
        }
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadWallpaperOnStartup();
    
    // Also load other settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
    
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        applyAccentColor(savedColor);
    }
});

function applyAccentColor(color) {
    console.log('Applying accent color:', color);
    document.documentElement.style.setProperty('--accent-color', `var(--${color})`);
    
    // Update all elements that use accent color
    const accentElements = document.querySelectorAll('[style*="--accent-color"]');
    accentElements.forEach(el => {
        el.style.backgroundColor = `var(--${color})`;
    });
}

function applyBrightness(value) {
    console.log('Applying brightness:', value);
    const brightnessValue = parseInt(value);
    const opacity = brightnessValue / 100;
    
    // Create or update brightness overlay
    let overlay = document.getElementById('brightness-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'brightness-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'black';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '9999';
        document.body.appendChild(overlay);
    }
    
    overlay.style.opacity = (1 - opacity).toString();
}

function switchSettingsTab(windowElement, tab) {
    console.log('Switching to tab:', tab);
    const tabContents = windowElement.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = windowElement.querySelector(`.tab-content[data-tab="${tab}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

function initColorThemePicker(windowElement) {
    const colorOptions = windowElement.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.getAttribute('data-color');
            applyAccentColor(color);
            localStorage.setItem('accentColor', color);
            
            // Update selection visually
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            showToast('Accent color changed!');
        });
    });
}

function initBackupRestore(windowElement) {
    const exportBtn = windowElement.querySelector('.backup-btn.export');
    const importBtn = windowElement.querySelector('.backup-btn.import');
    const resetBtn = windowElement.querySelector('.backup-btn.reset');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSettings);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', importSettings);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }
}

function initFileUpload(windowElement) {
    const fileInput = windowElement.querySelector('#custom-wallpaper-upload');
    const customWallpaperOption = windowElement.querySelector('#custom-wallpaper-option');
    
    // Check if there's already a custom wallpaper
    const customWallpaper = localStorage.getItem('customWallpaper');
    if (customWallpaper && customWallpaperOption) {
        customWallpaperOption.style.backgroundImage = `url(${customWallpaper})`;
        customWallpaperOption.classList.add('has-image');
        customWallpaperOption.querySelector('div').style.display = 'none';
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    localStorage.setItem('customWallpaper', imageUrl);
                    localStorage.setItem('wallpaper', 'custom');
                    applyWallpaper('custom');
                    
                    // Update custom wallpaper option preview
                    if (customWallpaperOption) {
                        customWallpaperOption.style.backgroundImage = `url(${imageUrl})`;
                        customWallpaperOption.classList.add('has-image');
                        customWallpaperOption.querySelector('div').style.display = 'none';
                    }
                    
                    showToast('Custom wallpaper uploaded successfully!');
                };
                reader.readAsDataURL(file);
            } else {
                showToast('Please select a valid image file.', 'error');
            }
        });
    }
}

function initBrightnessControl(windowElement) {
    const brightnessSlider = windowElement.querySelector('#brightness-slider');
    const brightnessValue = windowElement.querySelector('#brightness-value');
    
    if (brightnessSlider && brightnessValue) {
        brightnessSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            brightnessValue.textContent = `${value}%`;
            applyBrightness(value);
            localStorage.setItem('brightness', value);
        });
    }
}

function initSystemInfo(windowElement) {
    // Browser info
    const browserInfo = windowElement.querySelector('#browser-info');
    if (browserInfo) {
        const ua = navigator.userAgent;
        let browserName;
        
        if (ua.includes('Chrome')) browserName = 'Chrome';
        else if (ua.includes('Firefox')) browserName = 'Firefox';
        else if (ua.includes('Safari')) browserName = 'Safari';
        else if (ua.includes('Edge')) browserName = 'Edge';
        else browserName = 'Unknown Browser';
        
        browserInfo.textContent = browserName;
    }
    
    // Screen resolution
    const resolutionInfo = windowElement.querySelector('#screen-resolution');
    if (resolutionInfo) {
        resolutionInfo.textContent = `${window.screen.width}x${window.screen.height}`;
    }
    
    // Local storage usage
    const storageInfo = windowElement.querySelector('#storage-info');
    if (storageInfo && localStorage) {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length * 2;
            }
        }
        storageInfo.textContent = `${(totalSize / 1024).toFixed(2)} KB used`;
    }
    
    // OS version
    const osInfo = windowElement.querySelector('#os-version');
    if (osInfo) {
        osInfo.textContent = "🍌Banana OS 1.0";
    }
    
    // Memory usage (simulated)
    const memoryInfo = windowElement.querySelector('#memory-usage');
    if (memoryInfo) {
        const used = Math.floor(Math.random() * 4) + 2; // 2-6 GB
        const total = 8;
        memoryInfo.textContent = `${used} GB / ${total} GB`;
    }
}

function exportSettings() {
    const settings = {
        theme: localStorage.getItem('theme'),
        wallpaper: localStorage.getItem('wallpaper'),
        showDesktopIcons: localStorage.getItem('showDesktopIcons'),
        accentColor: localStorage.getItem('accentColor'),
        brightness: localStorage.getItem('brightness'),
        customWallpaper: localStorage.getItem('customWallpaper'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "🍌Banana OS_settings_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showToast('Settings exported successfully!');
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Apply imported settings
                if (settings.theme) {
                    localStorage.setItem('theme', settings.theme);
                    applyTheme(settings.theme);
                    const themeSelect = document.querySelector('#theme-select');
                    if (themeSelect) themeSelect.value = settings.theme;
                }
                
                if (settings.wallpaper) {
                    localStorage.setItem('wallpaper', settings.wallpaper);
                    applyWallpaper(settings.wallpaper);
                    const wallpaperOption = document.querySelector(`.wallpaper-option[data-wallpaper="${settings.wallpaper}"]`);
                    if (wallpaperOption) wallpaperOption.classList.add('selected');
                }
                
                if (settings.showDesktopIcons !== undefined) {
                    localStorage.setItem('showDesktopIcons', settings.showDesktopIcons);
                    const showIconsToggle = document.querySelector('#show-desktop-icons');
                    if (showIconsToggle) {
                        showIconsToggle.checked = settings.showDesktopIcons === 'true';
                        const desktopIcons = document.getElementById('desktop-icons');
                        if (settings.showDesktopIcons !== 'true') {
                            desktopIcons.classList.add('hidden');
                        } else {
                            desktopIcons.classList.remove('hidden');
                        }
                    }
                }
                
                if (settings.accentColor) {
                    localStorage.setItem('accentColor', settings.accentColor);
                    applyAccentColor(settings.accentColor);
                    const colorOption = document.querySelector(`.color-option[data-color="${settings.accentColor}"]`);
                    if (colorOption) colorOption.classList.add('selected');
                }
                
                if (settings.brightness) {
                    localStorage.setItem('brightness', settings.brightness);
                    applyBrightness(settings.brightness);
                    const brightnessSlider = document.querySelector('#brightness-slider');
                    const brightnessValue = document.querySelector('#brightness-value');
                    if (brightnessSlider) brightnessSlider.value = settings.brightness;
                    if (brightnessValue) brightnessValue.textContent = `${settings.brightness}%`;
                }
                
                if (settings.customWallpaper) {
                    localStorage.setItem('customWallpaper', settings.customWallpaper);
                }
                
                showToast('Settings imported successfully!');
            } catch (error) {
                console.error('Error importing settings:', error);
                showToast('Error importing settings: Invalid file format', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
        localStorage.clear();
        showToast('Settings reset to default. Reloading...', 'success');
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.getElementById('settings-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.id = 'settings-toast';
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-10000 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    } text-white`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Make functions globally available
window.initSettings = initSettings;
window.exportSettings = exportSettings;
window.importSettings = importSettings;
window.resetSettings = resetSettings;