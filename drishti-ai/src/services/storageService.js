// ============================================
// DRISHTI - Storage Service
// localStorage wrapper - future में AsyncStorage
// ============================================

const storage = {
  get: (key, defaultValue = null) => {
    try {
      const val = localStorage.getItem(key);
      if (val === null) return defaultValue;
      try { return JSON.parse(val); } catch { return val; }
    } catch { return defaultValue; }
  },

  set: (key, value) => {
    try {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, val);
      return true;
    } catch { return false; }
  },

  remove: (key) => {
    try { localStorage.removeItem(key); return true; }
    catch { return false; }
  },

  clear: () => {
    try { localStorage.clear(); return true; }
    catch { return false; }
  },
};

// User Data
export const getUserData = () => ({
  name: storage.get('userName', 'User'),
  email: storage.get('userEmail', ''),
  uid: storage.get('uid', null),
  plan: storage.get('userPlan', 'free'),
  isLoggedIn: storage.get('isLoggedIn', false),
  hasOnboarded: storage.get('hasOnboarded', false),
  language: storage.get('appLanguage', 'hi'),
  selectedVoice: storage.get('selectedVoice', 'didi'),
});

export const setUserData = (data) => {
  Object.entries(data).forEach(([key, value]) => {
    const keyMap = {
      name: 'userName', email: 'userEmail',
      uid: 'uid', plan: 'userPlan',
      isLoggedIn: 'isLoggedIn', hasOnboarded: 'hasOnboarded',
      language: 'appLanguage', voice: 'selectedVoice',
    };
    const storageKey = keyMap[key] || key;
    storage.set(storageKey, value);
  });
};

// Usage Tracking
export const getUsageToday = () => {
  const key = `usage_${new Date().toDateString()}`;
  return storage.get(key, 0);
};

export const incrementUsage = () => {
  const key = `usage_${new Date().toDateString()}`;
  const current = storage.get(key, 0);
  storage.set(key, current + 1);
  return current + 1;
};

// BYOK Keys
export const getBYOKSlots = () => storage.get('byok_keys', []);
export const saveBYOKSlots = (slots) => storage.set('byok_keys', slots);
export const isBYOKEnabled = () => storage.get('byok_enabled', false) === true ||
  storage.get('byok_enabled', false) === 'true';

export default storage;
