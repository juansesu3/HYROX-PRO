'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react';

import { ReactNode } from 'react';

const SessionProviderComponent = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
    {
        children
    }
    </SessionProvider>
  )
}

export default SessionProviderComponent