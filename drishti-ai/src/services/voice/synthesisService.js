// Text to Speech Service

const PROFILES = {
  dadi:    { rate: 0.65, pitch: 1.4 },
  maa:     { rate: 0.78, pitch: 1.25 },
  didi:    { rate: 0.95, pitch: 1.15 },
  bhai:    { rate: 1.0,  pitch: 0.82 },
  teacher: { rate: 0.88, pitch: 1.0 },
  nana:    { rate: 0.6,  pitch: 1.3 },
};

export const speak = (text, voiceType = 'didi', onEnd = null) => {
  if (!('speechSynthesis' in window) || !text) return false;
  window.speechSynthesis.cancel();

  const profile = PROFILES[voiceType] || PROFILES.didi;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hi-IN';
  u.rate = profile.rate;
  u.pitch = profile.pitch;
  if (onEnd) u.onend = onEnd;

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const hindi = voices.find(v =>
      v.lang.includes('hi') || v.lang.includes('IN')
    );
    if (hindi) u.voice = hindi;
    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.getVoices().length > 0) trySpeak();
  else window.speechSynthesis.onvoiceschanged = trySpeak;
  return true;
};

export const stop = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

export const isSpeaking = () =>
  'speechSynthesis' in window && window.speechSynthesis.speaking;

export const preview = (voiceType) =>
  speak('नमस्ते! मैं दृष्टि हूँ।', voiceType);

export const VOICE_PROFILES = PROFILES;

export default { speak, stop, isSpeaking, preview, VOICE_PROFILES };
