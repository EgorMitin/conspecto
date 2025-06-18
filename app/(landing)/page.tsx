'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context/UserContext'

import HeroSection from '@/components/landing-page/hero-section'
import DemoSection from '@/components/landing-page/demo-section'
import PricingSection from '@/components/landing-page/pricing-section'
import CTASection from '@/components/landing-page/cta-section'

export default function Landing() {
  const router = useRouter()
  const user = useUser()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen">
      <HeroSection />
      <DemoSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}