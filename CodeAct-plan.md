# CodeAct Agent Architecture Plan

## 🎯 Vision
A powerful AI agent that can solve complex problems through iterative code execution, debugging, and refinement.

## 🔄 Core Process Flow

### Step 1: Initial Query Processing
```
User Query → AI Analysis → Generate Response
```

### Step 2: Response Structure
The AI will respond with a JSON structure that includes:
- `thought`: Reasoning about the problem and approach
- `action`: What to do next (`execute_code` | `provide_answer` | `continue_debugging`)
- `code`: Python code to execute (if action is `execute_code`)
- `final_answer`: The final response (if action is `provide_answer`)

### Step 3: Execution Loop
```
1. AI generates thought + code
2. Execute code in Docker sandbox
3. Capture output/errors
4. Feed results back to AI
5. AI decides next action:
   - If successful → provide final_answer
   - If needs work → generate new code
   - If error → debug and fix
6. Repeat until completion
```

## 🧠 AI Response Schema

### Option A: Action-Based Schema (SELECTED)
```json
{
  "thought": "string - reasoning process",
  "action": "execute_code | debug_error | provide_answer",
  "code": "string - Python code (required for execute_code and debug_error)",
  "final_answer": "string - final response (only when action=provide_answer)"
}
```

### Action Types:
- **`execute_code`**: Run new code to solve the problem
- **`debug_error`**: Fix/debug previous code that had errors
- **`provide_answer`**: Give final response (no more code needed)

### Code Field Requirements:
- ✅ **Required** when `action = execute_code`
- ✅ **Required** when `action = debug_error` 
- ❌ **Not needed** when `action = provide_answer`

## 🐳 Docker Execution Environment

### Requirements:
- Isolated Python environment
- Common libraries pre-installed (numpy, pandas, matplotlib, etc.)
- File system access for data manipulation
- Output capture (stdout, stderr, return values)
- Timeout protection
- Resource limits

### Execution Flow:
```
Code Input → Docker Container → Python Execution → Output/Error Capture → Return Results
```

## 💬 Conversation Management & Flow

### Context Preservation:
- Maintain conversation history
- Track executed code and results
- Remember previous attempts and failures
- Build knowledge over iterations

### Detailed Conversation Flow:

#### Message Structure:
Each conversation turn includes:
1. **User/System Message**: Contains the query or execution result
2. **AI Response**: JSON with thought, action, code, final_answer
3. **Tool Call Result**: Execution output fed back as system message

#### Example Multi-Turn Flow:
```
Turn 1:
User: "Calculate compound interest at 15k premium, 6% interest compounded semi annually for 6 years"

AI Response 1:
{
  "thought": "I need to use the compound interest formula A = P(1 + r/n)^(nt)...",
  "action": "execute_code",
  "code": "principal = 15000\nrate = 0.06\n# Oops, forgot to define other variables"
}

System Message (Execution Result):
"Error: NameError: name 'n' is not defined"

Turn 2:
AI Response 2:
{
  "thought": "I got an error because I didn't define all variables. Let me fix this...",
  "action": "debug_error",
  "code": "principal = 15000\nrate = 0.06\nn = 2  # semi-annual\nt = 6\nfinal_amount = principal * (1 + rate/n)**(n*t)\nprint(f'Final Amount: ${final_amount:.2f}')"
}

System Message (Execution Result):
"Final Amount: $21,386.41"

Turn 3:
AI Response 3:
{
  "thought": "Perfect! The calculation executed successfully and shows the final amount.",
  "action": "provide_answer",
  "final_answer": "Based on the calculation, with a $15,000 premium at 6% interest compounded semi-annually for 6 years, you would earn $6,386.41 in compound interest, resulting in a final amount of $21,386.41."
}
```

### Technical Implementation:
The conversation history will look like this:
```javascript
[
  { role: "user", content: "Calculate compound interest..." },
  { role: "assistant", content: "{\"thought\": \"I need to...\", \"action\": \"execute_code\", \"code\": \"...\"}" },
  { role: "system", content: "EXECUTION_RESULT: Error: NameError..." },
  { role: "assistant", content: "{\"thought\": \"I got an error...\", \"action\": \"debug_error\", \"code\": \"...\"}" },
  { role: "system", content: "EXECUTION_RESULT: Final Amount: $21,386.41" },
  { role: "assistant", content: "{\"thought\": \"Perfect!\", \"action\": \"provide_answer\", \"final_answer\": \"...\"}" }
]
```

### Example Conversation Flow:
```
User: "Calculate compound interest at 15k premium, 6% interest compounded semi annually for 6 years"

AI Response 1:
{
  "thought": "I need to use the compound interest formula...",
  "action": "execute_code",
  "code": "principal = 15000\n..."
}

Execution Result: "Final Amount: $21,386.41"

AI Response 2:
{
  "thought": "The calculation executed successfully...",
  "action": "provide_answer", 
  "final_answer": "Based on the calculation, with a $15,000 premium..."
}
```

## 🔧 System Components

### 1. AI Interface (Qwen3)
- Structured output generation
- Context management
- Error analysis and debugging

### 2. Code Executor
- Docker container management
- Python environment
- Output/error capture
- Security and resource limits

### 3. Orchestrator
- Manages conversation flow
- Handles execution loop
- Determines when to stop/continue

### 4. Response Parser
- Validates AI JSON responses
- Extracts actions and code
- Handles malformed responses

## 🎨 User Experience

### Streaming Display:
1. Show AI's `thought` process in real-time
2. Display code being executed
3. Show execution results
4. Present final answer when ready

### Example Output:
```
🤖 Thinking: I need to use the compound interest formula...

💻 Executing Code:
principal = 15000
rate = 0.06
...

✅ Execution Result:
Final Amount: $21,386.41
Compound Interest: $6,386.41

🎯 Final Answer:
Based on the calculation, with a $15,000 premium at 6% interest 
compounded semi-annually for 6 years, you would earn $6,386.41 in 
compound interest, resulting in a final amount of $21,386.41.
```

## 📋 Implementation Phases

### Phase 1: Basic Loop
- Simple execute → analyze → respond cycle
- Basic Docker integration
- Console output

### Phase 2: Enhanced AI
- Better error handling and debugging
- Multi-step problem solving
- Improved context management

### Phase 3: Advanced Features
- File handling and data analysis
- Visualization generation
- Web scraping capabilities
- API integrations

### Phase 4: Production Ready
- Web interface
- User session management
- Advanced security
- Performance optimization

## 🤔 Design Decisions to Make

1. ✅ **Schema Choice**: Action-based response format (DECIDED)
2. **Error Handling**: How to handle infinite loops or persistent errors?
3. **Security**: What code restrictions are needed?
4. **Performance**: Caching, optimization strategies?
5. **UI/UX**: Command line vs web interface priority?

## 💡 Next Steps

1. Finalize the AI response schema
2. Create a simple prototype with manual code execution
3. Integrate Docker for automated execution
4. Build the conversation loop
5. Add streaming and real-time display
6. Test with various problem types

---

*This plan will evolve as we build and test the system.*
