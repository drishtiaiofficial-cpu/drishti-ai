export const APP = {
  name: 'DRISHTI',
  tagline_hi: 'आपका AI सहायक',
  tagline_en: 'Your AI Guide',
  version: '1.0.0',
  email: 'support@drishti.ai',
  website: 'https://drishti.ai',
  playStore: 'https://play.google.com/store/apps/details?id=com.drishti.ai',
  appStore: 'https://apps.apple.com/app/drishti-ai',
};

export const ERRORS = {
  noInternet: 'Internet connection नहीं है। Offline mode में हैं।',
  serverDown: 'Server busy है। थोड़ी देर बाद try करो।',
  apiError: 'API से connect नहीं हो पाया।',
  limitReached: 'आज की limit पूरी हो गई।',
  invalidEmail: 'सही Email डालो।',
  weakPassword: 'Password कम से कम 6 characters का होना चाहिए।',
  wrongCredentials: 'Email या Password गलत है।',
  timeout: 'Server response में time लग रहा है। दोबारा try करो।',
};

export const SUCCESS = {
  loggedIn: 'Login हो गया! 🎉',
  registered: 'Account बन गया! 🎉',
  saved: 'Save हो गया! ✅',
  copied: 'Copy हो गया! ✅',
};

export default { APP, ERRORS, SUCCESS };
