import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      setUser({
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || '',
        uid: localStorage.getItem('uid') || null,
        plan: localStorage.getItem('userPlan') || 'free',
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    Object.entries(userData).forEach(([k, v]) => {
      const keyMap = {
        name: 'userName', email: 'userEmail',
        uid: 'uid', plan: 'userPlan',
      };
      if (keyMap[k]) localStorage.setItem(keyMap[k], v);
    });
    localStorage.setItem('isLoggedIn', 'true');
  };

  const logout = () => {
    const lang = localStorage.getItem('appLanguage');
    const voice = localStorage.getItem('selectedVoice');
    localStorage.clear();
    if (lang) localStorage.setItem('appLanguage', lang);
    if (voice) localStorage.setItem('selectedVoice', voice);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    Object.entries(updates).forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export default AuthContext;
