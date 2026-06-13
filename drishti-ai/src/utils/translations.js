// src/utils/translations.js
// ✅ Multi-Language System
// अभी: Hindi + English
// बाद में: Marathi, Tamil, Telugu add करो

const translations = {

  // ============================================
  // HINDI
  // ============================================
  hi: {
    // Common
    back: '← वापस',
    loading: 'लोड हो रहा है...',
    error: 'कुछ गड़बड़ हुई',
    retry: 'दोबारा try करो',
    save: 'Save करो',
    cancel: 'Cancel',
    yes: 'हाँ',
    no: 'नहीं',
    ok: 'ठीक है',

    // Splash
    splash_tagline: 'आपका AI सहायक • Your AI Guide',
    made_in: 'Made in India 🇮🇳',

    // Login
    login_title: 'शुरू करें',
    login_subtitle: 'अपनी Email डालें',
    login_email_placeholder: 'Email address डालें...',
    login_send_otp: '📨 OTP भेजो →',
    login_sending_otp: '⏳ OTP भेज रहे हैं...',
    login_otp_sent: 'OTP आया! ✅',
    login_otp_note: 'पर OTP भेजा गया',
    login_otp_placeholder: '4 digit OTP डालें...',
    login_verify: '🔮 DRISHTI खोलो',
    login_verifying: '⏳ Verify हो रहा है...',
    login_back: '← वापस जाएं',
    login_error_email: 'सही Email address डालें',
    login_error_otp: '4 digit OTP डालें',
    login_error_wrong_otp: 'गलत OTP है। दोबारा try करें।',

    // Onboarding
    onboarding_next: 'आगे →',
    onboarding_start: '🚀 शुरू करें!',
    onboarding_skip: 'Skip →',
    onboarding_slides: [
      {
        icon: '🔮',
        title: 'DRISHTI में आपका स्वागत है!',
        subtitle: 'भारत का पहला Hindi AI Assistant जो आपकी मदद करता है।',
      },
      {
        icon: '💬',
        title: 'Chat करो - Hindi में!',
        subtitle: 'Hindi, Hinglish, English - जिस भाषा में बोलो, उसी में जवाब मिलेगा।',
      },
      {
        icon: '👁️',
        title: 'Live Guardian',
        subtitle: 'Screen पर glowing arrow दिखेगा। DRISHTI आपको step-by-step guide करेगी।',
      },
      {
        icon: '🎙️',
        title: '"Hey दृष्टि" बोलो!',
        subtitle: 'बस इतना बोलो - DRISHTI जाग जाएगी और आपकी मदद करेगी।',
      },
    ],

    // Dashboard
    greeting_morning: 'सुप्रभात! ☀️',
    greeting_afternoon: 'नमस्ते! 👋',
    greeting_evening: 'शुभ संध्या! 🌅',
    greeting_night: 'शुभ रात्रि! 🌙',
    dashboard_subtitle: 'आज क्या सीखेंगे?',
    dashboard_streak: '🔥 दिन streak!',
    dashboard_streak_sub: 'कल UPI guide complete किया था',
    dashboard_complete: 'complete',
    dashboard_quick: '⚡ Quick Actions',
    menu_chat: 'Chat करो',
    menu_chat_sub: 'DRISHTI से बात करो',
    menu_guardian: 'Live Guardian',
    menu_guardian_sub: 'Screen guide करो',
    menu_voice: 'दृष्टि से बात करो',
    menu_voice_sub: 'Hey दृष्टि बोलो',
    menu_progress: 'Progress',
    menu_progress_sub: 'क्या सीखा देखो',

    // Chat
    chat_placeholder: 'कुछ भी पूछो...',
    chat_listening: '🎙️ सुन रही हूँ',
    chat_thinking: 'सोच रही हूँ...',
    chat_online: 'Online',
    chat_welcome: 'नमस्ते! 🙏 मैं DRISHTI हूँ।\n\n📎 से Photo/PDF भेजो\n🎙 Mic से बोलो\n\nSettings में API key add करो unlimited के लिए।',
    chat_attach_title: '📎 क्या भेजना है?',
    chat_error: 'कुछ गड़बड़ हुई। दोबारा try करो! 🔄',

    // Voice
    voice_press_mic: 'Mic दबाओ और बोलो',
    voice_listening: 'सुन रही हूँ...',
    voice_thinking: 'सोच रही हूँ...',
    voice_speaking: 'बोल रही हूँ...',
    voice_you_said: 'आपने कहा:',

    // Progress
    progress_title: '📊 Progress',
    progress_streak: 'दिन Streak',
    progress_learned: 'चीज़ें सीखीं',
    progress_time: 'Total Time',
    progress_skills: '⚡ Skills Progress',
    progress_badges: '🏅 Badges',
    progress_done: '✅ Done!',

    // Settings
    settings_title: '⚙️ Settings',
    settings_upgrade: '⚡ Pro में Upgrade करो - ₹99/month',
    settings_voice_title: '🎙️ DRISHTI की आवाज़',
    settings_voice_sub: 'Select करो → automatically preview सुनाई देगा',
    settings_general: '🔧 General',
    settings_hindi_mode: '🌐 Hindi Mode',
    settings_hindi_desc: 'Hindi में जवाब मिलेगा',
    settings_notif: '🔔 Notifications',
    settings_notif_desc: 'Daily reminder आएगा',
    settings_dark: '🌙 Dark Mode',
    settings_dark_desc: 'Dark theme रहेगा',
    settings_apis: '🤖 My APIs (BYOK)',
    settings_apis_desc: 'अपनी API add करो = Unlimited + बिल्कुल FREE!',
    settings_manage_apis: '🔑 APIs Manage करो →',
    settings_legal: '⚖️ Legal & Support',
    settings_logout: '🚪 Logout',
    settings_free_plan: 'Free Plan',

    // Errors / Limits
    limit_reached: 'free messages पूरे हो गए! 🔑 Settings → My APIs में अपनी key add करो unlimited के लिए।',
    api_error: 'API key से connect नहीं हो पाया। Settings में check करो। 🔑',
    backend_error: 'अभी server busy है। थोड़ी देर में try करो या API key add करो! 🔑',
  },

  // ============================================
  // ENGLISH
  // ============================================
  en: {
    // Common
    back: '← Back',
    loading: 'Loading...',
    error: 'Something went wrong',
    retry: 'Try again',
    save: 'Save',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',

    // Splash
    splash_tagline: 'Your AI Assistant • आपका AI Guide',
    made_in: 'Made in India 🇮🇳',

    // Login
    login_title: 'Get Started',
    login_subtitle: 'Enter your Email',
    login_email_placeholder: 'Enter email address...',
    login_send_otp: '📨 Send OTP →',
    login_sending_otp: '⏳ Sending OTP...',
    login_otp_sent: 'OTP Sent! ✅',
    login_otp_note: 'OTP sent to',
    login_otp_placeholder: 'Enter 4 digit OTP...',
    login_verify: '🔮 Open DRISHTI',
    login_verifying: '⏳ Verifying...',
    login_back: '← Go Back',
    login_error_email: 'Please enter a valid email',
    login_error_otp: 'Please enter 4 digit OTP',
    login_error_wrong_otp: 'Wrong OTP. Please try again.',

    // Onboarding
    onboarding_next: 'Next →',
    onboarding_start: '🚀 Get Started!',
    onboarding_skip: 'Skip →',
    onboarding_slides: [
      {
        icon: '🔮',
        title: 'Welcome to DRISHTI!',
        subtitle: "India's first Hindi AI Assistant that guides you step by step.",
      },
      {
        icon: '💬',
        title: 'Chat in Hindi!',
        subtitle: 'Hindi, Hinglish, English - get answers in any language you speak.',
      },
      {
        icon: '👁️',
        title: 'Live Guardian',
        subtitle: 'A glowing arrow appears on screen. DRISHTI guides you step by step.',
      },
      {
        icon: '🎙️',
        title: 'Say "Hey Drishti"!',
        subtitle: 'Just say it - DRISHTI wakes up and helps you instantly.',
      },
    ],

    // Dashboard
    greeting_morning: 'Good Morning! ☀️',
    greeting_afternoon: 'Hello! 👋',
    greeting_evening: 'Good Evening! 🌅',
    greeting_night: 'Good Night! 🌙',
    dashboard_subtitle: "What will we learn today?",
    dashboard_streak: '🔥 Day Streak!',
    dashboard_streak_sub: 'Completed UPI guide yesterday',
    dashboard_complete: 'complete',
    dashboard_quick: '⚡ Quick Actions',
    menu_chat: 'Chat',
    menu_chat_sub: 'Talk to DRISHTI',
    menu_guardian: 'Live Guardian',
    menu_guardian_sub: 'Guide on screen',
    menu_voice: 'Talk to Drishti',
    menu_voice_sub: 'Say Hey Drishti',
    menu_progress: 'Progress',
    menu_progress_sub: 'See what you learned',

    // Chat
    chat_placeholder: 'Ask anything...',
    chat_listening: '🎙️ Listening',
    chat_thinking: 'Thinking...',
    chat_online: 'Online',
    chat_welcome: 'Hello! 🙏 I am DRISHTI.\n\n📎 Send Photo/PDF\n🎙 Speak with Mic\n\nAdd API key in Settings for unlimited use.',
    chat_attach_title: '📎 What to send?',
    chat_error: 'Something went wrong. Please try again! 🔄',

    // Voice
    voice_press_mic: 'Press Mic and speak',
    voice_listening: 'Listening...',
    voice_thinking: 'Thinking...',
    voice_speaking: 'Speaking...',
    voice_you_said: 'You said:',

    // Progress
    progress_title: '📊 Progress',
    progress_streak: 'Day Streak',
    progress_learned: 'Things Learned',
    progress_time: 'Total Time',
    progress_skills: '⚡ Skills Progress',
    progress_badges: '🏅 Badges',
    progress_done: '✅ Done!',

    // Settings
    settings_title: '⚙️ Settings',
    settings_upgrade: '⚡ Upgrade to Pro - ₹99/month',
    settings_voice_title: "🎙️ DRISHTI's Voice",
    settings_voice_sub: 'Select → preview will play automatically',
    settings_general: '🔧 General',
    settings_hindi_mode: '🌐 Hindi Mode',
    settings_hindi_desc: 'Get answers in Hindi',
    settings_notif: '🔔 Notifications',
    settings_notif_desc: 'Get daily reminders',
    settings_dark: '🌙 Dark Mode',
    settings_dark_desc: 'Keep dark theme',
    settings_apis: '🤖 My APIs (BYOK)',
    settings_apis_desc: 'Add your API = Unlimited + Completely FREE!',
    settings_manage_apis: '🔑 Manage APIs →',
    settings_legal: '⚖️ Legal & Support',
    settings_logout: '🚪 Logout',
    settings_free_plan: 'Free Plan',

    // Errors / Limits
    limit_reached: 'free messages used up! 🔑 Add your API key in Settings → My APIs for unlimited use.',
    api_error: 'Could not connect to API. Check Settings. 🔑',
    backend_error: 'Server is busy. Try again later or add an API key! 🔑',
  },
};

// ============================================
// LANGUAGE FUNCTIONS
// ============================================

// Current language लाओ
export const getLanguage = () => {
  return localStorage.getItem('appLanguage') || 'hi';
};

// Language set करो
export const setLanguage = (lang) => {
  localStorage.setItem('appLanguage', lang);
};

// Translation function - t('key')
export const t = (key) => {
  const lang = getLanguage();
  const langData = translations[lang] || translations['hi'];
  return langData[key] || translations['hi'][key] || key;
};

// Slides लाओ (onboarding के लिए)
export const getSlides = () => {
  const lang = getLanguage();
  const langData = translations[lang] || translations['hi'];
  return langData.onboarding_slides;
};

// Available languages
export const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', native: 'Hindi' },
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
];

export default translations;
