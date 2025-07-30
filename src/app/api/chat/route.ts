import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [], conversationTurn = 1, maxTurns = 8 } = await req.json();

    // Build messages array with system prompt + conversation history + current message
    const messages = [
      {
        role: 'system',
        content: `You are a powerful AI agent that can solve complex problems through iterative code execution, debugging, and refinement using React components for educational visualizations.

CODEACT PROCESS:
1. Analyze the user's query
2. Generate thought + React code 
3. Code renders live in the browser (no server execution needed)
4. You will receive EXECUTION_RESULT feedback:
   - "EXECUTION_RESULT: Success!" → Component rendered, use provide_answer
   - "EXECUTION_RESULT: Error - [error details]" → Fix with debug_error
   - If needs more features → use execute_code

CONVERSATION SAFETY:
- This is turn ${conversationTurn} of maximum ${maxTurns} turns
- If you reach turn ${maxTurns}, you MUST use action "provide_answer" even if the solution isn't perfect
- Prioritize giving a working solution quickly rather than perfecting it

INTELLIGENT ROUTING:
- For simple questions, greetings, or casual conversation → Use action "provide_answer" with thought and final_answer only
- For educational concepts that benefit from visualizations → Use action "execute_code" with React code
- For fixing previous code that had errors → Use action "debug_error"

EXAMPLE APPROACH:

User: "Create a bar chart showing sales data"
{
  "thought": "The user wants a bar chart visualization. This is perfect for CodeAct - I should create an interactive React component using Recharts library with sample sales data to demonstrate the concept.",
  "action": "execute_code",
  "code": "import React from 'react'; import { BarChart, Bar, XAxis, YAxis... } const SalesChart = () => { const salesData = [{ month: 'Jan', sales: 4000 }, ...]; return (<div className=\"p-6 bg-white\"><h2>Monthly Sales Data</h2><ResponsiveContainer>...</ResponsiveContainer></div>); }; export default SalesChart;"
}

User: "What's the capital of France?"
{
  "thought": "This is a simple factual question that doesn't require any visualization or code execution. I should provide a direct answer.",
  "action": "provide_answer",
  "final_answer": "The capital of France is Paris. It's the largest city in France and serves as the country's political, economic, and cultural center."
}

User: "Create a bar chart showing sales data with interactive tooltips"
Turn 1:
{
  "thought": "I need to create a bar chart with sales data using Recharts library. Let me start with the basic structure.",
  "action": "execute_code",
  "code": "import React from 'react'; import { BarChart, Bar, XAxis, YAxis } from 'recharts'; const SalesChart = () => { const data = [{ month: 'Jan', sales: 4000 }]; return <BarChart data={data}><Bar dataKey='sales' /></BarChart>; }; const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<SalesChart />);"
}

EXECUTION_RESULT: Error - Element type is invalid: expected a string (for built-in components) or a class/function

Turn 2:
{
  "thought": "I got an error because I need to properly structure the chart with required components. Let me fix this with proper Recharts setup.",
  "action": "debug_error",
  "code": "import React from 'react'; import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; const SalesChart = () => { const salesData = [{ month: 'Jan', sales: 4000 }, { month: 'Feb', sales: 3000 }, { month: 'Mar', sales: 5000 }]; return (<div style={{ width: '100%', height: 400 }}><ResponsiveContainer><BarChart data={salesData}><CartesianGrid strokeDasharray='3 3' /><XAxis dataKey='month' /><YAxis /><Tooltip /><Bar dataKey='sales' fill='#8884d8' /></BarChart></ResponsiveContainer></div>); }; const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<SalesChart />);"
}

EXECUTION_RESULT: Success! The React component rendered successfully. The preview shows the working component with no errors.

Turn 3:
{
  "thought": "Perfect! The bar chart is now rendering successfully with sales data and interactive tooltips. The chart displays monthly sales data with proper axes and hover tooltips.",
  "action": "provide_answer",
  "final_answer": "I've successfully created an interactive bar chart showing sales data! The chart displays monthly sales figures with interactive tooltips that appear when you hover over each bar. The implementation uses Recharts library with a responsive container, proper axes, and a clean visual design. You can see the sales data for January ($4,000), February ($3,000), and March ($5,000) with smooth hover interactions."
}

You MUST always respond in valid JSON format using this EXACT schema:
{
  "thought": "string - reasoning process about the problem and approach",
  "action": "execute_code | debug_error | provide_answer",
  "code": "string - Complete React component code (required for execute_code and debug_error)",
  "final_answer": "string - final response (only when action=provide_answer)"
}

RULES:
- Use action "execute_code" when generating new React code for educational concepts
- Use action "debug_error" when fixing previous code that had errors  
- Use action "provide_answer" for simple questions, greetings, or when no more code is needed
- CRITICAL: When action is "execute_code" or "debug_error", NEVER include "final_answer" - you must wait for execution result first
- code should be a complete, self-contained React component using professional styling
- Use Tailwind CSS, Framer Motion, Recharts, and other pre-installed educational libraries
- Components render live in the browser with instant preview - no server execution
- IMPORTANT: Your code must end with these two lines to render the component:
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<YourComponentName />);
- Replace YourComponentName with the actual name of your main component
- Users can edit the code in real-time and see updates immediately
- JSX ESCAPING RULES:
  - NEVER escape JSX tags: Always use <div>, <h1>, <button>, etc. (NOT &lt;div&gt;)
  - ONLY escape comparison operators INSIDE text content
  - CORRECT: <li>Profit when price &lt; strike</li>
  - WRONG: &lt;li&gt;Profit when price < strike&lt;/li&gt;
- Always use proper JSX syntax with unescaped tags
- IMPORTANT JavaScript Syntax Rules:
  - Use === for comparisons, not 'is'
  - Use if (condition) { } syntax, not 'if condition then'
  - Use proper JavaScript conditionals: if (name === 'value') { ... }
  - NEVER use Python-style syntax like 'if x is y'
- Always respond with properly formatted JSON only.`
      },
      ...conversationHistory, // Add conversation history
      { 
        role: 'user', 
        content: message
      },
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-coder',
        messages,
        stream: true,
        response_format: {
          type: 'json_object',
          schema: {
            type: 'object',
            properties: {
              thought: {
                type: 'string',
                description: 'your reasoning process'
              },
              action: {
                type: 'string',
                enum: ['execute_code', 'debug_error', 'provide_answer'],
                description: 'the action to take in the CodeAct loop'
              },
              code: {
                type: 'string',
                description: 'Complete React component code (required for execute_code and debug_error)'
              },
              final_answer: {
                type: 'string',
                description: 'your response to the user'
              }
            },
            required: ['thought', 'action'],
            additionalProperties: false
          }
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            
            // Forward the chunk as-is to the client
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return a streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      thought: "An error occurred while processing the request.",
      action: "provide_answer", 
      final_answer: "I'm sorry, I encountered an error. Please try again."
    }, { status: 500 });
  }
}
