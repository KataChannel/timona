// Service Worker for rausachcore PWA
// Version: 1.0.0

const CACHE_VERSION = 'rausachcore-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first', 
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Resources to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  // Add your static assets here
  '/static/js/main.js',
  '/static/css/main.css',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/tasks',
  '/api/users',
  '/api/projects',
  '/graphql'
];

// Maximum age for different cache types (in milliseconds)
const CACHE_MAX_AGE = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000, // 5 minutes
  DYNAMIC: 24 * 60 * 60 * 1000, // 24 hours
};

// Background sync tag for offline actions
const BACKGROUND_SYNC_TAG = 'rausachcore-background-sync';

// IndexedDB for offline data storage
let db;

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Initialize IndexedDB
      initIndexedDB(),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    // Handle POST/PUT/DELETE for offline sync
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      event.respondWith(handleOfflineWrite(request));
    }
    return;
  }
  
  // Determine cache strategy based on request type
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Background sync event - handle offline actions
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(syncOfflineActions());
  }
});

// Push notification event
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received');
  
  let notificationData = {
    title: 'Thông báo mới',
    body: 'Bạn có thông báo mới',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {}
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: notificationData.badge,
        data: data.data || {}
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    data: notificationData.data,
    tag: notificationData.data.notificationId || 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Xem',
      },
      {
        action: 'close',
        title: 'Đóng',
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/';
  
  if (event.action === 'view' || event.action === '') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Check if there's already a window open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if no matching window found
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Helper Functions

// Initialize IndexedDB for offline storage
async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rausachcoreOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = event => {
      const database = event.target.result;
      
      // Create object stores
      if (!database.objectStoreNames.contains('tasks')) {
        const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('priority', 'priority', { unique: false });
        taskStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      if (!database.objectStoreNames.contains('offlineActions')) {
        database.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!database.objectStoreNames.contains('cache')) {
        database.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

// Check if request is for static asset
function isStaticAsset(url) {
  return url.pathname.startsWith('/static/') || 
         url.pathname.includes('.') || 
         STATIC_ASSETS.includes(url.pathname);
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.pathname.startsWith('/graphql') ||
         CACHEABLE_APIS.some(api => url.pathname.startsWith(api));
}

// Handle static asset requests (Cache First strategy)
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: STATIC_CACHE });
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Static asset fetch failed:', error);
    return caches.match('/offline');
  }
}

// Handle API requests (Network First with fallback to cache)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      
      // Also store in IndexedDB for offline access
      await storeDataInIndexedDB(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] API request failed, trying cache:', error);
    
    // Try cache first
    const cachedResponse = await caches.match(request, { cacheName: API_CACHE });
    if (cachedResponse && !isExpired(cachedResponse, CACHE_MAX_AGE.API)) {
      return cachedResponse;
    }
    
    // Try IndexedDB
    const offlineData = await getDataFromIndexedDB(request);
    if (offlineData) {
      return new Response(JSON.stringify(offlineData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This data is not available offline',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle dynamic requests (Stale While Revalidate)
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached response immediately if available
  if (cachedResponse) {
    // Revalidate in background
    fetch(request).then(response => {
      if (response && response.status === 200) {
        cache.put(request, response);
      }
    }).catch(console.log);
    
    return cachedResponse;
  }
  
  // No cache, try network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return caches.match('/offline');
  }
}

// Handle offline write operations
async function handleOfflineWrite(request) {
  try {
    // Try network first
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Store for background sync
    await storeOfflineAction(request);
    
    // Return optimistic response
    return new Response(JSON.stringify({
      success: true,
      offline: true,
      message: 'Action queued for sync when online'
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Store offline action for background sync
async function storeOfflineAction(request) {
  if (!db) await initIndexedDB();
  
  const transaction = db.transaction(['offlineActions'], 'readwrite');
  const store = transaction.objectStore('offlineActions');
  
  const action = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  };
  
  await store.add(action);
  
  // Register for background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    await self.registration.sync.register(BACKGROUND_SYNC_TAG);
  }
}

// Sync offline actions when network is available
async function syncOfflineActions() {
  if (!db) await initIndexedDB();
  
  const transaction = db.transaction(['offlineActions'], 'readwrite');
  const store = transaction.objectStore('offlineActions');
  const actions = await store.getAll();
  
  for (const action of actions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      
      // Remove successful action
      await store.delete(action.id);
      
      // Notify clients of successful sync
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_SUCCESS',
            action: action
          });
        });
      });
    } catch (error) {
      console.log('[ServiceWorker] Sync failed for action:', action, error);
    }
  }
}

// Store API response data in IndexedDB
async function storeDataInIndexedDB(request, response) {
  if (!db) return;
  
  try {
    const url = new URL(request.url);
    const data = await response.json();
    
    if (url.pathname.includes('/tasks')) {
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      
      if (Array.isArray(data)) {
        data.forEach(task => store.put(task));
      } else if (data.id) {
        store.put(data);
      }
    }
    
    // Store in general cache
    const cacheTransaction = db.transaction(['cache'], 'readwrite');
    const cacheStore = cacheTransaction.objectStore('cache');
    
    await cacheStore.put({
      key: request.url,
      data: data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.log('[ServiceWorker] Error storing data in IndexedDB:', error);
  }
}

// Get data from IndexedDB
async function getDataFromIndexedDB(request) {
  if (!db) return null;
  
  try {
    const url = new URL(request.url);
    
    if (url.pathname.includes('/tasks')) {
      const transaction = db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      return await store.getAll();
    }
    
    // Check general cache
    const cacheTransaction = db.transaction(['cache'], 'readonly');
    const cacheStore = cacheTransaction.objectStore('cache');
    const cached = await cacheStore.get(request.url);
    
    if (cached && !isExpired(cached, CACHE_MAX_AGE.API)) {
      return cached.data;
    }
    
    return null;
  } catch (error) {
    console.log('[ServiceWorker] Error getting data from IndexedDB:', error);
    return null;
  }
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  if (!response) return true;
  
  const dateHeader = response.headers?.get('date') || response.timestamp;
  if (!dateHeader) return true;
  
  const responseTime = new Date(dateHeader).getTime();
  return (Date.now() - responseTime) > maxAge;
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[ServiceWorker] Service Worker loaded successfully');