import { config } from 'dotenv';

// Load environment variables from .env file
config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export {};

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'qwen/qwen3-coder',
    messages: [
      {
        role: 'system',
        content: `You are an educational AI learning assistant that generates interactive React components to help users learn concepts visually. You MUST always respond in valid JSON format using this EXACT schema:

{
  "thought": "string - reasoning about what visual/interactive element to create",
  "action": "execute_react | debug_react | provide_answer",
  "react_code": "string - Complete React component code",
  "final_answer": "string - explanation of the learning concept"
}

RULES:
- Use action "execute_react" when generating new React code
- Use action "debug_react" when fixing previous code
- Use action "provide_answer" when no more code is needed
- react_code should be a complete, self-contained React component
- Use professional styling with Tailwind CSS, Framer Motion, and educational libraries
- Always respond with properly formatted JSON only.`
      },
      { 
        role: 'user', 
        content: 'Help me learn compound interest with an interactive visualization for 15k premium, 6% interest compounded semi annually for 6 years.'
      },
    ],
    stream: true,
    response_format: {
      type: 'json_object',
      schema: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'reasoning about what visual/interactive element to create'
          },
          action: {
            type: 'string',
            enum: ['execute_react', 'debug_react', 'provide_answer'],
            description: 'the action to take'
          },
          react_code: {
            type: 'string',
            description: 'Complete React component code'
          },
          final_answer: {
            type: 'string',
            description: 'explanation of the learning concept'
          }
        },
        required: ['thought', 'action'],
        additionalProperties: false
      }
    },
  }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

let fullContent = '';
let tokenUsage: any = null;

console.log('🤖 AI Response:\n');

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6); // Remove "data: " prefix
      
      if (data === '[DONE]') {
        break;
      }
      
      try {
        const parsed = JSON.parse(data);
        
        // Extract content from the delta
        if (parsed.choices?.[0]?.delta?.content) {
          const content = parsed.choices[0].delta.content;
          fullContent += content;
          process.stdout.write(content); // Stream the content in real-time
        }
        
        // Capture token usage from the final chunk
        if (parsed.usage) {
          tokenUsage = parsed.usage;
        }
      } catch (e) {
        // Skip malformed JSON chunks
      }
    }
  }
}

console.log('\n\n📊 Token Usage:');
if (tokenUsage) {
  console.log(`Prompt tokens: ${tokenUsage.prompt_tokens}`);
  console.log(`Completion tokens: ${tokenUsage.completion_tokens}`);
  console.log(`Total tokens: ${tokenUsage.total_tokens}`);
} else {
  console.log('Token usage not available');
}

console.log('\n📝 Full Response:');
console.log('Raw content:', fullContent);

console.log('\n🔍 Attempting JSON Parse:');
try {
  const parsedResponse = JSON.parse(fullContent);
  console.log('✅ Successfully parsed JSON:');
  console.log(JSON.stringify(parsedResponse, null, 2));
} catch (e) {
  console.log('❌ Could not parse as JSON');
  console.log('Error:', (e as Error).message);
}
