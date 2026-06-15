import React, { createContext, useContext, useState, useRef } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState({});
  const [activeSession, setActiveSession] = useState('default');
  const [isTyping, setIsTyping] = useState(false);

  const getMessages = (sessionId = activeSession) =>
    sessions[sessionId] || [];

  const addMessage = (message, sessionId = activeSession) => {
    const newMsg = {
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      ...message,
    };
    setSessions(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), newMsg],
    }));

    // Save to localStorage
    const key = `chat_${sessionId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(newMsg);
    if (existing.length > 100) existing.splice(0, existing.length - 100);
    localStorage.setItem(key, JSON.stringify(existing));

    return newMsg;
  };

  const loadSession = (sessionId) => {
    const key = `chat_${sessionId}`;
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    setSessions(prev => ({ ...prev, [sessionId]: saved }));
    setActiveSession(sessionId);
  };

  const clearSession = (sessionId = activeSession) => {
    localStorage.removeItem(`chat_${sessionId}`);
    setSessions(prev => ({ ...prev, [sessionId]: [] }));
  };

  const getContext = (sessionId = activeSession, limit = 10) => {
    const msgs = getMessages(sessionId);
    return msgs.slice(-limit).map(({ role, text }) => ({
      role: role === 'ai' ? 'assistant' : role,
      content: text,
    }));
  };

  return (
    <ChatContext.Provider value={{
      sessions, activeSession, isTyping,
      setIsTyping, setActiveSession,
      getMessages, addMessage, loadSession,
      clearSession, getContext,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be inside ChatProvider');
  return ctx;
};

export default ChatContext;
