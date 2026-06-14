// ============================================
// DRISHTI - Central Configuration
// Plugin-Play: सिर्फ यहाँ बदलो, सब जगह update
// ============================================

export const APP_CONFIG = {
  // App Info
  name: 'DRISHTI',
  version: '1.0.0',
  tagline: 'आपका AI सहायक',

  // Backend Engine
  engine: {
    baseUrl: 'https://drishti-engine.onrender.com',
    endpoints: {
      chat: '/chat',
      vision: '/vision',
      history: '/history',
      register: '/user/register',
      login: '/user/login',
      profile: '/user/profile',
      rateLimits: '/config/rate-limits',
      stats: '/config/stats',
      health: '/health',
    },
    timeout: 35000,
  },

  // Rate Limits
  limits: {
    free: 20,
    pro: 999,
    resetTime: 'daily',
  },

  // Features - ON/OFF करो
  features: {
    byok: true,
    voice: true,
    liveGuardian: false, // Future
    projects: false,     // Future
    offlineMode: false,  // Future
  },

  // Supported Languages
  languages: [
    { code: 'hi', name: 'हिदी', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'বালা', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ],
};

export const getEngineUrl = (endpoint) =>
  `${APP_CONFIG.engine.baseUrl}${APP_CONFIG.engine.endpoints[endpoint]}`;

export const isFeatureEnabled = (feature) =>
  APP_CONFIG.features[feature] || false;

export default APP_CONFIG;
