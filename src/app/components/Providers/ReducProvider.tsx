// src/app/components/AppProviders.tsx
'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/app/lib/store/store';
import { ThemeProvider } from "next-themes";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (

    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
  
   
    <ReduxProvider store={store}>
{children}
    </ReduxProvider>
    </ThemeProvider>
  );
}
