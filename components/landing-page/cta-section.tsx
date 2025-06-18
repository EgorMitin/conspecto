'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 bg-blue-600 dark:bg-blue-700">
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            Start Your Journey Today
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who have revolutionized their
            note-taking and study habits with Conspecto. Your future self will
            thank you.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-full font-semibold backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
