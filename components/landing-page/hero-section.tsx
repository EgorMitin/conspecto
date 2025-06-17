'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Zap, Target } from 'lucide-react'

export default function HeroSection() {
  const handleDemoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-blue-600"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-purple-600"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600"></div>
      </div>

      <div className="relative container mx-auto px-4 py-24 sm:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Pill badge */}
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 mb-8">
            <Brain className="w-4 h-4 mr-2" />
            The plot twist your brain didn't see coming
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            <span className="block">Notes Reimagined:</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Capture, Question, Master
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your learning with AI-powered notes that fight back. Use spaced repetition, 
            intelligent questioning, and advanced editing to master any subject.
          </p>

          {/* Key features */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>AI-Powered Learning</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Target className="w-5 h-5 text-green-500" />
              <span>Spaced Repetition</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Brain className="w-5 h-5 text-blue-500" />
              <span>Advanced Editor</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-4 text-primary bg-gradient-to-r from-blue-600 to-purple-600 group">
                Start Making Smart Notes
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-2" onClick={handleDemoClick}>
              Watch Demo
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Join thousands of learners who also could be using Conspecto
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-90 bg-gradient-to-r from-yellow-100 via-pink-100 to-blue-100 dark:from-slate-800 dark:via-blue-900 dark:to-indigo-900 rounded-2xl py-6 px-8 shadow-lg border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-yellow-500">10K+</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Users*</span>
              </div>
              <div className="text-2xl text-gray-300">|</div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-pink-500">Millions*</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Notes that <span className="italic">could have</span> existed if everyone was as productive as your mom says you are</span>
              </div>
              <div className="text-2xl text-gray-300">|</div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-blue-500">95%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Retention*</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">*Numbers may be slightly exaggerated for motivational purposes</p>
          </div>
        </div>
      </div>
    </section>
  )
}
