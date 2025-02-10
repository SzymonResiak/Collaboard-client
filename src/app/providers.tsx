'use client';

import { ThemeProvider } from '@/context/ThemeContext';
// inne importy providerów...

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {/* inne providery */}
      {children}
    </ThemeProvider>
  );
}
