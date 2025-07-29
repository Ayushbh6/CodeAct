// Health check endpoint for Docker container
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const healthCheck = {
      uptime: process.uptime(),
      message: 'React CodeAct Learning Bot is healthy! 🚀',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memoryUsage: process.memoryUsage(),
      features: {
        aiIntegration: 'Ready',
        componentGeneration: 'Ready',
        visualLearning: 'Ready',
        hotReload: process.env.NODE_ENV === 'development' ? 'Active' : 'Disabled'
      }
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    const errorResponse = {
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 503 })
  }
}
