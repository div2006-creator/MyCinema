/**
 * AETHER CINEMA - IndexedDB Permanent Browser Database
 * Provides multi-tier database storage for registered users, sessions, and preferences
 * so the user remains logged in permanently on the same device until explicit logout.
 */

const DB_NAME = 'AetherCinemaDB';
const DB_VERSION = 1;

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
