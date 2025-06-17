'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Brain, 
  Repeat, 
  Palette, 
  Users, 
  Sparkles, 
  BarChart3,
  FileText,
  Zap,
  Target
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Get intelligent summaries, auto-generated questions, and personalized study recommendations.",
    color: "bg-blue-500"
  },
  {
    icon: Repeat,
    title: "Spaced Repetition",
    description: "Master any subject with scientifically-proven spaced repetition algorithms that optimize retention.",
    color: "bg-green-500"
  },
  {
    icon: Palette,
    title: "Advanced Rich Editor",
    description: "Create beautiful notes with mathematical equations, diagrams, code blocks, and interactive elements.",
    color: "bg-purple-500"
  },
  {
    icon: Sparkles,
    title: "Smart Organization",
    description: "Automatically organize your notes with tags, folders, and AI-powered categorization. Comming soon!",
    color: "bg-pink-500"
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    description: "Track your progress with detailed statistics and insights into your learning patterns.",
    color: "bg-indigo-500"
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Support for markdown, rich text, images, videos, and interactive components.",
    color: "bg-teal-500"
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set learning goals and track your progress with visual dashboards and achievements.",
    color: "bg-red-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant search, real-time sync, and optimized performance for seamless note-taking.",
    color: "bg-yellow-500"
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300 mb-6">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              learn effectively
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover powerful features designed to transform how you take notes, 
            study, and retain information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:scale-105"
            >
              <CardContent className="p-8">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional highlight section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              The Science of Effective Learning
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our platform is built on cognitive science research, utilizing proven techniques 
              like active recall, spaced repetition, and interleaving to maximize retention.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">85%</div>
                <div className="text-lg opacity-90">Better Retention</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">3x</div>
                <div className="text-lg opacity-90">Faster Learning</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50%</div>
                <div className="text-lg opacity-90">Less Study Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
