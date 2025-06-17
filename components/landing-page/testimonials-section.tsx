'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    avatar: "/icons/FallbackProfileIcon.jpg",
    rating: 5,
    content: "Conspecto transformed how I study for medical school. The spaced repetition feature helped me retain complex anatomical information like never before. My exam scores improved by 30%!"
  },
  {
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    avatar: "/icons/FallbackProfileIcon.jpg",
    rating: 5,
    content: "As a developer, I love the code syntax highlighting and mathematical equation support. Perfect for documenting algorithms and technical concepts. The AI summaries save me hours."
  },
  {
    name: "Dr. Emily Watson",
    role: "University Professor",
    avatar: "/icons/FallbackProfileIcon.jpg",
    rating: 5,
    content: "I use Conspecto for my research notes and lecture preparation. The collaboration features are excellent for working with colleagues, and students love the interactive study sessions."
  },
  {
    name: "James Kim",
    role: "Business Analyst",
    avatar: "/icons/FallbackProfileIcon.jpg",
    rating: 5,
    content: "The analytics dashboard helps me track my learning progress. I can see exactly which topics need more attention. It's like having a personal learning coach!"
  },
  {
    name: "Priya Patel",
    role: "Graduate Student",
    avatar: "/icons/FallbackProfileIcon.jpg",
    rating: 5,
    content: "The AI-powered question generation is incredible. It creates exactly the type of questions I need to test my understanding. My thesis research has never been more organized."
  },
  {
    name: "Alex Thompson",
    role: "Language Learner",
    avatar: "/icons/FallbackProfileIcon.jpg",
    rating: 5,
    content: "Learning Mandarin became so much easier with Conspecto's spaced repetition. The memory retention techniques actually work - I can have conversations now!"
  }
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Loved by learners
            <span className="block bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of students, professionals, and researchers who have transformed
            their learning experience with Conspecto.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">70+</div>
            <div className="text-gray-600 dark:text-gray-300">Cups of Coffee Consumed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">&gt;100</div>
            <div className="text-gray-600 dark:text-gray-300">Bugs Heroically Squashed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">1,234</div>
            <div className="text-gray-600 dark:text-gray-300">Lines of Code Written (and Rewritten)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">∞</div>
            <div className="text-gray-600 dark:text-gray-300">Dreams of Going Viral</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-4" />

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Join the Learning Revolution
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Don't just take our word for it. Experience the difference Conspecto can make
              in your learning journey.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm opacity-90">
              <Star className="w-4 h-4 fill-current" />
              <span>Rated 4.9/5 by over 2,000 users</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
