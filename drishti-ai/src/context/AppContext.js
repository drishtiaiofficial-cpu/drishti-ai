import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState(
    localStorage.getItem('appLanguage') || 'hi'
  );
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  return (
    <AppContext.Provider value={{
      isOnline, theme, language,
      toast, showToast, changeLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export default AppContext;
