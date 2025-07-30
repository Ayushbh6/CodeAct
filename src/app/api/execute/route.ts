import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Execute React component using the React executor API
    const response = await fetch('http://localhost:4000/execute-component', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reactCode: code,
        componentName: `Component_${Date.now()}`,
        componentType: 'interactive'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('React Executor error:', errorText);
      return NextResponse.json(
        { error: 'Failed to execute React component', details: errorText }, 
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      componentUrl: `http://localhost:4000/components/generated/${result.executionId}.html`,
      screenshotUrl: `http://localhost:4000${result.screenshotPath}`,
      componentPath: result.componentPath,
      executionId: result.executionId,
      message: 'Component executed successfully'
    });

  } catch (error) {
    console.error('Execute API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to execute React component'
    }, { status: 500 });
  }
}
