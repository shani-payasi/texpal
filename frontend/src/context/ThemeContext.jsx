import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (user) {
      if (user.preferences?.theme) setTheme(user.preferences.theme);
      if (user.currency) setCurrency(user.currency);
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currency, setCurrency }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

