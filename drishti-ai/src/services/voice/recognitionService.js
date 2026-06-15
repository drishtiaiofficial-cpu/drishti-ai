// Speech to Text Service

export const startRecognition = (options = {}) => {
  const {
    lang = 'hi-IN',
    onStart, onResult, onEnd, onError,
  } = options;

  if (!('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)) {
    onError?.('not_supported');
    return null;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SR();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;

  let final = '';

  recognition.onstart = () => { final = ''; onStart?.(); };
  recognition.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    onResult?.(final, interim);
  };
  recognition.onspeechend = () => recognition.stop();
  recognition.onend = () => onEnd?.(final.trim());
  recognition.onerror = (e) => onError?.(e.error);
  recognition.start();
  return recognition;
};

export const stopRecognition = (recognition) => {
  recognition?.abort();
};

export const isSupported = () =>
  'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

export default { startRecognition, stopRecognition, isSupported };
