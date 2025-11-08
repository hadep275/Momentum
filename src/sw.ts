/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Extend ServiceWorkerGlobalScope for Workbox
declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: any;
  }
}

// Notification schedule interface
interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  triggerTime: number;
  notified?: boolean;
  type: 'task' | 'habit';
}

// Service Worker for background notifications
const CACHE_NAME = 'momentum-v1';
const DB_NAME = 'momentum-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'schedules';

// Workbox manifest injection point - this will be replaced by Workbox
const manifest = self.__WB_MANIFEST;
console.log('Service Worker loaded with manifest:', manifest);

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Get all notification schedules
async function getSchedules(): Promise<NotificationSchedule[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting schedules:', error);
    return [];
  }
}

// Check and show notifications
async function checkNotifications() {
  try {
    const schedules = await getSchedules();
    const now = Date.now();
    
    for (const schedule of schedules) {
      // Skip if already notified or not yet time
      if (schedule.notified || now < schedule.triggerTime) continue;
      
      // Check if within notification window (trigger time to 5 min after)
      if (now >= schedule.triggerTime && now <= schedule.triggerTime + (5 * 60 * 1000)) {
        // Show notification
        await self.registration.showNotification(schedule.title, {
          body: schedule.body,
          icon: '/momentum-logo.png',
          badge: '/momentum-logo.png',
          tag: schedule.id,
          requireInteraction: false,
        } as NotificationOptions);
        
        // Mark as notified
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        schedule.notified = true;
        store.put(schedule);
      }
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
}

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    checkNotifications();
  }
});

// Check notifications periodically (every minute when SW is active)
setInterval(() => {
  checkNotifications();
}, 60000);

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

// Basic fetch handler with cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});