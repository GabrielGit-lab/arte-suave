import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('artesuave_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('artesuave_token');
    const cached = localStorage.getItem('artesuave_user');
    // If no token or we already have cached user, do NOT block the UI!
    return Boolean(token && !cached);
  });

  useEffect(() => {
    const token = localStorage.getItem('artesuave_token');
    if (token) {
      api.get('/auth/me')
        .then(userData => {
          setUser(userData);
          try {
            localStorage.setItem('artesuave_user', JSON.stringify(userData));
          } catch {}
        })
        .catch(() => {
          localStorage.removeItem('artesuave_token');
          localStorage.removeItem('artesuave_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('artesuave_token', res.token);
    try {
      localStorage.setItem('artesuave_user', JSON.stringify(res.user));
    } catch {}
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('artesuave_token', res.token);
    try {
      localStorage.setItem('artesuave_user', JSON.stringify(res.user));
    } catch {}
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('artesuave_token');
    localStorage.removeItem('artesuave_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const refreshed = await api.get('/auth/me');
      setUser(refreshed);
      try {
        localStorage.setItem('artesuave_user', JSON.stringify(refreshed));
      } catch {}
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
