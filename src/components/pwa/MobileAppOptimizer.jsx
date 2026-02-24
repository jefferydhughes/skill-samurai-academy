import React, { useState, useEffect } from 'react';
import { usePWA } from '@/lib/PWAContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  X,
  Settings,
  Zap,
  Globe
} from 'lucide-react';

const MobileAppOptimizer = () => {
  const { isInstalled, isInstallable, installApp } = usePWA();
  
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    platform: '',
    userAgent: ''
  });
  
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    detectDevice();
    measurePerformance();
    
    // Add touch event listeners for gesture support
    if ('ontouchstart' in window) {
      addTouchGestures();
    }
  }, []);

  const detectDevice = () => {
    const ua = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
    
    let platform = 'desktop';
    if (ua.includes('iPhone')) platform = 'ios';
    else if (ua.includes('Android')) platform = 'android';
    else if (ua.includes('iPad')) platform = 'ipad';
    
    setDeviceInfo({
      isMobile,
      isTablet,
      platform,
      userAgent: ua.substring(0, 50) + '...'
    });
  };

  const measurePerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const firstContentfulPaint = paint.find(
        entry => entry.name === 'first-contentful-paint'
      )?.startTime || 0;
      
      setPerformanceMetrics({
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint,
        largestContentfulPaint: 0, // Requires LCP observer
        memoryUsage: performance.memory?.usedJSHeapSize || 0
      });
      
      // Observe LCP
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setPerformanceMetrics(prev => ({
            ...prev,
            largestContentfulPaint: lastEntry.startTime
          }));
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    }
  };

  const addTouchGestures = () => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      handleSwipeGesture();
    };

    const handleSwipeGesture = () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swipe right - could trigger navigation
            window.dispatchEvent(new CustomEvent('swipeRight'));
          } else {
            // Swipe left - could trigger navigation
            window.dispatchEvent(new CustomEvent('swipeLeft'));
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  };

  const optimizeForMobile = () => {
    // Implement mobile optimization strategies
    const optimizations = [
      {
        title: 'Lazy Load Images',
        description: 'Load images only when they enter viewport',
        action: () => {
          const images = document.querySelectorAll('img[data-src]');
          const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            });
          });
          
          images.forEach(img => imageObserver.observe(img));
        }
      },
      {
        title: 'Optimize Touch Targets',
        description: 'Ensure buttons are at least 44px for mobile',
        action: () => {
          const buttons = document.querySelectorAll('button, .btn');
          buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
              btn.style.minWidth = '44px';
              btn.style.minHeight = '44px';
            }
          });
        }
      },
      {
        title: 'Prefer Reduced Motion',
        description: 'Respect user preference for reduced motion',
        action: () => {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.style.setProperty('--transition-duration', '0.01ms');
          }
        }
      }
    ];

    optimizations.forEach(opt => {
      try {
        opt.action();
        console.log(`Applied optimization: ${opt.title}`);
      } catch (error) {
        console.error(`Failed to apply ${opt.title}:`, error);
      }
    });
  };

  const formatMemory = (bytes) => {
    if (bytes === 0) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (ms) => {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(2) + 's';
  };

  const getPerformanceScore = () => {
    const { loadTime, firstContentfulPaint, largestContentfulPaint } = performanceMetrics;
    
    let score = 100;
    if (loadTime > 3000) score -= 20;
    if (firstContentfulPaint > 2000) score -= 20;
    if (largestContentfulPaint > 2500) score -= 20;
    if (performanceMetrics.memoryUsage > 50 * 1024 * 1024) score -= 15;
    
    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Mobile Optimization</h2>
        <p className="text-gray-600">Optimize your app for the best mobile experience</p>
      </div>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Device Type</Label>
              <p className="text-sm text-gray-600">
                {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Platform</Label>
              <p className="text-sm text-gray-600 capitalize">{deviceInfo.platform}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Touch Support</Label>
              <p className="text-sm text-gray-600">
                {'ontouchstart' in window ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">PWA Installed</Label>
              <p className="text-sm text-gray-600">
                {isInstalled ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Performance Score</span>
              <Badge variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}>
                {performanceScore}/100
              </Badge>
            </div>
            <Progress value={performanceScore} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Page Load Time</Label>
              <p className="text-sm text-gray-600">{formatTime(performanceMetrics.loadTime)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">First Contentful Paint</Label>
              <p className="text-sm text-gray-600">{formatTime(performanceMetrics.firstContentfulPaint)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Memory Usage</Label>
              <p className="text-sm text-gray-600">{formatMemory(performanceMetrics.memoryUsage)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Largest Contentful Paint</Label>
              <p className="text-sm text-gray-600">{formatTime(performanceMetrics.largestContentfulPaint)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Mobile Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {'ontouchstart' in window ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Touch Support</span>
            </div>
            <div className="flex items-center gap-2">
              {navigator.share ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Web Share API</span>
            </div>
            <div className="flex items-center gap-2">
              {'vibrate' in navigator ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Vibration API</span>
            </div>
            <div className="flex items-center gap-2">
              {'serviceWorker' in navigator ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Service Worker</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Optimization Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={optimizeForMobile} className="w-full justify-start">
            <Zap className="w-4 h-4 mr-2" />
            Optimize for Mobile
          </Button>
          
          {isInstallable && !isInstalled && (
            <Button onClick={installApp} className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Install as App
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full justify-start"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Performance
          </Button>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      {isInstallable && !isInstalled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Install Skill Samurai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-blue-700">
                Install Skill Samurai on your device for the best learning experience:
              </p>
              <div className="space-y-2 text-sm text-blue-600">
                {deviceInfo.platform === 'ios' && (
                  <>
                    <p>1. Tap the Share button in Safari</p>
                    <p>2. Tap "Add to Home Screen"</p>
                    <p>3. Tap "Add" to install</p>
                  </>
                )}
                {deviceInfo.platform === 'android' && (
                  <>
                    <p>1. Tap the menu button in Chrome</p>
                    <p>2. Tap "Install app" or "Add to Home screen"</p>
                    <p>3. Tap "Install" to confirm</p>
                  </>
                )}
                {deviceInfo.platform === 'desktop' && (
                  <>
                    <p>1. Click the install button that appears</p>
                    <p>2. Click "Install" in the dialog</p>
                    <p>3. The app will be available in your applications</p>
                  </>
                )}
              </div>
              <Button onClick={installApp} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Install Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileAppOptimizer;