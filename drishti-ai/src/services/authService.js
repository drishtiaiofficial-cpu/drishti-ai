// ============================================
// DRISHTI - Auth Service
// Engine के /user/register + /user/login use करता है
// ============================================

import { getEngineUrl } from '../config/index';
import { setUserData, getUserData } from './storageService';

// Register
export const registerUser = async (username, password) => {
  try {
    const res = await fetch(getEngineUrl('register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.ok && data.user_id) {
      const name = username.charAt(0).toUpperCase() + username.slice(1);
      setUserData({
        name,
        email: username,
        uid: data.user_id,
        plan: data.tier || 'free',
        isLoggedIn: true,
      });
      return { success: true, userName: name, userId: data.user_id };
    }

    return {
      success: false,
      error: data.detail || 'Registration failed',
    };
  } catch (e) {
    // Fallback to local if engine down
    const name = username.charAt(0).toUpperCase() + username.slice(1);
    setUserData({
      name,
      email: username,
      isLoggedIn: true,
      password: password,
    });
    return { success: true, userName: name, offline: true };
  }
};

// Login
export const loginUser = async (username, password) => {
  try {
    const res = await fetch(getEngineUrl('login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.ok) {
      const name = username.charAt(0).toUpperCase() + username.slice(1);
      setUserData({
        name,
        email: username,
        uid: data.user_id,
        plan: data.tier || 'free',
        isLoggedIn: true,
      });
      return { success: true, userName: name };
    }

    return {
      success: false,
      error: data.detail || 'Login failed',
    };
  } catch (e) {
    // Fallback to local
    const saved = getUserData();
    if (saved.email === username) {
      setUserData({ isLoggedIn: true });
      return { success: true, userName: saved.name };
    }
    return { success: false, error: 'Login failed. Check credentials.' };
  }
};

// Logout
export const logoutUser = () => {
  const lang = localStorage.getItem('appLanguage');
  const voice = localStorage.getItem('selectedVoice');
  localStorage.clear();
  if (lang) localStorage.setItem('appLanguage', lang);
  if (voice) localStorage.setItem('selectedVoice', voice);
  return { success: true };
};

// Check auth
export const isAuthenticated = () => {
  const data = getUserData();
  return data.isLoggedIn === true || data.isLoggedIn === 'true';
};

export default { registerUser, loginUser, logoutUser, isAuthenticated };
