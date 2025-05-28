'use client';

import Header from '@/components/landing-page/Header'
import { useUser } from '@/lib/context/UserContext'
import React from 'react'

export default function LandingLayout ({ children }: { children: React.ReactNode }) {
  const user = useUser()

  return (
    <main className='bg-background'>
      <Header user={user} />
      {children}
    </main>
  )
}