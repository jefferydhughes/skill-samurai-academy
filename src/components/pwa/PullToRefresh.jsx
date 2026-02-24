import React, { useState, useEffect, useRef } from 'react';
import { usePWA } from '@/lib/PWAContext';
import { Loader2, RefreshCw } from 'lucide-react';

const PullToRefresh = ({ children, onRefresh, disabled = false }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isOnline } = usePWA();
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef(null);
  
  const pullThreshold = 80;
  const maxPull = 120;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e) => {
      // Only enable pull-to-refresh at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling || startY.current === 0) return;
      
      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;
      
      if (deltaY > 0) {
        e.preventDefault();
        const pullDistance = Math.min(deltaY * 0.5, maxPull);
        setPullDistance(pullDistance);
        
        // Apply transform for visual feedback
        container.style.transform = `translateY(${pullDistance}px)`;
        container.style.transition = 'none';
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;
      
      setIsPulling(false);
      
      if (pullDistance >= pullThreshold && !isRefreshing && isOnline) {
        // Trigger refresh
        setIsRefreshing(true);
        setPullDistance(pullThreshold);
        
        // Reset transform with animation
        container.style.transform = `translateY(${pullThreshold}px)`;
        container.style.transition = 'transform 0.3s ease-out';
        
        // Execute refresh callback
        const refreshPromise = onRefresh ? onRefresh() : Promise.resolve();
        
        refreshPromise.finally(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          container.style.transform = 'translateY(0)';
          
          // Reset transition after animation
          setTimeout(() => {
            container.style.transition = 'none';
          }, 300);
        });
      } else {
        // Snap back
        setPullDistance(0);
        container.style.transform = 'translateY(0)';
        container.style.transition = 'transform 0.2s ease-out';
        
        setTimeout(() => {
          container.style.transition = 'none';
        }, 200);
      }
      
      startY.current = 0;
      currentY.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh, disabled, isOnline]);

  const getPullIndicator = () => {
    if (isRefreshing) {
      return {
        icon: <Loader2 className="w-6 h-6 animate-spin" />,
        text: 'Refreshing...',
        color: 'text-blue-600'
      };
    } else if (pullDistance >= pullThreshold) {
      return {
        icon: <RefreshCw className="w-6 h-6" />,
        text: 'Release to refresh',
        color: 'text-green-600'
      };
    } else if (pullDistance > 0) {
      return {
        icon: <RefreshCw className="w-6 h-6 opacity-50" />,
        text: 'Pull to refresh',
        color: 'text-gray-600'
      };
    }
    return null;
  };

  const indicator = getPullIndicator();

  return (
    <div className="relative">
      {/* Pull indicator */}
      {indicator && (
        <div 
          className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center bg-white border-b transition-opacity duration-200"
          style={{ 
            height: `${Math.min(pullDistance, maxPull)}px`,
            opacity: pullDistance > 0 ? 1 : 0
          }}
        >
          <div className={`mb-2 ${indicator.color}`}>
            {indicator.icon}
          </div>
          <span className={`text-sm ${indicator.color}`}>
            {indicator.text}
          </span>
        </div>
      )}
      
      {/* Content container */}
      <div 
        ref={containerRef}
        className="w-full"
        style={{ 
          transform: 'translateY(0)',
          transition: 'none'
        }}
      >
        {children}
      </div>
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-sm bg-orange-100 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-sm text-orange-800">
            You're offline. Some features may be limited.
          </p>
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;