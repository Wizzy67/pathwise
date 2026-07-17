import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setCache, getCache, clearCache } from '../services/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Attempt to fetch profile online
          const res = await api.get('/users/profile');
          setUser({ ...res.data, role: res.data.role || 'student' });
          await setCache('userProfile', res.data);
        } catch (error) {
          // Fallback to cache if offline
          console.warn('Network error, attempting to load user from cache');
          const cachedUser = await getCache('userProfile');
          if (cachedUser) {
            setUser({ ...cachedUser, role: cachedUser.role || 'student' });
          } else {
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Re-fetch user profile from server and update context + cache
  const refreshUser = async () => {
    try {
      const res = await api.get('/users/profile');
      const fresh = { ...res.data, role: res.data.role || 'student' };
      setUser(fresh);
      await setCache('userProfile', fresh);
      return fresh;
    } catch (err) {
      console.warn('refreshUser failed:', err.message);
      return null;
    }
  };

  const login = async (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    await setCache('userProfile', userData);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    await clearCache();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

