// IndexedDB utilities for notification scheduling

const DB_NAME = 'momentum-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'schedules';

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  triggerTime: number; // timestamp
  notified: boolean;
  type: 'task' | 'habit';
}

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

export async function saveNotificationSchedule(schedule: NotificationSchedule): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(schedule);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveNotificationSchedules(schedules: NotificationSchedule[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Clear old schedules first
    store.clear();
    
    // Add new schedules
    schedules.forEach(schedule => store.put(schedule));
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getNotificationSchedules(): Promise<NotificationSchedule[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function clearOldNotifications(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
      const schedules = request.result || [];
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      schedules.forEach(schedule => {
        // Remove if notified and older than 1 day, or if trigger time passed by more than 1 day
        if ((schedule.notified && schedule.triggerTime < oneDayAgo) || 
            schedule.triggerTime < oneDayAgo) {
          store.delete(schedule.id);
        }
      });
      
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

export function notifyServiceWorker(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_NOTIFICATIONS'
    });
  }
}