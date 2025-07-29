'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calculator, BookOpen, Zap } from 'lucide-react'

export default function CodeActDemoPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-12"
      >
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6"
          >
            React CodeAct Learning Bot
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            AI-powered educational assistant that generates live React components to create 
            interactive learning experiences, visualizations, and beautiful presentations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              Start Learning
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold shadow-lg border border-gray-200 transition-all duration-300"
            >
              View Examples
            </motion.button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {[
            {
              icon: TrendingUp,
              title: "Interactive Charts",
              description: "Generate beautiful, animated data visualizations",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: Calculator,
              title: "Math Concepts",
              description: "Visualize complex mathematical equations and formulas",
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: BookOpen,
              title: "Educational Content",
              description: "Create engaging learning experiences and tutorials",
              color: "from-green-500 to-emerald-500"
            },
            {
              icon: Zap,
              title: "Live Streaming",
              description: "Hot reloading shows changes instantly",
              color: "from-orange-500 to-yellow-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Status Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">System Status</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Docker Environment", status: "✅ Running", color: "text-green-600" },
              { label: "Educational Libraries", status: "✅ Loaded", color: "text-green-600" },
              { label: "AI Integration", status: "✅ Ready", color: "text-green-600" },
              { label: "Hot Reloading", status: "✅ Active", color: "text-green-600" }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                <div className={`font-semibold ${item.color}`}>{item.status}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What's Next?</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "AI Integration",
                description: "Connect Qwen3 model for React component generation"
              },
              {
                step: "2", 
                title: "Component Templates",
                description: "Create reusable templates for different learning types"
              },
              {
                step: "3",
                title: "Live Streaming",
                description: "Implement real-time code compilation and preview"
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + index * 0.2, duration: 0.6 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mb-4 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
