import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('studyhive_theme');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('studyhive_theme', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Theme colors
  const theme = {
    isDark,
    toggleTheme,
    colors: {
      bg: isDark ? 'bg-gray-950' : 'bg-gray-50',
      bgSecondary: isDark ? 'bg-gray-900' : 'bg-white',
      bgTertiary: isDark ? 'bg-gray-800' : 'bg-gray-100',
      text: isDark ? 'text-white' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-300' : 'text-gray-700',
      textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      borderLight: isDark ? 'border-gray-800' : 'border-gray-100',
      accent: 'from-purple-500 to-pink-500',
      accentHover: 'from-purple-600 to-pink-600',
      cardGradient: isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-white to-gray-50',
      glow: 'shadow-purple-500/20',
    },
    animations: {
      fadeIn: 'animate-fadeIn',
      slideUp: 'animate-slideUp',
      pulse: 'animate-pulse',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
