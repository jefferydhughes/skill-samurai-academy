import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Touch gesture hook
export const useTouchGestures = (elementRef, options = {}) => {
  const [gesture, setGesture] = useState(null);
  const startTouch = useRef(null);
  const currentTouch = useRef(null);
  
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let longPressTimer = null;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startTouch.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      currentTouch.current = { ...startTouch.current };

      // Long press detection
      if (onLongPress) {
        longPressTimer = setTimeout(() => {
          if (startTouch.current && currentTouch.current) {
            onLongPress(e);
          }
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e) => {
      if (!startTouch.current) return;
      
      const touch = e.touches[0];
      currentTouch.current = {
        x: touch.clientX,
        y: touch.clientY
      };

      // Cancel long press on move
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const handleTouchEnd = (e) => {
      if (!startTouch.current || !currentTouch.current) return;

      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      const deltaX = currentTouch.current.x - startTouch.current.x;
      const deltaY = currentTouch.current.y - startTouch.current.y;
      const deltaTime = Date.now() - startTouch.current.time;

      // Determine gesture type
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        // Swipe gesture
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0) {
            setGesture('swipeRight');
            onSwipeLeft?.(e); // Swipe right means content goes left
          } else {
            setGesture('swipeLeft');
            onSwipeRight?.(e); // Swipe left means content goes right
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            setGesture('swipeDown');
            onSwipeDown?.(e);
          } else {
            setGesture('swipeUp');
            onSwipeUp?.(e);
          }
        }
      } else if (deltaTime < 200) {
        // Tap gesture
        setGesture('tap');
        onTap?.(e);
      }

      // Reset
      startTouch.current = null;
      currentTouch.current = null;

      // Clear gesture state after a short delay
      setTimeout(() => setGesture(null), 100);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, options]);

  return gesture;
};

// Mobile-optimized button component
const MobileButton = React.forwardRef(({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  hapticFeedback = true,
  ...props 
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsPressed(false), 100);
  };

  const getButtonStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-150 select-none";
    const sizeStyles = {
      sm: "min-h-[44px] px-3 text-sm",
      default: "min-h-[48px] px-4 text-base",
      lg: "min-h-[52px] px-6 text-lg"
    };
    const variantStyles = {
      default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100",
      ghost: "hover:bg-gray-100 active:bg-gray-200",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
    };

    return cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      isPressed && "scale-95",
      className
    );
  };

  return (
    <button
      ref={ref}
      className={getButtonStyles()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Touch feedback overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-white opacity-0 transition-opacity duration-150",
          isPressed && "opacity-20"
        )}
      />
    </button>
  );
});

MobileButton.displayName = 'MobileButton';

// Swipeable card component
const SwipeableCard = ({ 
  children, 
  className,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  ...props 
}) => {
  const cardRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useTouchGestures(cardRef, {
    onSwipeLeft: () => {
      if (rightAction) {
        rightAction();
      }
    },
    onSwipeRight: () => {
      if (leftAction) {
        leftAction();
      }
    }
  });

  return (
    <div className="relative overflow-hidden">
      {/* Left action (swipe right) */}
      {leftAction && (
        <div className="absolute inset-y-0 left-0 w-20 bg-green-500 flex items-center justify-center z-0">
          {leftAction}
        </div>
      )}
      
      {/* Right action (swipe left) */}
      {rightAction && (
        <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center z-0">
          {rightAction}
        </div>
      )}
      
      {/* Main card content */}
      <div
        ref={cardRef}
        className={cn(
          "relative bg-white border rounded-lg shadow-sm z-10 transition-transform duration-200",
          isDragging && "shadow-lg",
          className
        )}
        style={{
          transform: `translateX(${offset}px)`
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

// Bottom sheet component for mobile
const BottomSheet = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxHeight = '80vh'
}) => {
  const [sheetHeight, setSheetHeight] = useState(0);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      // Animate sheet open
      requestAnimationFrame(() => {
        setSheetHeight(sheetRef.current?.scrollHeight || 0);
      });
    } else {
      setSheetHeight(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-transform duration-300"
        style={{
          transform: `translateY(${isOpen ? 0 : sheetHeight}px)`,
          maxHeight
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {children}
        </div>
      </div>
    </>
  );
};

export { MobileButton, SwipeableCard, BottomSheet };