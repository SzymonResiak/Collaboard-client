'use client';

import React, { createContext, useContext } from 'react';
import { ThemeColor, ThemeColors } from '@/constants/ThemeColors';

interface ThemeContextProps {
  colors: typeof ThemeColors;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors: ThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme musi być używany w obrębie ThemeProvider');
  }
  return context;
}
