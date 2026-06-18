import storage from './storageService';

const MAX_LOCAL_MESSAGES = 50;
const MAX_CONTEXT_MESSAGES = 10;
const CURRENT_KEY = 'current_session_id';

export const getCurrentSessionId = () => {
  return localStorage.getItem(CURRENT_KEY) || 'default';
};

export const setCurrentSessionId = (id) => {
  localStorage.setItem(CURRENT_KEY, id);
};

export const createNewSession = () => {
  const id = `session_${Date.now()}`;
  setCurrentSessionId(id);
  return id;
};

export const saveMessage = (role, content, sessionId) => {
  const sid = sessionId || getCurrentSessionId();
  const key = `chat_${sid}`;
  const history = storage.get(key, []);
  history.push({ role, content, timestamp: Date.now() });
  if (history.length > MAX_LOCAL_MESSAGES) {
    history.splice(0, history.length - MAX_LOCAL_MESSAGES);
  }
  storage.set(key, history);
};

export const getContext = (sessionId) => {
  const sid = sessionId || getCurrentSessionId();
  const key = `chat_${sid}`;
  const history = storage.get(key, []);
  return history.slice(-MAX_CONTEXT_MESSAGES).map(({ role, content }) => ({ role, content }));
};

export const getFullHistory = (sessionId) => {
  const sid = sessionId || getCurrentSessionId();
  const key = `chat_${sid}`;
  return storage.get(key, []);
};

export const clearSession = (sessionId) => {
  const sid = sessionId || getCurrentSessionId();
  storage.remove(`chat_${sid}`);
};

export const deleteSession = (sessionId) => {
  storage.remove(`chat_${sessionId}`);
  if (getCurrentSessionId() === sessionId) {
    setCurrentSessionId('default');
  }
};

export const getSessions = () => {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('chat_')) {
      const sessionId = key.replace('chat_', '');
      const history = storage.get(key, []);
      if (history.length > 0) {
        const lastUserMsg = [...history].reverse().find(m => m.role === 'user');
        sessions.push({
          id: sessionId,
          title: lastUserMsg ? lastUserMsg.content.slice(0, 40) : 'Chat',
          lastMessage: history[history.length - 1]?.content?.slice(0, 60),
          timestamp: history[history.length - 1]?.timestamp || 0,
          count: history.length,
        });
      }
    }
  }
  return sessions.sort((a, b) => b.timestamp - a.timestamp);
};

export const syncWithEngine = async () => null;

export default {
  getCurrentSessionId, setCurrentSessionId, createNewSession,
  saveMessage, getContext, getFullHistory, clearSession,
  deleteSession, getSessions, syncWithEngine,
};
