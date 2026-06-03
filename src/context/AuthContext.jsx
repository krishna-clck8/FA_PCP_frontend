import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setAuthUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token: newToken } = res.data.data;
    setAuthUser(user);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    updateAppState({ authUser: user, token: newToken });
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { user, token: newToken } = res.data.data;
    setAuthUser(user);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    updateAppState({ authUser: user, token: newToken });
    return res.data;
  };

  const logout = () => {
    setAuthUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    updateAppState({ authUser: null, token: null });
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      const user = res.data.data;
      setAuthUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      updateAppState({ authUser: user });
    } catch {
      logout();
    }
  };

  const updateAppState = (partial) => {
    if (window.appState) {
      Object.assign(window.appState, partial);
    }
  };

  return (
    <AuthContext.Provider value={{ authUser, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
