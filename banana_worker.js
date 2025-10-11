// Advanced Banana Worker with multiple optimization tasks
class BananaWorker {
    constructor() {
        this.cache = new Map();
        this.setupMessageHandler();
    }

    setupMessageHandler() {
        self.addEventListener('message', this.handleMessage.bind(this));
    }

    async handleMessage(e) {
        const { _id, task, data, options = {} } = e.data || {};
        
        try {
            let result;
            
            switch(task) {
                case 'hash':
                    result = await this.hashString(data.str, options.algorithm);
                    break;
                    
                case 'compress':
                    result = await this.compressData(data.input, options.method);
                    break;
                    
                case 'image-process':
                    result = await this.processImage(data.imageData, options.operations);
                    break;
                    
                case 'data-filter':
                    result = await this.filterLargeDataset(data.dataset, options.filters);
                    break;
                    
                case 'sort':
                    result = await this.sortData(data.items, options.key, options.direction);
                    break;
                    
                case 'search':
                    result = await this.searchInData(data.content, data.query, options);
                    break;
                    
                case 'cache-get':
                    result = this.cache.get(data.key);
                    break;
                    
                case 'cache-set':
                    this.cache.set(data.key, data.value);
                    if(options.ttl) {
                        setTimeout(() => this.cache.delete(data.key), options.ttl);
                    }
                    result = true;
                    break;
                    
                case 'math-compute':
                    result = await this.computeMath(data.expression, data.variables);
                    break;
                    
                case 'csv-parse':
                    result = await this.parseCSV(data.csvString, options.delimiter);
                    break;
                    
                default:
                    throw new Error(`Unknown task: ${task}`);
            }
            
            self.postMessage({ 
                _id, 
                result,
                timestamp: Date.now(),
                cacheSize: this.cache.size
            });
            
        } catch (error) {
            self.postMessage({ 
                _id, 
                error: error.message,
                stack: error.stack
            });
        }
    }

    // String hashing with multiple algorithms
    async hashString(str, algorithm = 'simple') {
        if (algorithm === 'simple') {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return hash;
        }
        
        if (algorithm === 'sha256-like') {
            // Simulate SHA-256 like behavior (for demonstration)
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    // Data compression (simple implementation)
    async compressData(input, method = 'rle') {
        if (method === 'rle') {
            // Run-Length Encoding
            let compressed = '';
            let count = 1;
            let currentChar = input[0];
            
            for (let i = 1; i <= input.length; i++) {
                if (input[i] === currentChar) {
                    count++;
                } else {
                    compressed += count + currentChar;
                    currentChar = input[i];
                    count = 1;
                }
            }
            return compressed;
        }
        
        return input; // Fallback to original
    }

    // Image processing operations
    async processImage(imageData, operations = []) {
        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        
        for (const operation of operations) {
            switch (operation.type) {
                case 'grayscale':
                    this.applyGrayscale(ctx, canvas.width, canvas.height);
                    break;
                case 'blur':
                    this.applyBlur(ctx, canvas.width, canvas.height, operation.radius);
                    break;
                case 'brightness':
                    this.applyBrightness(ctx, canvas.width, canvas.height, operation.value);
                    break;
            }
        }
        
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    applyGrayscale(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;     // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    applyBlur(ctx, width, height, radius = 1) {
        // Simple box blur implementation
        const imageData = ctx.getImageData(0, 0, width, height);
        const tempData = new Uint8ClampedArray(imageData.data);
        
        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                            sum += tempData[idx];
                        }
                    }
                    const idx = (y * width + x) * 4 + c;
                    imageData.data[idx] = sum / Math.pow(2 * radius + 1, 2);
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    applyBrightness(ctx, width, height, value) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + value);     // red
            data[i + 1] = Math.min(255, data[i + 1] + value); // green
            data[i + 2] = Math.min(255, data[i + 2] + value); // blue
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    // Large dataset filtering
    async filterLargeDataset(dataset, filters = []) {
        return dataset.filter(item => {
            return filters.every(filter => {
                const value = item[filter.field];
                switch (filter.operator) {
                    case 'equals': return value === filter.value;
                    case 'contains': return String(value).includes(filter.value);
                    case 'greater': return value > filter.value;
                    case 'less': return value < filter.value;
                    default: return true;
                }
            });
        });
    }

    // Efficient sorting
    async sortData(items, key = null, direction = 'asc') {
        const sorted = [...items].sort((a, b) => {
            const aVal = key ? a[key] : a;
            const bVal = key ? b[key] : b;
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        return sorted;
    }

    // Advanced search with options
    async searchInData(content, query, options = {}) {
        const { caseSensitive = false, wholeWord = false, regex = false } = options;
        
        if (regex) {
            const regex = new RegExp(query, caseSensitive ? 'g' : 'gi');
            return content.match(regex) || [];
        }
        
        if (wholeWord) {
            const wordRegex = new RegExp(`\\b${query}\\b`, caseSensitive ? 'g' : 'gi');
            return content.match(wordRegex) || [];
        }
        
        const searchStr = caseSensitive ? query : query.toLowerCase();
        const contentStr = caseSensitive ? content : content.toLowerCase();
        
        const results = [];
        let index = contentStr.indexOf(searchStr);
        
        while (index !== -1) {
            results.push({
                index,
                match: content.substring(index, index + searchStr.length)
            });
            index = contentStr.indexOf(searchStr, index + 1);
        }
        
        return results;
    }

    // Mathematical computations
    async computeMath(expression, variables = {}) {
        // Safe math evaluation (in real app, use proper parser like math.js)
        const safeExpression = expression
            .replace(/[^0-9+\-*/().xyzXYZ]/g, '')
            .replace(/x/gi, variables.x || 0)
            .replace(/y/gi, variables.y || 0)
            .replace(/z/gi, variables.z || 0);
            
        try {
            return eval(safeExpression);
        } catch {
            return null;
        }
    }

    // CSV parsing
    async parseCSV(csvString, delimiter = ',') {
        const lines = csvString.split('\n');
        const headers = lines[0].split(delimiter);
        
        return lines.slice(1).map(line => {
            const values = line.split(delimiter);
            const obj = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = values[index] ? values[index].trim() : '';
            });
            return obj;
        }).filter(row => Object.values(row).some(val => val !== ''));
    }
}

// Initialize worker
const worker = new BananaWorker();

// Export for testing
if (self.document) {
    window.BananaWorker = BananaWorker;
}