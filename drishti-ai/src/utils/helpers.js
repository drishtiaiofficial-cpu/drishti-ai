// ============================================
// DRISHTI - Helper Functions
// ============================================

export const getGreeting = (language = 'hi') => {
  const hour = new Date().getHours();
  const greetings = {
    hi: {
      morning: 'सुप्रभात! ☀️',
      afternoon: 'नमस्ते! 👋',
      evening: 'शुभ संध्या! 🌅',
      night: 'शुभ रात्रि! 🌙',
    },
    en: {
      morning: 'Good Morning! ☀️',
      afternoon: 'Hello! 👋',
      evening: 'Good Evening! 🌅',
      night: 'Good Night! 🌙',
    },
  };
  const lang = greetings[language] || greetings.hi;
  if (hour < 12) return lang.morning;
  if (hour < 17) return lang.afternoon;
  if (hour < 21) return lang.evening;
  return lang.night;
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
};

export const truncate = (str, length = 50) =>
  str?.length > length ? str.substring(0, length) + '...' : str;

export const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const isValidEmail = (email) =>
  email?.trim() && email.includes('@') && email.includes('.');

export const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export default {
  getGreeting, formatTime, truncate,
  generateSessionId, isValidEmail, capitalizeFirst,
};
