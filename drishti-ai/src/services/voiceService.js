// ============================================
// DRISHTI - Voice Service
// Speech recognition + synthesis
// ============================================

import storage from './storageService';

export const VOICE_PROFILES = {
  dadi: { rate: 0.65, pitch: 1.4, name: 'दादी 👵', desc: 'धीमी, मीठी' },
  maa:  { rate: 0.78, pitch: 1.25, name: 'मां 👩', desc: 'प्यार भरी' },
  didi: { rate: 0.95, pitch: 1.15, name: 'दीदी 👧', desc: 'Friendly' },
  bhai: { rate: 1.0,  pitch: 0.82, name: 'भाई 👦', desc: 'Cool, casual' },
  teacher: { rate: 0.88, pitch: 1.0, name: 'Teacher 👩‍🏫', desc: 'Clear' },
  nana: { rate: 0.6,  pitch: 1.3, name: 'नाना 👴', desc: 'Slow, warm' },
};

let currentUtterance = null;

export const speak = (text, voiceType = null) => {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();

  const profile = VOICE_PROFILES[voiceType || storage.get('selectedVoice', 'didi')];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;

  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v =>
      v.lang.includes('hi') || v.lang.includes('IN')
    );
    if (hindiVoice) utterance.voice = hindiVoice;
    window.speechSynthesis.speak(utterance);
    currentUtterance = utterance;
  };

  if (window.speechSynthesis.getVoices().length > 0) trySpeak();
  else window.speechSynthesis.onvoiceschanged = trySpeak;

  return true;
};

export const stop = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = () =>
  'speechSynthesis' in window && window.speechSynthesis.speaking;

export const startListening = (options = {}) => {
  const {
    onStart, onResult, onEnd, onError,
    language = 'hi-IN', continuous = false,
  } = options;

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError?.('Speech recognition not supported');
    return null;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = language;
  recognition.interimResults = true;
  recognition.continuous = continuous;
  recognition.maxAlternatives = 1;

  let finalTranscript = '';

  recognition.onstart = () => { finalTranscript = ''; onStart?.(); };
  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      else interim += event.results[i][0].transcript;
    }
    onResult?.(finalTranscript, interim);
  };
  recognition.onspeechend = () => recognition.stop();
  recognition.onend = () => onEnd?.(finalTranscript.trim());
  recognition.onerror = (e) => onError?.(e.error);

  recognition.start();
  return recognition;
};

export const previewVoice = (voiceType) => {
  const profile = VOICE_PROFILES[voiceType];
  if (!profile) return;
  speak('नमस्ते! मैं दृष्टि हूँ।', voiceType);
};

export default { speak, stop, isSpeaking, startListening, previewVoice, VOICE_PROFILES };
