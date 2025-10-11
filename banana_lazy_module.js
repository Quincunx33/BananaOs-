/*! Banana Lazy Loader v2.0 - Advanced Component & Resource Manager */
(function(global) {
    'use strict';
    
    class BananaLazyLoader {
        constructor() {
            this.modules = new Map();
            this.components = new Map();
            this.resources = new Map();
            this.observers = new Map();
            this.prefetched = new Set();
            this.cache = new Map();
            this.config = {
                prefetch: true,
                cacheTimeout: 300000, // 5 minutes
                maxParallelLoads: 3,
                retryAttempts: 2,
                visibilityThreshold: 0.1
            };
            
            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.setupMutationObserver();
            this.setupPerformanceMonitor();
            this.autoDiscoverComponents();
        }

        // Module Management
        registerModule(name, loader, dependencies = []) {
            this.modules.set(name, {
                loader,
                dependencies,
                loaded: false,
                loading: false,
                exports: null
            });
        }

        async loadModule(name) {
            if (this.cache.has(name)) {
                return this.cache.get(name);
            }

            const module = this.modules.get(name);
            if (!module) {
                throw new Error(`Module not found: ${name}`);
            }

            if (module.loaded) {
                return module.exports;
            }

            if (module.loading) {
                return new Promise(resolve => {
                    const check = () => {
                        if (module.loaded) resolve(module.exports);
                        else setTimeout(check, 50);
                    };
                    check();
                });
            }

            module.loading = true;

            try {
                // Load dependencies first
                for (const dep of module.dependencies) {
                    await this.loadModule(dep);
                }

                // Load the module
                module.exports = await module.loader();
                module.loaded = true;
                
                // Cache the result
                this.cache.set(name, module.exports);
                setTimeout(() => this.cache.delete(name), this.config.cacheTimeout);
                
                this.emit('module:loaded', { name, exports: module.exports });
                return module.exports;
            } catch (error) {
                module.loading = false;
                this.emit('module:error', { name, error });
                throw error;
            }
        }

        // Component Lazy Loading
        registerComponent(selector, loader, options = {}) {
            this.components.set(selector, {
                loader,
                options: {
                    threshold: options.threshold || this.config.visibilityThreshold,
                    rootMargin: options.rootMargin || '50px 0px',
                    ...options
                }
            });

            // Observe existing elements
            document.querySelectorAll(selector).forEach(el => {
                this.observeElement(el, selector);
            });
        }

        observeElement(element, selector) {
            if (!this.observers.has(selector)) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadComponent(selector, entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, this.components.get(selector).options);

                this.observers.set(selector, observer);
            }

            this.observers.get(selector).observe(element);
        }

        async loadComponent(selector, element) {
            const component = this.components.get(selector);
            if (!component || component.loaded) return;

            try {
                const componentModule = await component.loader();
                if (typeof componentModule === 'function') {
                    componentModule(element);
                } else if (componentModule.default) {
                    componentModule.default(element);
                }
                
                component.loaded = true;
                this.emit('component:loaded', { selector, element });
            } catch (error) {
                this.emit('component:error', { selector, element, error });
            }
        }

        // Resource Preloading
        async prefetchResource(url, type = 'script') {
            if (this.prefetched.has(url)) return;

            try {
                switch (type) {
                    case 'script':
                        await this.prefetchScript(url);
                        break;
                    case 'style':
                        await this.prefetchStyle(url);
                        break;
                    case 'image':
                        await this.prefetchImage(url);
                        break;
                    case 'font':
                        await this.prefetchFont(url);
                        break;
                }
                
                this.prefetched.add(url);
                this.emit('resource:prefetched', { url, type });
            } catch (error) {
                this.emit('resource:error', { url, type, error });
            }
        }

        prefetchScript(url) {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'script';
                link.href = url;
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        }

        prefetchStyle(url) {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        }

        prefetchImage(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = resolve;
                img.onerror = reject;
            });
        }

        prefetchFont(url) {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.href = url;
                link.crossOrigin = 'anonymous';
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        }

        // Advanced Intersection Observer Setup
        setupIntersectionObserver() {
            // Image lazy loading
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadLazyImage(img);
                        this.imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.01
            });

            // Background image lazy loading
            this.backgroundObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        this.loadLazyBackground(element);
                        this.backgroundObserver.unobserve(element);
                    }
                });
            }, {
                rootMargin: '200px 0px',
                threshold: 0.01
            });
        }

        loadLazyImage(img) {
            const src = img.getAttribute('data-src');
            const srcset = img.getAttribute('data-srcset');
            
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
            
            if (srcset) {
                img.srcset = srcset;
                img.removeAttribute('data-srcset');
            }
            
            img.decode().catch(() => {});
        }

        loadLazyBackground(element) {
            const bgImage = element.getAttribute('data-bg');
            if (bgImage) {
                element.style.backgroundImage = `url(${bgImage})`;
                element.removeAttribute('data-bg');
            }
        }

        // Mutation Observer for dynamic content
        setupMutationObserver() {
            this.mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                            this.handleNewElement(node);
                        }
                    });
                });
            });

            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        handleNewElement(element) {
            // Handle lazy images
            if (element.tagName === 'IMG' && 
                (element.hasAttribute('data-src') || element.hasAttribute('data-srcset'))) {
                this.imageObserver.observe(element);
            }

            // Handle lazy backgrounds
            if (element.hasAttribute('data-bg')) {
                this.backgroundObserver.observe(element);
            }

            // Handle registered components
            for (const [selector] of this.components) {
                if (element.matches && element.matches(selector)) {
                    this.observeElement(element, selector);
                }
                
                element.querySelectorAll(selector).forEach(el => {
                    this.observeElement(el, selector);
                });
            }
        }

        // Performance monitoring
        setupPerformanceMonitor() {
            if ('PerformanceObserver' in window) {
                // Monitor largest contentful paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.emit('performance:lcp', lastEntry);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // Monitor long tasks
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.duration > 50) {
                            this.emit('performance:longtask', entry);
                        }
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            }
        }

        // Auto-discover lazy elements
        autoDiscoverComponents() {
            // Discover lazy images
            document.querySelectorAll('img[data-src], img[data-srcset]').forEach(img => {
                this.imageObserver.observe(img);
            });

            // Discover lazy backgrounds
            document.querySelectorAll('[data-bg]').forEach(el => {
                this.backgroundObserver.observe(el);
            });

            // Discover iframe placeholders
            document.querySelectorAll('[data-iframe]').forEach(el => {
                this.observeElement(el, 'iframe-placeholder');
            });
        }

        // Event system
        on(event, callback) {
            if (!this._events) this._events = {};
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(callback);
        }

        emit(event, data) {
            if (this._events && this._events[event]) {
                this._events[event].forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event handler for ${event}:`, error);
                    }
                });
            }
        }

        // Utility methods
        setConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
        }

        getStats() {
            return {
                modules: this.modules.size,
                components: this.components.size,
                resources: this.resources.size,
                prefetched: this.prefetched.size,
                cache: this.cache.size
            };
        }

        clearCache() {
            this.cache.clear();
            this.prefetched.clear();
        }

        destroy() {
            this.mutationObserver?.disconnect();
            this.imageObserver?.disconnect();
            this.backgroundObserver?.disconnect();
            
            for (const observer of this.observers.values()) {
                observer.disconnect();
            }
            
            this.observers.clear();
            this._events = {};
        }
    }

    // Initialize and expose
    const lazyLoader = new BananaLazyLoader();
    global.BananaLazyLoader = lazyLoader;

    // Auto-initialize common modules
    lazyLoader.registerModule('chart', () => import('./modules/chart.js'));
    lazyLoader.registerModule('map', () => import('./modules/map.js'));
    lazyLoader.registerModule('editor', () => import('./modules/editor.js'));

    // Register common components
    lazyLoader.registerComponent('[data-chart]', 
        () => import('./components/chart.js'), 
        { threshold: 0.2 }
    );

    lazyLoader.registerComponent('[data-map]', 
        () => import('./components/map.js'), 
        { threshold: 0.1 }
    );

    console.log('🍌 Banana Lazy Loader v2.0 - Advanced Module Manager Loaded');

})(window);