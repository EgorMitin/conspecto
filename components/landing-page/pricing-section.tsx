'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { PRICING_PLANS, PRICING_CARDS } from '@/lib/constants'
import Diamond from '/public/icons/diamond.svg'
import CheckIcon from '/public/icons/check.svg'

export default function PricingSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            The Perfect Plan For You
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience all the benefits of our platform. Select a plan that
            suits your needs and take your productivity to new heights.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto">
          {PRICING_CARDS.map((card) => {
            const isProPlan = card.planType === PRICING_PLANS.proplan

            return (
              <Card
                key={card.planType}
                className={`relative flex-1 max-w-md mx-auto transition-all duration-300 hover:shadow-xl ${
                  isProPlan
                    ? 'border-2 border-blue-500'
                    : 'border border-gray-200 dark:border-gray-800'
                }`}
              >
                {isProPlan && (
                  <Image
                    src={Diamond}
                    alt="Pro Plan Icon"
                    className="absolute top-6 right-6 w-8 h-8"
                  />
                )}

                <CardHeader className="relative">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.planType}
                  </CardTitle>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${card.price}
                    </span>
                    {+card.price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {card.description}
                  </p>
                </CardHeader>

                <CardContent className="relative">
                  <Link href="/signup">
                    <Button
                      className={`w-full mb-8 py-3 text-lg font-semibold ${
                        isProPlan
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                      }`}
                    >
                      {isProPlan ? 'Go Pro' : 'Get Started'}
                    </Button>
                  </Link>

                  <div className="space-y-6">
                    {card.highlightFeature && (
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                          {card.highlightFeature}
                        </p>
                      </div>
                    )}

                    <ul className="space-y-4">
                      {card.freatures.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <Image
                              src={CheckIcon}
                              alt="Check"
                              className="w-5 h-5"
                            />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our Free Plan lets you explore core features. Pro features are
                now available for all users.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards and PayPal. All payments are
                processed securely.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Absolutely! You can cancel your subscription at any time with no
                cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
