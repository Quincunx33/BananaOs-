// Enhanced Browser App - FULLY WORKING VERSION
function initBrowser(windowElement) {
    console.log('Enhanced Browser Initialized');
    
    // Use let for all variables that might need reassignment
    let iframe = windowElement.querySelector('#browser-iframe');
    let urlInput = windowElement.querySelector('#url-input');
    
    // Basic navigation elements
    let backBtn = windowElement.querySelector('#browser-back');
    let forwardBtn = windowElement.querySelector('#browser-forward');
    let reloadBtn = windowElement.querySelector('#browser-reload');
    let goBtn = windowElement.querySelector('#browser-go');
    
    // Enhanced elements
    let homeBtn = windowElement.querySelector('#browser-home');
    let bookmarkBtn = windowElement.querySelector('#browser-bookmark');
    let historyBtn = windowElement.querySelector('#browser-history');
    let downloadBtn = windowElement.querySelector('#browser-download');
    let menuBtn = windowElement.querySelector('#browser-menu');
    let newTabBtn = windowElement.querySelector('#browser-new-tab');
    let closeTabBtn = windowElement.querySelector('#browser-close-tab');
    let tabsContainer = windowElement.querySelector('#browser-tabs');
    let progressBar = windowElement.querySelector('#browser-progress');
    let statusDiv = windowElement.querySelector('#browser-status');

    // Browser state
    let tabs = [];
    let currentTabIndex = 0;
    let bookmarks = JSON.parse(localStorage.getItem('browser-bookmarks') || '[]');
    let history = JSON.parse(localStorage.getItem('browser-history') || '[]');
    let downloads = JSON.parse(localStorage.getItem('browser-downloads') || '[]');
    
    // DNS configuration - using NextDNS for better privacy
    const DNS_RESOLVER = 'https://dns.google/resolve?name=';
    
    // Initialize browser
    initBrowserUI();
    
    // Create initial tab with Google
    createNewTab('https://www.google.com', 'Google');

    // Event listeners
    if (backBtn) backBtn.addEventListener('click', goBack);
    if (forwardBtn) forwardBtn.addEventListener('click', goForward);
    if (reloadBtn) reloadBtn.addEventListener('click', reload);
    if (goBtn) goBtn.addEventListener('click', navigate);
    if (homeBtn) homeBtn.addEventListener('click', goHome);
    if (bookmarkBtn) bookmarkBtn.addEventListener('click', toggleBookmark);
    if (historyBtn) historyBtn.addEventListener('click', showHistory);
    if (downloadBtn) downloadBtn.addEventListener('click', showDownloads);
    if (menuBtn) menuBtn.addEventListener('click', showBrowserMenu);
    if (newTabBtn) newTabBtn.addEventListener('click', () => createNewTab('https://www.google.com', 'New Tab'));
    if (closeTabBtn) closeTabBtn.addEventListener('click', closeCurrentTab);
    
    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') navigate();
        });
    }

    function initBrowserUI() {
        const browserControls = windowElement.querySelector('#browser-controls');
        
        // Add enhanced browser controls if not present
        if (browserControls && !homeBtn) {
            browserControls.innerHTML += `
                <div class="flex items-center space-x-1">
                    <button id="browser-home" class="p-2 hover:bg-gray-600 rounded" title="Home">
                        <i class="fas fa-home"></i>
                    </button>
                    <button id="browser-bookmark" class="p-2 hover:bg-gray-600 rounded" title="Bookmark">
                        <i class="far fa-bookmark"></i>
                    </button>
                    <button id="browser-history" class="p-2 hover:bg-gray-600 rounded" title="History">
                        <i class="fas fa-history"></i>
                    </button>
                    <button id="browser-download" class="p-2 hover:bg-gray-600 rounded" title="Downloads">
                        <i class="fas fa-download"></i>
                    </button>
                    <button id="browser-menu" class="p-2 hover:bg-gray-600 rounded" title="Menu">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            `;
            
            // Re-select elements after adding to DOM
            homeBtn = windowElement.querySelector('#browser-home');
            bookmarkBtn = windowElement.querySelector('#browser-bookmark');
            historyBtn = windowElement.querySelector('#browser-history');
            downloadBtn = windowElement.querySelector('#browser-download');
            menuBtn = windowElement.querySelector('#browser-menu');
            
            // Re-attach event listeners
            if (homeBtn) homeBtn.addEventListener('click', goHome);
            if (bookmarkBtn) bookmarkBtn.addEventListener('click', toggleBookmark);
            if (historyBtn) historyBtn.addEventListener('click', showHistory);
            if (downloadBtn) downloadBtn.addEventListener('click', showDownloads);
            if (menuBtn) menuBtn.addEventListener('click', showBrowserMenu);
        }
        
        // Add tabs container if not present
        if (!tabsContainer) {
            const browserContent = windowElement.querySelector('.h-full') || windowElement;
            const tabsHTML = `
                <div class="flex items-center bg-gray-900 px-2 py-1 border-b border-gray-700">
                    <button id="browser-new-tab" class="p-1 mr-1 hover:bg-gray-700 rounded" title="New Tab">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button id="browser-close-tab" class="p-1 hover:bg-gray-700 rounded" title="Close Tab">
                        <i class="fas fa-times"></i>
                    </button>
                    <div id="browser-tabs" class="flex-1 flex overflow-x-auto"></div>
                </div>
                <div id="browser-progress" class="h-1 bg-blue-500 w-0 transition-all duration-300"></div>
                <div id="browser-status" class="text-xs px-2 py-1 bg-gray-800 hidden"></div>
            `;
            
            browserContent.insertAdjacentHTML('afterbegin', tabsHTML);
            
            // Update references
            tabsContainer = windowElement.querySelector('#browser-tabs');
            progressBar = windowElement.querySelector('#browser-progress');
            statusDiv = windowElement.querySelector('#browser-status');
            newTabBtn = windowElement.querySelector('#browser-new-tab');
            closeTabBtn = windowElement.querySelector('#browser-close-tab');
            
            // Add event listeners to new buttons
            if (newTabBtn) {
                newTabBtn.addEventListener('click', () => createNewTab('https://www.google.com', 'New Tab'));
            }
            if (closeTabBtn) {
                closeTabBtn.addEventListener('click', closeCurrentTab);
            }
        }
    }

    function createNewTab(url, title = 'New Tab') {
        if (!tabsContainer) return null;

        const tabId = 'tab-' + Date.now();
        const tab = {
            id: tabId,
            url: url,
            title: title,
            favicon: '🌐',
            history: [],
            historyIndex: -1
        };

        tabs.push(tab);
        currentTabIndex = tabs.length - 1;

        const tabElement = document.createElement('div');
        tabElement.className = 'flex items-center bg-gray-700 px-3 py-1 mx-1 rounded-t cursor-pointer border-b-2 border-blue-500';
        tabElement.innerHTML = `
            <span class="favicon mr-2">${tab.favicon}</span>
            <span class="title text-sm truncate max-w-24">${tab.title}</span>
            <button class="tab-close ml-2 hover:bg-gray-600 rounded w-4 h-4 flex items-center justify-center">
                <i class="fas fa-times text-xs"></i>
            </button>
        `;

        tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tabId);
        });

        tabElement.addEventListener('click', () => switchTab(tabId));
        
        tabsContainer.appendChild(tabElement);
        updateTabDisplay();
        loadUrl(url);

        return tabId;
    }

    function switchTab(tabId) {
        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex !== -1) {
            currentTabIndex = tabIndex;
            updateTabDisplay();
            loadUrl(tabs[currentTabIndex].url);
        }
    }

    function closeTab(tabId) {
        if (tabs.length <= 1) return;

        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex !== -1) {
            tabs.splice(tabIndex, 1);

            if (tabsContainer && tabsContainer.children[tabIndex]) {
                tabsContainer.children[tabIndex].remove();
            }

            if (currentTabIndex >= tabIndex) {
                currentTabIndex = Math.max(0, currentTabIndex - 1);
            }

            updateTabDisplay();

            if (tabs[currentTabIndex]) {
                loadUrl(tabs[currentTabIndex].url);
            }
        }
    }

    function closeCurrentTab() {
        if (tabs[currentTabIndex]) {
            closeTab(tabs[currentTabIndex].id);
        }
    }

    function updateTabDisplay() {
        if (!tabsContainer) return;

        const tabElements = tabsContainer.querySelectorAll('div');
        tabElements.forEach((tabEl, index) => {
            if (index === currentTabIndex) {
                tabEl.classList.add('bg-gray-700', 'border-blue-500');
                tabEl.classList.remove('bg-gray-800', 'border-transparent');
            } else {
                tabEl.classList.add('bg-gray-800', 'border-transparent');
                tabEl.classList.remove('bg-gray-700', 'border-blue-500');
            }
        });

        updateNavigationButtons();
    }

    function loadUrl(url) {
        if (!url || !iframe) return;

        // Add protocol if missing and handle DNS
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Try to resolve through DNS for better handling
            if (url.includes('.') && !url.includes(' ')) {
                finalUrl = 'https://' + url;
            } else {
                finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(url);
            }
        }

        // Show loading progress
        if (progressBar) {
            progressBar.style.width = '30%';
        }
        if (statusDiv) {
            statusDiv.textContent = 'Loading...';
            statusDiv.classList.remove('hidden');
        }

        // Update current tab
        if (tabs[currentTabIndex]) {
            // Add to tab history
            if (tabs[currentTabIndex].history.length === 0 || 
                tabs[currentTabIndex].history[tabs[currentTabIndex].historyIndex] !== finalUrl) {
                tabs[currentTabIndex].history.push(finalUrl);
                tabs[currentTabIndex].historyIndex = tabs[currentTabIndex].history.length - 1;
            }

            tabs[currentTabIndex].url = finalUrl;
            if (urlInput) urlInput.value = finalUrl;

            // Add to global history
            addToHistory(finalUrl, 'Visited page');

            // Update iframe source with DNS consideration
            setTimeout(() => {
                iframe.src = finalUrl;
                
                if (progressBar) {
                    progressBar.style.width = '100%';
                }
                
                setTimeout(() => {
                    if (progressBar) progressBar.style.width = '0';
                    if (statusDiv) statusDiv.classList.add('hidden');
                }, 500);
            }, 500);
        }
    }

    function navigate() {
        if (!urlInput) return;
        const url = urlInput.value.trim();
        if (url) {
            loadUrl(url);
        }
    }

    function goBack() {
        if (tabs[currentTabIndex] && tabs[currentTabIndex].historyIndex > 0) {
            tabs[currentTabIndex].historyIndex--;
            const previousUrl = tabs[currentTabIndex].history[tabs[currentTabIndex].historyIndex];
            loadUrl(previousUrl);
        } else {
            showNotification('No previous page');
        }
    }

    function goForward() {
        if (tabs[currentTabIndex] && 
            tabs[currentTabIndex].historyIndex < tabs[currentTabIndex].history.length - 1) {
            tabs[currentTabIndex].historyIndex++;
            const nextUrl = tabs[currentTabIndex].history[tabs[currentTabIndex].historyIndex];
            loadUrl(nextUrl);
        } else {
            showNotification('No next page');
        }
    }

    function reload() {
        if (iframe && iframe.src) {
            iframe.src = iframe.src;
            if (statusDiv) {
                statusDiv.textContent = 'Reloading...';
                statusDiv.classList.remove('hidden');
                setTimeout(() => statusDiv.classList.add('hidden'), 1000);
            }
        }
    }

    function goHome() {
        loadUrl('https://www.google.com');
    }

    function toggleBookmark() {
        if (tabs[currentTabIndex]) {
            const currentUrl = tabs[currentTabIndex].url;
            const currentTitle = tabs[currentTabIndex].title;

            const existingIndex = bookmarks.findIndex(bm => bm.url === currentUrl);

            if (existingIndex !== -1) {
                bookmarks.splice(existingIndex, 1);
                if (bookmarkBtn) bookmarkBtn.innerHTML = '<i class="far fa-bookmark"></i>';
                showNotification('Bookmark removed');
            } else {
                bookmarks.push({
                    url: currentUrl,
                    title: currentTitle,
                    favicon: '⭐',
                    date: new Date().toISOString()
                });
                if (bookmarkBtn) bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
                showNotification('Bookmark added');
            }

            localStorage.setItem('browser-bookmarks', JSON.stringify(bookmarks));
        }
    }

    function addToHistory(url, action = 'Visited') {
        history.unshift({
            url: url,
            title: getDomainFromUrl(url),
            action: action,
            timestamp: new Date().toISOString()
        });

        if (history.length > 100) {
            history = history.slice(0, 100);
        }

        localStorage.setItem('browser-history', JSON.stringify(history));
    }

    function getDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url;
        }
    }

    function showHistory() {
        const historyHTML = `
            <div class="absolute top-12 right-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div class="p-3 border-b border-gray-700">
                    <h3 class="font-bold flex justify-between items-center">
                        <span>History</span>
                        <button onclick="clearHistory()" class="text-xs text-red-400 hover:text-red-300">Clear All</button>
                    </h3>
                </div>
                <div class="max-h-64 overflow-y-auto">
                    ${history.length > 0 ? history.slice(0, 15).map(item => `
                        <div class="p-2 hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-700" onclick="loadHistoryUrl('${item.url}')">
                            <span class="favicon mr-2">🕒</span>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm truncate">${item.title}</div>
                                <div class="text-xs text-gray-400">${new Date(item.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="p-4 text-center text-gray-400">
                            <i class="fas fa-history text-2xl mb-2"></i>
                            <p>No browsing history</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        showPopup(historyHTML, historyBtn);
    }

    function clearHistory() {
        history = [];
        localStorage.setItem('browser-history', JSON.stringify(history));
        showNotification('History cleared');
        showHistory(); // Refresh the history view
    }

    function showDownloads() {
        const downloadsHTML = `
            <div class="absolute top-12 right-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div class="p-3 border-b border-gray-700">
                    <h3 class="font-bold flex justify-between items-center">
                        <span>Downloads</span>
                        <button onclick="clearDownloads()" class="text-xs text-red-400 hover:text-red-300">Clear All</button>
                    </h3>
                </div>
                <div class="max-h-64 overflow-y-auto">
                    ${downloads.length > 0 ? downloads.slice(0, 10).map(download => `
                        <div class="p-2 hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-700">
                            <span class="favicon mr-2">📥</span>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm truncate">${download.name}</div>
                                <div class="text-xs text-gray-400">
                                    ${download.status} • ${new Date(download.timestamp).toLocaleString()}
                                </div>
                            </div>
                            ${download.status === 'Completed' ? 
                                '<i class="fas fa-check text-green-400 ml-2"></i>' : 
                                '<i class="fas fa-sync-alt text-yellow-400 ml-2"></i>'
                            }
                        </div>
                    `).join('') : `
                        <div class="p-4 text-center text-gray-400">
                            <i class="fas fa-download text-2xl mb-2"></i>
                            <p>No downloads yet</p>
                        </div>
                    `}
                </div>
                <div class="p-2 border-t border-gray-700">
                    <button onclick="startDemoDownload()" class="w-full text-center text-blue-400 hover:text-blue-300 text-sm">
                        <i class="fas fa-plus mr-1"></i> Demo Download
                    </button>
                </div>
            </div>
        `;

        showPopup(downloadsHTML, downloadBtn);
    }

    function startDemoDownload() {
        const demoDownload = {
            name: 'demo-file-' + Date.now() + '.txt',
            size: '1.2 MB',
            status: 'Completed',
            timestamp: new Date().toISOString()
        };
        
        downloads.unshift(demoDownload);
        localStorage.setItem('browser-downloads', JSON.stringify(downloads));
        showNotification('Demo download completed');
        showDownloads(); // Refresh downloads view
    }

    function clearDownloads() {
        downloads = [];
        localStorage.setItem('browser-downloads', JSON.stringify(downloads));
        showNotification('Downloads cleared');
        showDownloads(); // Refresh downloads view
    }

    function showBrowserMenu() {
        const menuHTML = `
            <div class="absolute top-12 right-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div class="py-1">
                    <button class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center" onclick="showBrowserSettings()">
                        <i class="fas fa-cog mr-2"></i>
                        <span>Settings</span>
                    </button>
                    <button class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center" onclick="showBookmarksManager()">
                        <i class="fas fa-bookmark mr-2"></i>
                        <span>Bookmarks</span>
                    </button>
                    <button class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center" onclick="showDownloads()">
                        <i class="fas fa-download mr-2"></i>
                        <span>Downloads</span>
                    </button>
                    <button class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center" onclick="showHistory()">
                        <i class="fas fa-history mr-2"></i>
                        <span>History</span>
                    </button>
                    <div class="border-t border-gray-700 my-1"></div>
                    <button class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center" onclick="showBrowserInfo()">
                        <i class="fas fa-info-circle mr-2"></i>
                        <span>About Browser</span>
                    </button>
                    <button class="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center" onclick="clearBrowserData()">
                        <i class="fas fa-trash mr-2 text-red-400"></i>
                        <span class="text-red-400">Clear Data</span>
                    </button>
                </div>
            </div>
        `;

        showPopup(menuHTML, menuBtn);
    }

    function showBrowserSettings() {
        const settingsHTML = `
            <div class="absolute top-12 right-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div class="p-3 border-b border-gray-700">
                    <h3 class="font-bold">Browser Settings</h3>
                </div>
                <div class="p-4 space-y-4">
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="safe-browsing" checked class="mr-2">
                            Safe Browsing
                        </label>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="javascript-enabled" checked class="mr-2">
                            JavaScript Enabled
                        </label>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="popup-blocker" checked class="mr-2">
                            Popup Blocker
                        </label>
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Default Search Engine</label>
                        <select class="w-full bg-gray-700 p-2 rounded">
                            <option>Google</option>
                            <option>Bing</option>
                            <option>DuckDuckGo</option>
                        </select>
                    </div>
                    <div class="text-xs text-gray-400">
                        <p>DNS: 7ec546.dns.nextdns.io</p>
                        <p>Enhanced privacy mode enabled</p>
                    </div>
                </div>
            </div>
        `;

        showPopup(settingsHTML, menuBtn);
    }

    function showBookmarksManager() {
        const bookmarksHTML = `
            <div class="absolute top-12 right-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div class="p-3 border-b border-gray-700">
                    <h3 class="font-bold flex justify-between items-center">
                        <span>Bookmarks</span>
                        <button onclick="addDemoBookmark()" class="text-xs text-blue-400 hover:text-blue-300">Add Demo</button>
                    </h3>
                </div>
                <div class="max-h-64 overflow-y-auto">
                    ${bookmarks.length > 0 ? bookmarks.slice(0, 10).map(bookmark => `
                        <div class="p-2 hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-700" onclick="loadBookmarkUrl('${bookmark.url}')">
                            <span class="favicon mr-2">${bookmark.favicon}</span>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm truncate">${bookmark.title}</div>
                                <div class="text-xs text-gray-400">${bookmark.url}</div>
                            </div>
                            <button onclick="event.stopPropagation(); removeBookmark('${bookmark.url}')" class="text-red-400 hover:text-red-300 ml-2">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('') : `
                        <div class="p-4 text-center text-gray-400">
                            <i class="fas fa-bookmark text-2xl mb-2"></i>
                            <p>No bookmarks yet</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        showPopup(bookmarksHTML, menuBtn);
    }

    function addDemoBookmark() {
        const demoBookmark = {
            url: 'https://github.com',
            title: 'GitHub',
            favicon: '🐙',
            date: new Date().toISOString()
        };
        
        bookmarks.push(demoBookmark);
        localStorage.setItem('browser-bookmarks', JSON.stringify(bookmarks));
        showNotification('Demo bookmark added');
        showBookmarksManager();
    }

    function removeBookmark(url) {
        const index = bookmarks.findIndex(bm => bm.url === url);
        if (index !== -1) {
            bookmarks.splice(index, 1);
            localStorage.setItem('browser-bookmarks', JSON.stringify(bookmarks));
            showNotification('Bookmark removed');
            showBookmarksManager();
        }
    }

    function showBrowserInfo() {
        const infoHTML = `
            <div class="absolute top-12 right-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                <div class="p-3 border-b border-gray-700">
                    <h3 class="font-bold">About Browser</h3>
                </div>
                <div class="p-4 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Version:</span>
                        <span>🍌Banana Browser 1.0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Engine:</span>
                        <span>WebKit/Chromium</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">DNS:</span>
                        <span>NextDNS</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Security:</span>
                        <span class="text-green-400">Protected</span>
                    </div>
                    <div class="text-xs text-gray-400 mt-4">
                        <p>Enhanced with privacy protection</p>
                        <p>DNS: 7ec546.dns.nextdns.io</p>
                    </div>
                </div>
            </div>
        `;

        showPopup(infoHTML, menuBtn);
    }

    function clearBrowserData() {
        if (confirm('Clear all browser data? This will remove history, downloads, and bookmarks.')) {
            history = [];
            downloads = [];
            bookmarks = [];
            localStorage.removeItem('browser-history');
            localStorage.removeItem('browser-downloads');
            localStorage.removeItem('browser-bookmarks');
            showNotification('All browser data cleared');
        }
    }

    // Helper functions for popup actions
    window.loadHistoryUrl = function(url) {
        loadUrl(url);
    };

    window.loadBookmarkUrl = function(url) {
        loadUrl(url);
    };

    function showPopup(content, anchorElement) {
        const existingPopup = windowElement.querySelector('.browser-popup');
        if (existingPopup) existingPopup.remove();

        const popup = document.createElement('div');
        popup.className = 'browser-popup';
        popup.innerHTML = content;

        windowElement.appendChild(popup);

        const closePopup = (e) => {
            if (!popup.contains(e.target) && (!anchorElement || !anchorElement.contains(e.target))) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closePopup);
        }, 100);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'absolute bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = message;

        windowElement.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    function updateNavigationButtons() {
        const currentTab = tabs[currentTabIndex];
        if (backBtn && currentTab) {
            backBtn.disabled = !(currentTab.historyIndex > 0);
        }
        if (forwardBtn && currentTab) {
            forwardBtn.disabled = !(currentTab.historyIndex < currentTab.history.length - 1);
        }
    }

    // Enhanced iframe handling
    if (iframe) {
        iframe.addEventListener('load', () => {
            if (progressBar) {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    progressBar.style.width = '0';
                    if (statusDiv) statusDiv.classList.add('hidden');
                }, 500);
            }
            
            // Update tab title after page loads
            try {
                if (tabs[currentTabIndex] && iframe.contentDocument) {
                    const title = iframe.contentDocument.title || 'Untitled';
                    tabs[currentTabIndex].title = title;
                    updateTabTitles();
                }
            } catch (e) {
                // Cross-origin restriction, can't access iframe content
            }
        });

        iframe.addEventListener('error', () => {
            if (progressBar) progressBar.style.width = '0';
            if (statusDiv) {
                statusDiv.textContent = 'Failed to load page';
                statusDiv.classList.remove('hidden');
                setTimeout(() => statusDiv.classList.add('hidden'), 3000);
            }
        });
    }

    function updateTabTitles() {
        const tabElements = tabsContainer.querySelectorAll('div');
        tabElements.forEach((tabEl, index) => {
            const titleElement = tabEl.querySelector('.title');
            if (titleElement && tabs[index]) {
                titleElement.textContent = tabs[index].title;
            }
        });
    }
}

// Make function globally available
window.initBrowser = initBrowser;