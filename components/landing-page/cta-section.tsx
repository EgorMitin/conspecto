'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">Ready to transform your learning?</span>
          </div>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
            Start Your Journey
            <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Today
            </span>
          </h2>

          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who have revolutionized their note-taking and study habits with Conspecto.
            Your future self will thank you.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl">
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

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-gray-300">
                Active Users
                <span className="block text-xs text-gray-400 mt-1">
                  (Okay, not yet. But you could be one of the first!)
                </span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">500K+</div>
              <div className="text-gray-300">
                Notes Created
                <span className="block text-xs text-gray-400 mt-1">
                  (Manifesting this. Actual notes: a handful, but growing!)
                </span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-300">
                Uptime
                <span className="block text-xs text-gray-400 mt-1">
                  (Our servers are ready for you. Seriously, they're bored.)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
