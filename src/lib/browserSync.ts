/**
 * Browser Sync - Hybrid localStorage + chrome.storage.sync
 * Uses localStorage as primary storage, syncs to chrome.storage.sync for cross-device sync
 */

// Type declarations for Chrome Storage API
declare global {
  interface Window {
    chrome?: {
      storage?: {
        sync?: {
          set: (items: Record<string, any>) => Promise<void>;
          get: (keys: string[]) => Promise<Record<string, any>>;
          remove: (keys: string[]) => Promise<void>;
        };
      };
    };
  }
}

const SYNC_PREFIX = "momentum_sync_";
const SYNC_TIMESTAMP_SUFFIX = "_timestamp";

interface SyncData<T> {
  data: T;
  timestamp: number;
}

/**
 * Check if chrome.storage.sync is available
 */
export const isSyncAvailable = (): boolean => {
  return typeof window !== "undefined" &&
         typeof window.chrome !== "undefined" && 
         window.chrome.storage?.sync !== undefined;
};

/**
 * Save data to both localStorage and chrome.storage.sync
 */
export const syncSave = async <T>(key: string, data: T): Promise<void> => {
  const syncKey = SYNC_PREFIX + key;
  const timestampKey = syncKey + SYNC_TIMESTAMP_SUFFIX;
  const timestamp = Date.now();

  // Always save to localStorage first (primary storage)
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage:`, error);
    throw error;
  }

  // Try to sync to chrome.storage.sync (background sync)
  if (isSyncAvailable() && window.chrome?.storage?.sync) {
    try {
      const syncData: SyncData<T> = { data, timestamp };
      await window.chrome.storage.sync.set({
        [syncKey]: syncData,
      });
    } catch (error) {
      // Silently fail if sync is not available or quota exceeded
      console.warn(`Browser sync failed for ${key}:`, error);
    }
  }
};

/**
 * Load data from localStorage, merge with chrome.storage.sync if available
 */
export const syncLoad = async <T>(key: string, defaultValue: T): Promise<T> => {
  // Load from localStorage (always available)
  const localData = localStorage.getItem(key);
  let parsedLocalData: T = defaultValue;
  let localTimestamp = 0;

  if (localData) {
    try {
      parsedLocalData = JSON.parse(localData);
      // Try to get timestamp from a separate key for backwards compatibility
      const timestampKey = key + "_timestamp";
      const storedTimestamp = localStorage.getItem(timestampKey);
      localTimestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : 0;
    } catch (e) {
      console.error(`Failed to parse data from localStorage:`, e);
    }
  }

  // Try to load from chrome.storage.sync and merge
  if (isSyncAvailable() && window.chrome?.storage?.sync) {
    try {
      const syncKey = SYNC_PREFIX + key;
      const result = await window.chrome.storage.sync.get([syncKey]);
      const syncData: SyncData<T> | undefined = result[syncKey];

      if (syncData && syncData.timestamp > localTimestamp) {
        // Chrome sync data is newer, use it and update localStorage
        localStorage.setItem(key, JSON.stringify(syncData.data));
        localStorage.setItem(key + "_timestamp", syncData.timestamp.toString());
        return syncData.data;
      }
    } catch (error) {
      // Silently fail - sync is optional
    }
  }

  // Return local data (either no sync data or local is newer)
  return parsedLocalData;
};

/**
 * Clear sync data for a specific key
 */
export const syncClear = async (key: string): Promise<void> => {
  localStorage.removeItem(key);
  localStorage.removeItem(key + "_timestamp");

  if (isSyncAvailable() && window.chrome?.storage?.sync) {
    try {
      const syncKey = SYNC_PREFIX + key;
      await window.chrome.storage.sync.remove([syncKey]);
    } catch (error) {
      console.warn(`Failed to clear browser sync for ${key}:`, error);
    }
  }
};

/**
 * Clear all sync data
 */
export const syncClearAll = async (keys: string[]): Promise<void> => {
  for (const key of keys) {
    await syncClear(key);
  }
};
