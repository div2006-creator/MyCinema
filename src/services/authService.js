/**
 * AETHER CINEMA - Authentication & Permanent Database Session Service
 * Uses dual-tier persistence:
 * 1. IndexedDB ("AetherCinemaDB") - permanent browser database that survives tab/browser closes and restarts.
 * 2. localStorage - immediate synchronous cache for 0ms render without flicker.
 * Users remain logged in permanently on the same device until they explicitly click "Log Out".
 */

import { 
  idbSaveUser, 
  idbGetAllUsers, 
  idbSaveSession, 
  idbGetSession, 
  idbClearSession 
} from './db';

const USERS_STORAGE_KEY = 'aether_cinema_users';
const CURRENT_USER_KEY = 'aether_cinema_current_user';
const DEVICE_TOKEN_KEY = 'aether_cinema_device_token';

// Initial pre-registered demo accounts for instant access
const DEFAULT_USERS = [
  {
    username: 'aether_pilot',
    password: 'password123',
    role: 'VIP Voyager',
    createdAt: '2025-01-01',
    avatarColor: 'from-cyan-400 to-blue-600'
  },
  {
    username: 'cyber_runner',
    password: 'password123',
    role: 'Cipher Operative',
    createdAt: '2025-01-15',
    avatarColor: 'from-violet-500 to-fuchsia-600'
  }
];

// In-memory cache for ultra-fast access
let cachedUsers = null;

function getStoredUsersSync() {
  if (cachedUsers) return cachedUsers;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      cachedUsers = [...DEFAULT_USERS];
      // Sync default users to IndexedDB in background
      DEFAULT_USERS.forEach(u => idbSaveUser(u).catch(() => {}));
      return DEFAULT_USERS;
    }
    cachedUsers = JSON.parse(raw);
    return cachedUsers;
  } catch (err) {
    console.error('Error reading stored users:', err);
    return DEFAULT_USERS;
  }
}

function saveUsersSync(users) {
  cachedUsers = users;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
}

/**
 * Synchronous session retrieval for instant React mount
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Restore session from IndexedDB database if localStorage was cleared
 * or verify permanent device authorization.
 */
export async function restoreSessionFromDatabase() {
  try {
    // 1. Check local session
    const localUser = getCurrentUser();
    if (localUser) {
      // Re-verify in background to ensure database has it
      idbSaveSession({ user: localUser }).catch(() => {});
      return localUser;
    }

    // 2. Fallback to IndexedDB permanent database
    const dbSession = await idbGetSession();
    if (dbSession && dbSession.user) {
      // Restore to localStorage for fast access
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(dbSession.user));
      return dbSession.user;
    }

    // Also check if users exist in IndexedDB and sync to local
    const dbUsers = await idbGetAllUsers();
    if (dbUsers && dbUsers.length > 0) {
      const current = getStoredUsersSync();
      const combined = Array.from(new Map([...current, ...dbUsers].map(u => [u.username.toLowerCase(), u])).values());
      saveUsersSync(combined);
    }

    return null;
  } catch (err) {
    console.warn('Database session restore error:', err);
    return null;
  }
}

/**
 * Register a new user and create permanent session in database
 */
export async function registerUser(username, password) {
  const cleanUsername = username?.trim().toLowerCase();
  const cleanPassword = password?.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const users = getStoredUsersSync();
  const exists = users.some(u => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    return { success: false, error: `Username "${cleanUsername}" is already registered. Please sign in or choose another.` };
  }

  const avatarPalettes = [
    'from-cyan-400 to-blue-600',
    'from-violet-500 to-fuchsia-600',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-600',
    'from-rose-500 to-purple-600'
  ];
  const randomColor = avatarPalettes[Math.floor(Math.random() * avatarPalettes.length)];

  const newUser = {
    username: cleanUsername,
    password: cleanPassword,
    role: 'Aether Member',
    createdAt: new Date().toISOString().split('T')[0],
    avatarColor: randomColor
  };

  // 1. Save to local list
  users.push(newUser);
  saveUsersSync(users);

  // 2. Save user account to IndexedDB database
  await idbSaveUser(newUser);

  // 3. Create permanent device session
  const userSession = {
    username: newUser.username,
    role: newUser.role,
    createdAt: newUser.createdAt,
    avatarColor: newUser.avatarColor,
    deviceToken: `aether_dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };

  // Save to localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
  localStorage.setItem(DEVICE_TOKEN_KEY, userSession.deviceToken);

  // Save permanent session to IndexedDB database
  await idbSaveSession({
    user: userSession,
    token: userSession.deviceToken
  });

  return { success: true, user: userSession };
}

/**
 * Log in user and establish permanent database session on device
 */
export async function loginUser(username, password) {
  const cleanUsername = username?.trim().toLowerCase();
  const cleanPassword = password?.trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  const users = getStoredUsersSync();
  let user = users.find(u => u.username.toLowerCase() === cleanUsername);

  // If not found in localStorage, check IndexedDB
  if (!user) {
    const dbUsers = await idbGetAllUsers();
    user = dbUsers.find(u => u.username.toLowerCase() === cleanUsername);
    if (user) {
      users.push(user);
      saveUsersSync(users);
    }
  }

  if (!user || user.password !== cleanPassword) {
    return { success: false, error: 'Invalid username or password. Check your credentials and try again.' };
  }

  const userSession = {
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    avatarColor: user.avatarColor || 'from-cyan-400 to-violet-600',
    deviceToken: `aether_dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };

  // 1. Save to localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
  localStorage.setItem(DEVICE_TOKEN_KEY, userSession.deviceToken);

  // 2. Save to IndexedDB database
  await idbSaveSession({
    user: userSession,
    token: userSession.deviceToken
  });

  return { success: true, user: userSession };
}

/**
 * Explicit Logout - Clears database session and localStorage.
 * The session will ONLY be removed when this is explicitly called.
 */
export async function logoutUser() {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(DEVICE_TOKEN_KEY);
    await idbClearSession();
  } catch (err) {
    console.error('Logout error:', err);
  }
  return { success: true };
}

const AGE_CLEARANCE_KEY = 'aether_cinema_age_clearance';

/**
 * Retrieve verified age clearance from local device cache
 */
export function getStoredAgeClearance() {
  try {
    const raw = localStorage.getItem(AGE_CLEARANCE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save user age verification to persistent database and local cache
 */
export async function saveUserAgeClearance(clearance) {
  try {
    localStorage.setItem(AGE_CLEARANCE_KEY, JSON.stringify(clearance));
    const user = getCurrentUser();
    if (user) {
      user.ageClearance = clearance;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      await idbSaveSession({ user });
    }
  } catch (err) {
    console.warn('Error saving age clearance to database:', err);
  }
}

