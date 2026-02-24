import React, { lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Performance utilities for PWA
export const PerformanceUtils = {
  // Lazy loading with fallback
  lazyLoad: (importFunc, fallback = null) => {
    const LazyComponent = lazy(importFunc);
    
    return (props) => (
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  },

  // Image optimization
  optimizeImage: (src, options = {}) => {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp'
    } = options;

    // If it's an external image, return as-is
    if (src.startsWith('http')) {
      return src;
    }

    // For local images, we can use Vite's image optimization
    return `${src}?w=${width}&h=${height}&q=${quality}&format=${format}`;
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver: (callback, options = {}) => {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  // Network status monitoring
  getNetworkInfo: () => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }
};

// Memoized component wrapper
export const withMemo = (Component, areEqual = null) => {
  return memo(Component, areEqual);
};

// Performance monitoring HOC
export const withPerformanceMonitoring = (WrappedComponent) => {
  const ComponentWithMonitoring = (props) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`${WrappedComponent.name} render time: ${renderTime.toFixed(2)}ms`);
      
      // Log slow renders
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Slow render detected: ${WrappedComponent.name} took ${renderTime.toFixed(2)}ms`);
      }
    });

    return <WrappedComponent {...props} />;
  };

  ComponentWithMonitoring.displayName = `withPerformanceMonitoring(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithMonitoring;
};

// Virtual list component for large datasets
export const VirtualList = ({ 
  items, 
  itemHeight = 50, 
  containerHeight = 300, 
  renderItem,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef(null);

  const handleScroll = PerformanceUtils.throttle((e) => {
    setScrollTop(e.target.scrollTop);
  }, 16);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  );

  const visibleItems = React.useMemo(() => {
    return items.slice(
      Math.max(0, visibleStart - overscan),
      visibleEnd
    ).map((item, index) => ({
      item,
      index: visibleStart - overscan + index
    }));
  }, [items, visibleStart, visibleEnd, overscan]);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Smart image component with lazy loading and optimization
export const SmartImage = React.memo(({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  priority = false,
  onLoad,
  onError 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(priority);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    if (priority) return;

    const observer = PerformanceUtils.createIntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const optimizedSrc = React.useMemo(() => {
    return PerformanceUtils.optimizeImage(src, { width, height });
  }, [src, width, height]);

  const handleLoad = React.useCallback((e) => {
    setIsLoaded(true);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = React.useCallback((e) => {
    setHasError(true);
    onError?.(e);
  }, [onError]);

  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={`${className} bg-gray-200 animate-pulse`}
        style={{ width, height }}
      />
    );
  }

  if (hasError) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-500`}
        style={{ width, height }}
      >
        <span className="text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div 
          className={`${className} bg-gray-200 animate-pulse absolute inset-0`}
          style={{ width, height }}
        />
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={cn(
          className,
          !isLoaded && 'opacity-0',
          'transition-opacity duration-300'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
});

SmartImage.displayName = 'SmartImage';

// Performance context for monitoring app performance
export const PerformanceContext = React.createContext();

export const PerformanceProvider = ({ children }) => {
  const [metrics, setMetrics] = React.useState({
    renderTimes: {},
    memoryUsage: null,
    networkInfo: null,
    lastUpdate: Date.now()
  });

  const updateMetrics = React.useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      memoryUsage: PerformanceUtils.getMemoryUsage(),
      networkInfo: PerformanceUtils.getNetworkInfo(),
      lastUpdate: Date.now()
    }));
  }, []);

  const recordRenderTime = React.useCallback((componentName, time) => {
    setMetrics(prev => ({
      ...prev,
      renderTimes: {
        ...prev.renderTimes,
        [componentName]: time
      }
    }));
  }, []);

  // Update metrics every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  const value = React.useMemo(() => ({
    ...metrics,
    updateMetrics,
    recordRenderTime
  }), [metrics, updateMetrics, recordRenderTime]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Hook for performance monitoring
export const usePerformance = () => {
  const context = React.useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
};

// Component performance wrapper
export const withPerformanceTracking = (WrappedComponent) => {
  const TrackedComponent = (props) => {
    const { recordRenderTime } = usePerformance();
    const renderStart = React.useRef(performance.now());

    React.useLayoutEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart.current;
      recordRenderTime(WrappedComponent.displayName || WrappedComponent.name, renderTime);
    });

    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `withPerformanceTracking(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return React.memo(TrackedComponent);
};