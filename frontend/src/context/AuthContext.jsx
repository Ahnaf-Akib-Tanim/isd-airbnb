import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ─── Rehydrate from localStorage on app start ───────────────
  useEffect(() => {
    // Keep keys consistent with authService / axiosConfig
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Check token expiry
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          clearAuthData();
        } else {
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (e) {
        clearAuthData();
      }
    }
    setLoading(false);
  }, []);

  // ─── Save auth data to localStorage ─────────────────────────
  const saveAuthData = (authResponse) => {
    const userData = {
      userId:    authResponse.userId,
      email:     authResponse.email,
      firstName: authResponse.firstName,
      lastName:  authResponse.lastName,
      role:      authResponse.role,
    };
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user',  JSON.stringify(userData));
    setToken(authResponse.token);
    setUser(userData);
  };

  // ─── Clear auth data ─────────────────────────────────────────
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // ─── Register ───────────────────────────────────────────────
  const register = useCallback(async (registerData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.register(registerData);
      saveAuthData(response);
      toast.success(response.message || 'Account created.');
      return { success: true, message: response.message };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Login ───────────────────────────────────────────────────
  const login = useCallback(async (loginData) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(loginData);
      saveAuthData(response);
      toast.success(response.message || 'Logged in.');
      return { success: true, message: response.message };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuthData();
    setError(null);
    toast.info('Logged out.');
  }, []);

  // ─── Update user in context after profile edit ───────────────
  const updateUser = useCallback((updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }, [user]);

  // ─── Helpers ─────────────────────────────────────────────────
  const isAuthenticated = !!token && !!user;
  const isGuest         = user?.role === 'GUEST';
  const isHost          = user?.role === 'HOST';
  const isAdmin         = user?.role === 'ADMIN';
  const fullName        = user ? `${user.firstName} ${user.lastName}` : '';
  const initials        = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : '';

  const value = {
    // State
    user,
    token,
    loading,
    error,

    // Actions
    register,
    login,
    logout,
    updateUser,
    setError,

    // Computed
    isAuthenticated,
    isGuest,
    isHost,
    isAdmin,
    fullName,
    initials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
