import React, { createContext, useContext, useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

const PWAContext = createContext();

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export const PWAProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [offlineData, setOfflineData] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setIsInstallable(true);
      window.installPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      const wb = new Workbox('/sw.js');

      wb.addEventListener('installed', (event) => {
        console.log('Service Worker installed:', event);
      });

      wb.addEventListener('controlling', (event) => {
        console.log('Service Worker is controlling the page:', event);
        window.location.reload();
      });

      wb.addEventListener('waiting', (event) => {
        console.log('New Service Worker waiting:', event);
        setWaitingWorker(event.wb);
      });

      wb.register()
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return 'denied';
  };

  const installApp = async () => {
    if (!window.installPrompt) return false;

    try {
      const result = await window.installPrompt.prompt();
      const outcome = await result.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setIsInstalled(true);
        return true;
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
    
    return false;
  };

  const skipWaiting = () => {
    if (waitingWorker) {
      waitingWorker.messageSkipWaiting();
      setWaitingWorker(null);
    }
  };

  const subscribeToPush = async () => {
    if (!swRegistration) return null;

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  };

  const showNotification = (title, options = {}) => {
    if (notificationPermission === 'granted' && swRegistration) {
      return swRegistration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });
    }
  };

  const scheduleNotification = (title, options = {}, delay) => {
    setTimeout(() => {
      showNotification(title, options);
    }, delay);
  };

  const saveOfflineData = async (data) => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      
      await store.add({
        ...data,
        id: Date.now(),
        timestamp: new Date().toISOString()
      });

      setOfflineData(prev => [...prev, data]);
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) return false;

    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      const getAllRequest = store.getAll();
      
      const data = await new Promise((resolve, reject) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });

      // Sync each piece of data
      for (const item of data) {
        try {
          await fetch('/api/progress/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
        } catch (error) {
          console.error('Failed to sync item:', item, error);
        }
      }

      // Clear synced data
      await store.clear();
      setOfflineData([]);
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  };

  const openOfflineDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SkillSamuraiOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
      };
    });
  };

  const cacheLesson = async (lesson) => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['lessons'], 'readwrite');
      const store = transaction.objectStore('lessons');
      
      await store.put({
        ...lesson,
        cachedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to cache lesson:', error);
      return false;
    }
  };

  const getCachedLessons = async () => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['lessons'], 'readonly');
      const store = transaction.objectStore('lessons');
      const getAllRequest = store.getAll();
      
      return await new Promise((resolve, reject) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });
    } catch (error) {
      console.error('Failed to get cached lessons:', error);
      return [];
    }
  };

  const value = {
    isOnline,
    isInstallable,
    isInstalled,
    waitingWorker,
    notificationPermission,
    offlineData,
    installApp,
    skipWaiting,
    requestNotificationPermission,
    subscribeToPush,
    showNotification,
    scheduleNotification,
    saveOfflineData,
    syncOfflineData,
    cacheLesson,
    getCachedLessons
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};