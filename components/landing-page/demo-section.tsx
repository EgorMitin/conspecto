'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Brain, FileText, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const demoFeatures = [
	{
		id: 'editor',
		title: 'Advanced Editor',
		description:
			'Rich text editing with mathematical equations, diagrams, and interactive elements',
		icon: FileText,
		image: '/landing/editor_create.mp4',
	},
	{
		id: 'ai',
		title: 'AI Review Sessions',
		description:
			'Intelligent question generation and personalized study recommendations',
		icon: Brain,
		image: '/landing/editor_create.mp4',
	},
	{
		id: 'analytics',
		title: 'Learning Analytics',
		description: 'Track your progress with detailed statistics and learning insights',
		icon: BarChart3,
		image: '/landing/editor_create.mp4',
	},
]

export default function DemoSection() {
	const [activeDemo, setActiveDemo] = useState('editor')
	const [isPlaying, setIsPlaying] = useState(false)

	return (
		<section id="demo" className="py-24 bg-white dark:bg-gray-950">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
						See Conspecto in Action
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
						Experience the power of intelligent note-taking with our interactive
						demonstrations.
					</p>
				</div>

				<div className="max-w-6xl mx-auto">
					<div className="flex flex-wrap justify-center gap-4 mb-12">
						{demoFeatures.map((feature) => (
							<Button
								key={feature.id}
								variant={activeDemo === feature.id ? 'default' : 'outline'}
								className={`flex items-center space-x-2 px-6 py-3 ${
									activeDemo === feature.id ? 'bg-blue-600 text-white' : ''
								}`}
								onClick={() => setActiveDemo(feature.id)}
							>
								<feature.icon className="w-5 h-5" />
								<span>{feature.title}</span>
							</Button>
						))}
					</div>

					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="order-2 lg:order-1">
							<Card className="overflow-hidden shadow-lg dark:border-gray-800">
								<CardContent className="p-0">
									<div className="relative bg-gray-900 aspect-video">
										<video
											className="w-full h-full object-cover rounded-lg"
											src="/landing/editor_create.mp4"
											poster="/landing/editor_create.mp4"
											controls
											playsInline
											muted
											loop
										>
											Your browser does not support the video tag.
										</video>
									</div>
								</CardContent>
							</Card>
						</div>

						<div className="order-1 lg:order-2">
							{demoFeatures.map(
								(feature) =>
									activeDemo === feature.id && (
										<div key={feature.id} className="space-y-6">
											<div className="flex items-center space-x-4">
												<div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
													<feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
												</div>
												<div>
													<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
														{feature.title}
													</h3>
													<p className="text-gray-600 dark:text-gray-300">
														{feature.description}
													</p>
												</div>
											</div>

											{feature.id === 'editor' && (
												<div className="space-y-4 pt-4">
													<ul className="space-y-3">
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Rich text formatting with mathematical equations
															</span>
														</li>
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Interactive diagrams and visual elements
															</span>
														</li>
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Real-time collaboration features
															</span>
														</li>
													</ul>
												</div>
											)}

											{feature.id === 'ai' && (
												<div className="space-y-4 pt-4">
													<ul className="space-y-3">
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Automatic question generation from your notes
															</span>
														</li>
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Intelligent content summaries
															</span>
														</li>
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Personalized study recommendations
															</span>
														</li>
													</ul>
												</div>
											)}

											{feature.id === 'analytics' && (
												<div className="space-y-4 pt-4">
													<ul className="space-y-3">
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Detailed learning statistics and insights
															</span>
														</li>
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Spaced repetition scheduling
															</span>
														</li>
														<li className="flex items-center space-x-3">
															<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
															<span className="text-gray-700 dark:text-gray-300">
																Performance trends and achievements
															</span>
														</li>
													</ul>
												</div>
											)}

											<Link href={'/login'}>
												<Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
													Try This Feature
												</Button>
											</Link>
										</div>
									)
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
