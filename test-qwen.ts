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
        content: `You are a helpful assistant that always responds in valid JSON format. Your response must be in the following JSON format:
{
  "thought": "your reasoning process about the problem",
  "code": "executable Python code to solve the problem"
}

Always respond with properly formatted JSON only.`
      },
      { 
        role: 'user', 
        content: 'Calculate compound interest at 15k premium, 6% interest compounded semi annually for 6 years.'
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
            description: 'your thinking process'
          },
          code: {
            type: 'string',
            description: 'python code to calculate this'
          }
        },
        required: ['thought', 'code'],
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
