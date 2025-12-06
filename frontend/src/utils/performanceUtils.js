// performanceUtils.js - Day 18 Performance Optimizations

// 1. Debounce utility for validation calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 2. Throttle utility for canvas updates
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 3. API Response Cache Manager
class APICache {
  constructor(maxAge = 3600000) { // 1 hour default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

export const apiCache = new APICache();

// 4. Cached API call wrapper
export const cachedAPICall = async (cacheKey, apiFunction) => {
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return cached;
  }

  // Make API call
  console.log(`[Cache Miss] ${cacheKey} - Fetching...`);
  const result = await apiFunction();
  
  // Store in cache
  apiCache.set(cacheKey, result);
  return result;
};

// 5. Image preloader for faster canvas rendering
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

// 6. Batch image preloader
export const preloadImages = async (urls) => {
  const promises = urls.map(url => preloadImage(url));
  return Promise.all(promises);
};

// 7. Canvas performance optimizer
export class CanvasOptimizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderScheduled = false;
  }

  // Debounced render
  scheduleRender = debounce(() => {
    if (this.canvas) {
      this.canvas.renderAll();
    }
  }, 16); // ~60fps

  // Batch multiple operations
  batchOperations(operations) {
    this.canvas.discardActiveObject();
    operations.forEach(op => op());
    this.canvas.renderAll();
  }

  // Optimize object rendering
  optimizeObject(obj) {
    obj.set({
      objectCaching: true,
      statefullCache: true,
      noScaleCache: false,
      strokeUniform: true
    });
  }

  // Disable events during heavy operations
  async performHeavyOperation(operation) {
    const evented = this.canvas.selection;
    this.canvas.selection = false;
    this.canvas.skipOffscreen = true;

    try {
      await operation();
    } finally {
      this.canvas.selection = evented;
      this.canvas.skipOffscreen = false;
      this.canvas.renderAll();
    }
  }
}

// 8. Lazy loading for images
export const lazyLoadImage = (imgElement, src) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        observer.unobserve(imgElement);
      }
    });
  });

  observer.observe(imgElement);
  return observer;
};

// 9. Memory cleanup utilities
export const cleanupCanvasMemory = (canvas) => {
  if (!canvas) return;

  const objects = canvas.getObjects();
  objects.forEach(obj => {
    if (obj.type === 'image') {
      const element = obj.getElement();
      if (element) {
        element.src = ''; // Release image memory
      }
    }
  });
  canvas.clear();
  canvas.dispose();
};

// 10. Performance monitor
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  startMeasure(label) {
    this.metrics[label] = performance.now();
  }

  endMeasure(label) {
    if (!this.metrics[label]) return;
    
    const duration = performance.now() - this.metrics[label];
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    delete this.metrics[label];
    return duration;
  }

  async measureAsync(label, asyncFunc) {
    this.startMeasure(label);
    try {
      const result = await asyncFunc();
      this.endMeasure(label);
      return result;
    } catch (error) {
      this.endMeasure(label);
      throw error;
    }
  }
}

// 11. Smart validation debouncer
export const createSmartValidator = (validationFunc, wait = 500) => {
  let timeout;
  let lastValidation = null;
  
  return {
    validate: function(data) {
      clearTimeout(timeout);
      
      return new Promise((resolve) => {
        timeout = setTimeout(async () => {
          // Check if data changed
          const dataHash = JSON.stringify(data);
          if (lastValidation === dataHash) {
            console.log('[Validation] Skipped - No changes detected');
            resolve({ cached: true });
            return;
          }

          const result = await validationFunc(data);
          lastValidation = dataHash;
          resolve(result);
        }, wait);
      });
    },
    
    validateImmediate: async function(data) {
      clearTimeout(timeout);
      return await validationFunc(data);
    }
  };
};

// 12. Request queue for rate limiting
export class RequestQueue {
  constructor(maxConcurrent = 3, delayBetween = 100) {
    this.queue = [];
    this.activeRequests = 0;
    this.maxConcurrent = maxConcurrent;
    this.delayBetween = delayBetween;
  }

  async add(requestFunc) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFunc, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { requestFunc, resolve, reject } = this.queue.shift();
    this.activeRequests++;

    try {
      const result = await requestFunc();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      
      // Delay before next request
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), this.delayBetween);
      }
    }
  }
}

// 13. Optimistic UI update helper
export const optimisticUpdate = async (
  optimisticAction,
  apiCall,
  rollbackAction
) => {
  // Apply optimistic update immediately
  optimisticAction();

  try {
    // Make actual API call
    const result = await apiCall();
    return result;
  } catch (error) {
    // Rollback on failure
    if (rollbackAction) {
      rollbackAction();
    }
    throw error;
  }
};

// 14. Export with progress tracking
export const exportWithProgress = async (canvas, formats, onProgress) => {
  const results = [];
  const totalFormats = formats.length;

  for (let i = 0; i < formats.length; i++) {
    const format = formats[i];
    
    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: totalFormats,
        format: format.name,
        percentage: ((i + 1) / totalFormats) * 100
      });
    }

    // Export format
    const exported = await exportFormat(canvas, format);
    results.push(exported);
  }

  return results;
};

// Helper function for format export
const exportFormat = async (canvas, format) => {
  // Implementation depends on your export logic
  return {
    format: format.name,
    dataUrl: canvas.toDataURL({ format: 'jpeg', quality: 0.9 }),
    width: format.width,
    height: format.height
  };
};

// 15. Local storage with compression
export const compressedStorage = {
  set: (key, value) => {
    try {
      const compressed = JSON.stringify(value);
      localStorage.setItem(key, compressed);
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  get: (key) => {
    try {
      const compressed = localStorage.getItem(key);
      return compressed ? JSON.parse(compressed) : null;
    } catch (error) {
      console.error('Retrieval error:', error);
      return null;
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};

// Usage Examples:

/* 
// 1. Debounced validation
const debouncedValidate = debounce((data) => {
  validateCompliance(data);
}, 500);

// 2. Cached API calls
const layouts = await cachedAPICall(
  `layouts_${productId}_${category}`,
  () => generateLayouts(productId, category)
);

// 3. Performance monitoring
const monitor = new PerformanceMonitor();
await monitor.measureAsync('Export', async () => {
  await exportAllFormats();
});

// 4. Request queue for AI calls
const aiQueue = new RequestQueue(2, 200); // Max 2 concurrent, 200ms delay
const result = await aiQueue.add(() => callGPT4(prompt));

// 5. Smart validation
const validator = createSmartValidator(validateCanvas, 500);
await validator.validate(canvasData);
*/

export default {
  debounce,
  throttle,
  apiCache,
  cachedAPICall,
  preloadImage,
  preloadImages,
  CanvasOptimizer,
  lazyLoadImage,
  cleanupCanvasMemory,
  PerformanceMonitor,
  createSmartValidator,
  RequestQueue,
  optimisticUpdate,
  exportWithProgress,
  compressedStorage
};