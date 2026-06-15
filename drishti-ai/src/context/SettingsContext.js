import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    hindiMode: true,
    notifications: true,
    darkMode: true,
    selectedVoice: 'didi',
    language: 'hi',
    byokEnabled: false,
  });

  useEffect(() => {
    setSettings({
      hindiMode: localStorage.getItem('hindiMode') !== 'false',
      notifications: localStorage.getItem('notifications') !== 'false',
      darkMode: localStorage.getItem('darkMode') !== 'false',
      selectedVoice: localStorage.getItem('selectedVoice') || 'didi',
      language: localStorage.getItem('appLanguage') || 'hi',
      byokEnabled: localStorage.getItem('byok_enabled') === 'true',
    });
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem(key === 'language' ? 'appLanguage' :
      key === 'selectedVoice' ? 'selectedVoice' :
      key === 'byokEnabled' ? 'byok_enabled' : key,
      value.toString()
    );
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
};

export default SettingsContext;
