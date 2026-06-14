// ============================================
// DRISHTI - Memory Service
// Chat history save/load करता है
// Engine के /history endpoint से sync होगा
// ============================================

import { getEngineUrl } from '../config/index';
import storage from './storageService';

const MAX_LOCAL_MESSAGES = 50;
const MAX_CONTEXT_MESSAGES = 10;

// Local में save करो
export const saveMessage = (role, content, sessionId = 'default') => {
  const key = `chat_${sessionId}`;
  const history = storage.get(key, []);
  history.push({
    role,
    content,
    timestamp: Date.now(),
  });
  if (history.length > MAX_LOCAL_MESSAGES) {
    history.splice(0, history.length - MAX_LOCAL_MESSAGES);
  }
  storage.set(key, history);
};

// Context के लिए last N messages लाओ
export const getContext = (sessionId = 'default') => {
  const key = `chat_${sessionId}`;
  const history = storage.get(key, []);
  return history
    .slice(-MAX_CONTEXT_MESSAGES)
    .map(({ role, content }) => ({ role, content }));
};

// परी history लाओ
export const getFullHistory = (sessionId = 'default') => {
  const key = `chat_${sessionId}`;
  return storage.get(key, []);
};

// Session clear करो
export const clearSession = (sessionId = 'default') => {
  storage.remove(`chat_${sessionId}`);
};

// Engine से history sync करो
export const syncWithEngine = async (userId, sessionId = 'default') => {
  try {
    const url = `${getEngineUrl('history')}?limit=20`;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
};

// Sessions list
export const getSessions = () => {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('chat_')) {
      const sessionId = key.replace('chat_', '');
      const history = storage.get(key, []);
      if (history.length > 0) {
        sessions.push({
          id: sessionId,
          lastMessage: history[history.length - 1]?.content?.slice(0, 50),
          timestamp: history[history.length - 1]?.timestamp,
          count: history.length,
        });
      }
    }
  }
  return sessions.sort((a, b) => b.timestamp - a.timestamp);
};

export default {
  saveMessage,
  getContext,
  getFullHistory,
  clearSession,
  syncWithEngine,
  getSessions,
};
