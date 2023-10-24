'use client'
import { SessionProvider } from 'next-auth/react'
import React, { Children } from 'react'

export default function AuthSessionProvider({children,}: {children: React.ReactNode}) {
  return (
    <SessionProvider>{children}</SessionProvider>
  )
}
