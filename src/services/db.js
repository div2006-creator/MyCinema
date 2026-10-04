/**
 * MYCINEMA - IndexedDB Permanent Browser Database
 * Provides multi-tier database storage for:
 * 1. User accounts & cryptographic password hashes
 * 2. Active permanent device sessions
 * 3. Continue Watching & playback history
 */

const DB_NAME = 'MyCinemaDB';
const DB_VERSION = 2;

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;
  if (typeof window === 'undefined' || !window.indexedDB) return null;

  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // User Accounts Store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'username' });
        }
        // Active Session Store (Permanent Device Token)
        if (!db.objectStoreNames.contains('session')) {
          db.createObjectStore('session', { keyPath: 'id' });
        }
        // Continue Watching & Playback History Store
        if (!db.objectStoreNames.contains('watchHistory')) {
          db.createObjectStore('watchHistory', { keyPath: 'movieId' });
        }
      };

      req.onsuccess = () => {
        dbInstance = req.result;
        resolve(dbInstance);
      };

      req.onerror = (err) => {
        console.warn('IndexedDB open error, falling back to localStorage:', err);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB not supported or accessible:', err);
      resolve(null);
    }
  });
}

/**
 * Save user account to IndexedDB
 */
export async function idbSaveUser(user) {
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      store.put(user);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Get all registered users from IndexedDB
 */
export async function idbGetAllUsers() {
  const db = await getDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Save permanent device session to IndexedDB
 */
export async function idbSaveSession(sessionData) {
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('session', 'readwrite');
      const store = tx.objectStore('session');
      store.put({ id: 'active_device_session', ...sessionData, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Get permanent device session from IndexedDB
 */
export async function idbGetSession() {
  const db = await getDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('session', 'readonly');
      const store = tx.objectStore('session');
      const req = store.get('active_device_session');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Clear permanent device session from IndexedDB (Only called on explicit logout)
 */
export async function idbClearSession() {
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('session', 'readwrite');
      const store = tx.objectStore('session');
      store.delete('active_device_session');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

const WATCH_HISTORY_STORAGE_KEY = 'mycinema_watch_history';

/**
 * Save or update item in Continue Watching history
 */
export async function idbSaveWatchHistory(item) {
  if (!item || !item.movieId) return false;

  const historyItem = {
    movieId: String(item.movieId),
    id: item.id || item.movieId,
    title: item.title,
    posterUrl: item.posterUrl || item.image,
    year: item.year,
    rating: item.rating,
    type: item.type || 'Movie',
    isAnime: Boolean(item.isAnime),
    hasHindiDub: Boolean(item.hasHindiDub),
    season: item.season || 1,
    episode: item.episode || 1,
    totalEpisodes: item.totalEpisodes || 1,
    progressPercent: item.progressPercent || 35,
    server: item.server || 'vidlink',
    lastWatched: Date.now()
  };

  // 1. Sync immediately to localStorage for 0ms render
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = [historyItem, ...list.filter(x => x.movieId !== historyItem.movieId)].slice(0, 15);
    localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('LocalStorage watch history save error:', err);
  }

  // 2. Persist to IndexedDB
  const db = await getDB();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('watchHistory', 'readwrite');
      const store = tx.objectStore('watchHistory');
      store.put(historyItem);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Get all Continue Watching items sorted by last watched
 */
export async function idbGetWatchHistory() {
  // 1. Instant return from localStorage
  let localList = [];
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
    if (raw) localList = JSON.parse(raw);
  } catch {}

  // 2. Retrieve from IndexedDB to ensure consistency
  const db = await getDB();
  if (!db) return localList;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('watchHistory', 'readonly');
      const store = tx.objectStore('watchHistory');
      const req = store.getAll();
      req.onsuccess = () => {
        const dbList = req.result || [];
        const mergedMap = new Map();
        [...localList, ...dbList].forEach(item => {
          if (!mergedMap.has(item.movieId) || (item.lastWatched > mergedMap.get(item.movieId).lastWatched)) {
            mergedMap.set(item.movieId, item);
          }
        });
        const sorted = Array.from(mergedMap.values()).sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
        resolve(sorted.slice(0, 15));
      };
      req.onerror = () => resolve(localList);
    } catch {
      resolve(localList);
    }
  });
}

/**
 * Remove an item from Continue Watching history
 */
export async function idbRemoveWatchHistory(movieId) {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw).filter(x => x.movieId !== String(movieId));
      localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {}

  const db = await getDB();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction('watchHistory', 'readwrite');
      const store = tx.objectStore('watchHistory');
      store.delete(String(movieId));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}
