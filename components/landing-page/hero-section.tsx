'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Zap, Target } from 'lucide-react'

export default function HeroSection() {
  const handleDemoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 mb-8">
            <Brain className="w-4 h-4 mr-2 text-blue-500" />
            <span>The future of note-taking is here.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            <span className="block">Notes Reimagined:</span>
            <span className="block text-blue-600 dark:text-blue-500">
              Capture, Question, Master
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your learning with AI-powered notes that fight back. Use
            spaced repetition, intelligent questioning, and advanced editing to
            master any subject.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Zap className="w-5 h-5 text-blue-500" />
              <span>AI-Powered Learning</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Target className="w-5 h-5 text-blue-500" />
              <span>Spaced Repetition</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Brain className="w-5 h-5 text-blue-500" />
              <span>Advanced Editor</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4"
              onClick={handleDemoClick}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
