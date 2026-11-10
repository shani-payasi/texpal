import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('taxpal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('taxpal_token');
      if (token) {
        try {
          const data = await authService.getMe();
          if (data && data.user) {
            setUser(data.user);
          }
        } catch (err) {
          console.error('Session validation error:', err);
          setUser(null);
          localStorage.removeItem('taxpal_token');
          localStorage.removeItem('taxpal_user');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const data = await authService.login({ email, password, rememberMe });
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please verify your credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      toast.success('Account created successfully!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw err;
    }
  };

  const demoLogin = async () => {
    try {
      const data = await authService.demoLogin();
      setUser(data.user);
      toast.success('Signed in as Demo User (Alex Morgan)!');
      return data;
    } catch (err) {
      toast.error('Could not sign into demo account.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (err) {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('taxpal_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

