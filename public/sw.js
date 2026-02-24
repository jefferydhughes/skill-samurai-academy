// Service Worker for Skill Samurai PWA
const CACHE_NAME = 'skill-samurai-v1';
const STATIC_CACHE = 'skill-samurai-static-v1';
const API_CACHE = 'skill-samurai-api-v1';
const OFFLINE_CACHE = 'skill-samurai-offline-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static assets as needed
];

const API_ROUTES = [
  '/api/lessons',
  '/api/progress',
  '/api/achievements',
  '/api/schedule'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName.startsWith('skill-samurai-') && 
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== OFFLINE_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle API requests
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network first with fallback
  event.respondWith(handleDefault(request));
});

async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function handleAPIRequest(request) {
  const cacheKey = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });

  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(cacheKey, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache when offline
    const cachedResponse = await caches.match(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for specific API endpoints
    if (request.url.includes('/lessons')) {
      return new Response(JSON.stringify({
        offline: true,
        data: getCachedLessons()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      offline: true,
      message: 'No network connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request) || 
                          await caches.match('/index.html');
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function handleDefault(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

async function syncProgressData() {
  try {
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    
    await clearOfflineData();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = JSON.parse(event.data.text());
    
    event.waitUntil(
      self.registration.showNotification(options.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle specific notification actions
    switch (event.action) {
      case 'view-schedule':
        event.waitUntil(
          clients.openWindow('/schedule')
        );
        break;
      case 'view-lesson':
        event.waitUntil(
          clients.openWindow(event.notification.data?.lessonUrl || '/lessons')
        );
        break;
      default:
        event.waitUntil(
          clients.openWindow('/')
        );
    }
  } else {
    // Default action - focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// IndexedDB helper functions for offline data
async function getOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SkillSamuraiOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function clearOfflineData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SkillSamuraiOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

function getCachedLessons() {
  // Return cached lesson data for offline access
  return [
    {
      id: 'offline-1',
      title: 'Introduction to Coding',
      description: 'Learn the basics of programming',
      progress: 0,
      estimatedTime: '30 min'
    }
  ];
}