'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Send, Brain, Code, MessageSquare, Sparkles } from 'lucide-react';
import { extractPartialJsonFields } from './utils/parsePartialJson';
import CodePanel from './components/CodePanel';
import MarkdownRenderer from './components/MarkdownRenderer';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  thought?: string;
  action?: 'execute_code' | 'debug_error' | 'provide_answer';
  code?: string;
  timestamp: Date;
  conversationId?: string; // Track which conversation this belongs to
}

interface AIResponse {
  thought: string;
  action: 'execute_code' | 'debug_error' | 'provide_answer';
  code?: string;
  final_answer?: string;
}

interface ConversationState {
  id: string;
  turnCount: number;
  maxTurns: number;
  waitingForFinalPreview?: boolean;
}

// Function to clean markdown formatting from JSON response
function cleanMarkdownFromJSON(content: string): string {
  // Remove markdown code block formatting
  return content
    .replace(/^```json\s*/i, '')  // Remove opening ```json
    .replace(/^```\s*/i, '')      // Remove opening ```  
    .replace(/\s*```\s*$/i, '')   // Remove closing ```
    .replace(/^"json\s*/i, '')    // Remove "json prefix
    .replace(/^""json\s*/i, '')   // Remove ""json prefix
    .replace(/"\s*$/i, '')        // Remove trailing "
    .trim();
}

// Validation function to ensure AI follows CodeAct pattern
function validateAndCleanAIResponse(response: AIResponse): AIResponse {
  // If action is execute_code or debug_error, remove any final_answer
  if ((response.action === 'execute_code' || response.action === 'debug_error') && response.final_answer) {
    console.warn('[CodeAct] WARNING: AI provided final_answer with action:', response.action, '- removing final_answer to enforce execution loop');
    const { final_answer, ...cleanedResponse } = response;
    return cleanedResponse as AIResponse;
  }
  return response;
}

export default function CodeActInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your CodeAct learning assistant. I can help you learn concepts through interactive visualizations or have normal conversations. What would you like to explore?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Set<string>>(new Set());
  const [currentConversation, setCurrentConversation] = useState<ConversationState | null>(null);
  const [awaitingPreviewResult, setAwaitingPreviewResult] = useState(false);
  const [lastFeedbackTime, setLastFeedbackTime] = useState(0);
  const [pendingFeedback, setPendingFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true, force = false) => {
    if (messagesEndRef.current) {
      const messagesContainer = messagesEndRef.current.parentElement;
      if (!messagesContainer || force) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto', 
          block: 'end',
          inline: 'nearest'
        });
        return;
      }

      // Check if user is already near the bottom (within 100px)
      const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto', 
          block: 'end',
          inline: 'nearest'
        });
      }
    }
  };

  useEffect(() => {
    // Only scroll when a new message is added, with smooth scroll
    scrollToBottom(true, true);
  }, [messages.length]);

  // Reduced frequency scroll during streaming, respecting user scroll position
  useEffect(() => {
    if (isLoading) {
      const scrollInterval = setInterval(() => {
        scrollToBottom(false, false); // Don't force scroll during streaming
      }, 200); // Much less frequent updates

      return () => clearInterval(scrollInterval);
    }
  }, [isLoading]);

  // Process pending feedback when loading is done
  useEffect(() => {
    if (!isLoading && pendingFeedback && currentConversation) {
      console.log('[CodeAct] Processing pending feedback now that loading is done');
      const feedback = pendingFeedback;
      setPendingFeedback(null);
      // Small delay to ensure UI updates
      setTimeout(() => {
        submitFeedback(feedback);
      }, 100);
    }
  }, [isLoading, pendingFeedback, currentConversation]);

  const toggleThought = (messageId: string) => {
    setExpandedThoughts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Function to handle automatic feedback submission
  const submitFeedback = async (feedbackMessage: string) => {
    console.log('[CodeAct] Auto-submitting feedback:', feedbackMessage);
    console.log('[CodeAct] Current conversation state:', currentConversation);
    console.log('[CodeAct] Is loading:', isLoading);
    
    if (!currentConversation || isLoading) {
      console.log('[CodeAct] Cannot submit feedback - no conversation or already loading');
      return;
    }

    // Instead of creating a new user message, append the execution result to the last AI message
    setMessages(prev => {
      const lastAIMessageIndex = prev.findLastIndex(msg => msg.type === 'ai' && msg.conversationId === currentConversation.id);
      if (lastAIMessageIndex === -1) {
        console.error('[CodeAct] No AI message found to append execution result to');
        return prev;
      }
      
      const updatedMessages = [...prev];
      const lastAIMessage = updatedMessages[lastAIMessageIndex];
      
      // Append the execution result to the content
      updatedMessages[lastAIMessageIndex] = {
        ...lastAIMessage,
        content: lastAIMessage.content 
          ? `${lastAIMessage.content}\n\n${feedbackMessage}` 
          : feedbackMessage
      };
      
      return updatedMessages;
    });

    setIsLoading(true);
    setAwaitingPreviewResult(false);

    try {
      console.log('[CodeAct] Sending feedback to AI, turn:', currentConversation.turnCount + 1);
      
      // Get conversation history
      const conversationHistory = messages
        .filter(msg => msg.conversationId === currentConversation.id)
        .slice(-20)
        .map(msg => {
          if (msg.type === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            // For AI messages, format all components as a structured string
            let aiContent = '';
            if (msg.thought) {
              aiContent += `THOUGHT: ${msg.thought}\n\n`;
            }
            if (msg.action) {
              aiContent += `ACTION: ${msg.action}\n\n`;
            }
            if (msg.code) {
              aiContent += `CODE:\n${msg.code}\n\n`;
            }
            if (msg.content) {
              // Check if content is the final_answer
              if (msg.action === 'provide_answer') {
                aiContent += `FINAL_ANSWER: ${msg.content}`;
              } else {
                aiContent += `CONTENT: ${msg.content}`;
              }
            }
            return { role: 'assistant', content: aiContent.trim() };
          }
        });
      
      console.log('[CodeAct] Conversation history being sent:', JSON.stringify(conversationHistory, null, 2));

      // Send the execution result directly as the message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: feedbackMessage, // Send the EXECUTION_RESULT directly
          conversationHistory,
          conversationTurn: currentConversation.turnCount + 1,
          maxTurns: currentConversation.maxTurns
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Process streaming response (same as handleSubmit)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '',
        thought: '',
        timestamp: new Date(),
        conversationId: currentConversation.id
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let lastExtractedFields: { thought?: string; final_answer?: string; code?: string; action?: string } = {};

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                fullContent += content;
                
                const extractedFields = extractPartialJsonFields(fullContent);
                
                let shouldUpdate = false;
                const updates: Partial<Message> = {};
                
                if (extractedFields.thought && extractedFields.thought !== lastExtractedFields.thought) {
                  updates.thought = extractedFields.thought;
                  shouldUpdate = true;
                  
                  if (!expandedThoughts.has(aiMessage.id)) {
                    setExpandedThoughts(prev => new Set([...prev, aiMessage.id]));
                  }
                }
                
                if (extractedFields.final_answer && extractedFields.final_answer !== lastExtractedFields.final_answer) {
                  updates.content = extractedFields.final_answer;
                  shouldUpdate = true;
                }
                
                if (extractedFields.code && extractedFields.code !== lastExtractedFields.code) {
                  updates.code = extractedFields.code;
                  shouldUpdate = true;
                  console.log('[CodeAct] AI generated new code in feedback response');
                  // Set awaitingPreviewResult immediately when we see code
                  setAwaitingPreviewResult(true);
                  console.log('[CodeAct] Set awaitingPreviewResult to true immediately');
                }
                
                if (extractedFields.action && extractedFields.action !== lastExtractedFields.action) {
                  updates.action = extractedFields.action as 'execute_code' | 'debug_error' | 'provide_answer';
                  shouldUpdate = true;
                }
                
                if (shouldUpdate) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessage.id 
                      ? { ...msg, ...updates }
                      : msg
                  ));
                  lastExtractedFields = extractedFields;
                  scrollToBottom(false, false);
                }
              }
            } catch (e) {
              // Skip malformed JSON chunks
            }
          }
        }
      }

      // Parse final response
      let aiResponse: AIResponse;
      try {
        const cleanedContent = cleanMarkdownFromJSON(fullContent);
        aiResponse = JSON.parse(cleanedContent);
        console.log('[CodeAct] AI response action:', aiResponse.action);
        
        // Validate and clean the response
        aiResponse = validateAndCleanAIResponse(aiResponse);
      } catch (error) {
        console.error('[CodeAct] Failed to parse AI response:', fullContent);
        aiResponse = {
          thought: "I encountered an error processing your request.",
          action: 'provide_answer' as const,
          final_answer: "I'm sorry, I had trouble understanding your request. Please try again."
        };
      }

      // Update conversation state
      const updatedConversation = {
        ...currentConversation,
        turnCount: currentConversation.turnCount + 1
      };

      // Handle conversation state based on action type
      if (aiResponse.action === 'execute_code' || aiResponse.action === 'debug_error') {
        // For execute_code and debug_error, ALWAYS continue - must await execution result
        console.log('[CodeAct] Code execution pending (', aiResponse.action, ') in feedback - must await result before ending');
        setCurrentConversation(updatedConversation);
        // awaitingPreviewResult is already set during streaming when code was detected
        if (!aiResponse.code) {
          console.error('[CodeAct] ERROR: Action is', aiResponse.action, 'but no code provided!');
        }
      } else if (aiResponse.action === 'provide_answer') {
        console.log('[CodeAct] AI provided final answer in feedback');
        
        // If there's code, we need to wait for preview before truly ending
        if (aiResponse.code) {
          console.log('[CodeAct] AI provided final answer WITH code - keeping conversation alive for preview result');
          // Keep conversation alive but mark that we're waiting for final preview
          setCurrentConversation({
            ...updatedConversation,
            waitingForFinalPreview: true
          });
        } else {
          console.log('[CodeAct] AI provided final answer without code, keeping conversation alive');
          // Keep the conversation alive so history is maintained
          setCurrentConversation(updatedConversation);
          setAwaitingPreviewResult(false);
        }
      } else {
        // Fallback - continue conversation
        console.log('[CodeAct] Unknown action in feedback, continuing conversation');
        setCurrentConversation(updatedConversation);
      }

    } catch (error) {
      console.error('[CodeAct] Error in feedback loop:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        conversationId: currentConversation?.id
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentConversation(null);
      setAwaitingPreviewResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Start a new conversation or continue existing one
    let conversation = currentConversation;
    if (!conversation || conversation.turnCount >= conversation.maxTurns) {
      // Start fresh conversation
      conversation = {
        id: Date.now().toString(),
        turnCount: 0,
        maxTurns: 8
      };
      setCurrentConversation(conversation);
    }

    // Add conversation ID to user message
    userMessage.conversationId = conversation.id;

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if we've exceeded max turns
      if (conversation.turnCount >= conversation.maxTurns) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'Sorry, I reached the maximum number of attempts for this problem. Please try asking your question in a different way or start fresh.',
          timestamp: new Date(),
          conversationId: conversation.id
        };
        setMessages(prev => [...prev, errorMessage]);
        setCurrentConversation(null); // Reset conversation
        return;
      }

            // Get conversation history (last 20 messages max for current conversation = 10 Q&A pairs)
      const conversationHistory = messages
        .filter(msg => msg.conversationId === conversation.id)
        .slice(-20) // Keep only last 20 messages (10 Q&A pairs)
        .map(msg => {
          if (msg.type === 'user') {
            return { role: 'user', content: msg.content };
          } else {
            // For AI messages, format all components as a structured string
            let aiContent = '';
            if (msg.thought) {
              aiContent += `THOUGHT: ${msg.thought}\n\n`;
            }
            if (msg.action) {
              aiContent += `ACTION: ${msg.action}\n\n`;
            }
            if (msg.code) {
              aiContent += `CODE:\n${msg.code}\n\n`;
            }
            if (msg.content) {
              // Check if content is the final_answer
              if (msg.action === 'provide_answer') {
                aiContent += `FINAL_ANSWER: ${msg.content}`;
              } else {
                aiContent += `CONTENT: ${msg.content}`;
              }
            }
            return { role: 'assistant', content: aiContent.trim() };
          }
        });

      // DEBUG: Log conversation history details
      const userMessagesCount = conversationHistory.filter(msg => msg.role === 'user').length;
      const aiMessagesCount = conversationHistory.filter(msg => msg.role === 'assistant').length;
      console.log('[CodeAct DEBUG] Conversation history stats:');
      console.log(`  - Total messages in history: ${conversationHistory.length}`);
      console.log(`  - User messages: ${userMessagesCount}`);
      console.log(`  - AI messages: ${aiMessagesCount}`);
      console.log(`  - Q&A pairs: ${Math.min(userMessagesCount, aiMessagesCount)}`);
      console.log('[CodeAct DEBUG] Full conversation history:', JSON.stringify(conversationHistory, null, 2));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          conversationHistory,
          conversationTurn: conversation.turnCount + 1,
          maxTurns: conversation.maxTurns
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Create the AI message with empty content initially
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '',
        thought: '',
        timestamp: new Date(),
        conversationId: conversation.id
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let lastExtractedFields: { thought?: string; final_answer?: string; code?: string; action?: string } = {};

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                fullContent += content;
                
                // Extract fields from partial JSON as they become available
                const extractedFields = extractPartialJsonFields(fullContent);
                
                // Update the message progressively as fields become available
                let shouldUpdate = false;
                const updates: Partial<Message> = {};
                
                // Update thought if newly available or changed
                if (extractedFields.thought && extractedFields.thought !== lastExtractedFields.thought) {
                  updates.thought = extractedFields.thought;
                  shouldUpdate = true;
                  
                  // Auto-expand the thought section when thought starts streaming
                  if (!expandedThoughts.has(aiMessage.id)) {
                    setExpandedThoughts(prev => new Set([...prev, aiMessage.id]));
                  }
                }
                
                // Update final_answer if newly available or changed
                if (extractedFields.final_answer && extractedFields.final_answer !== lastExtractedFields.final_answer) {
                  updates.content = extractedFields.final_answer;
                  shouldUpdate = true;
                }
                
                // Update code if newly available
                if (extractedFields.code && extractedFields.code !== lastExtractedFields.code) {
                  updates.code = extractedFields.code;
                  shouldUpdate = true;
                  console.log('[CodeAct] AI generated new code, will await preview result after streaming completes');
                  // Set awaitingPreviewResult immediately when we see code
                  setAwaitingPreviewResult(true);
                  console.log('[CodeAct] Set awaitingPreviewResult to true immediately');
                }
                
                // Update action if newly available
                if (extractedFields.action && extractedFields.action !== lastExtractedFields.action) {
                  updates.action = extractedFields.action as 'execute_code' | 'debug_error' | 'provide_answer';
                  shouldUpdate = true;
                }
                
                // No need to track screenshot status anymore
                
                if (shouldUpdate) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessage.id 
                      ? { ...msg, ...updates }
                      : msg
                  ));
                  lastExtractedFields = extractedFields;
                  
                  // Scroll to bottom when content updates during streaming
                  scrollToBottom(false, false);
                }
              }
            } catch (e) {
              // Skip malformed JSON chunks
            }
          }
        }
      }

      // Parse the final complete response
      let aiResponse: AIResponse;
      try {
        const cleanedContent = cleanMarkdownFromJSON(fullContent);
        aiResponse = JSON.parse(cleanedContent);
        console.log('[CodeAct] AI response action:', aiResponse.action);
        
        // Validate and clean the response
        aiResponse = validateAndCleanAIResponse(aiResponse);
      } catch (error) {
        console.error('[CodeAct] Failed to parse AI response:', fullContent);
        aiResponse = {
          thought: "I encountered an error processing your request.",
          action: 'provide_answer' as const,
          final_answer: "I'm sorry, I had trouble understanding your request. Please try again."
        };
      }

      // Update conversation state
      const updatedConversation = {
        ...conversation,
        turnCount: conversation.turnCount + 1
      };

      // Handle conversation state based on action type
      if (aiResponse.action === 'execute_code' || aiResponse.action === 'debug_error') {
        // For execute_code and debug_error, ALWAYS continue - must await execution result
        console.log('[CodeAct] Code execution pending (', aiResponse.action, ') - must await result before ending');
        setCurrentConversation(updatedConversation);
        // awaitingPreviewResult is already set during streaming when code was detected
        if (!aiResponse.code) {
          console.error('[CodeAct] ERROR: Action is', aiResponse.action, 'but no code provided!');
        }
      } else if (aiResponse.action === 'provide_answer') {
        console.log('[CodeAct] AI provided final answer');
        
        // If there's code, we need to wait for preview before truly ending
        if (aiResponse.code) {
          console.log('[CodeAct] AI provided final answer WITH code - keeping conversation alive for preview result');
          // Keep conversation alive but mark that we're waiting for final preview
          setCurrentConversation({
            ...updatedConversation,
            waitingForFinalPreview: true
          });
        } else {
          console.log('[CodeAct] AI provided final answer without code, keeping conversation alive');
          // Keep the conversation alive so history is maintained
          setCurrentConversation(updatedConversation);
          setAwaitingPreviewResult(false);
        }
      } else {
        // Fallback - continue conversation
        console.log('[CodeAct] Unknown action, continuing conversation');
        setCurrentConversation(updatedConversation);
      }

      // React code is now handled by LivePreview component directly
      // No need for server-side execution anymore

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        conversationId: conversation?.id
      };
      setMessages(prev => [...prev, errorMessage]);
      setCurrentConversation(null); // Reset conversation on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Panel - Chat Interface */}
      <div className="w-1/2 flex flex-col h-screen">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CodeAct Agent
                </h1>
                <p className="text-gray-600 text-sm">Interactive Learning Assistant</p>
              </div>
            </div>
            
            {/* Turn Counter */}
            {currentConversation && (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                Turn {currentConversation.turnCount + 1}/{currentConversation.maxTurns}
              </div>
            )}
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* User Message */}
                {message.type === 'user' && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl rounded-tr-md shadow-lg">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs text-blue-100 mt-2" suppressHydrationWarning>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {/* AI Message */}
                {message.type === 'ai' && (
                  <div className="space-y-3">
                    {/* Thought Process */}
                    {message.thought && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleThought(message.id)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-amber-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">AI Thinking Process</span>
                          </div>
                          {expandedThoughts.has(message.id) ? 
                            <ChevronUp className="w-4 h-4 text-amber-600" /> : 
                            <ChevronDown className="w-4 h-4 text-amber-600" />
                          }
                        </button>
                        {expandedThoughts.has(message.id) && (
                          <div className="px-3 pb-3">
                            <p className="text-sm text-amber-700 leading-relaxed">
                              {message.thought}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Main Response */}
                    <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-lg border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          {message.content ? (
                            <MarkdownRenderer content={message.content} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse flex gap-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span className="text-sm text-gray-500">AI is thinking...</span>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2" suppressHydrationWarning>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6"
        >
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything or request a visualization..."
                className="w-full pl-4 pr-12 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Panel - Code Execution & Results */}
      <div className="w-1/2 bg-gray-900 border-l border-gray-800 flex flex-col h-screen">
        {(() => {
          // Find the latest message with code
          const latestCodeMessage = messages
            .filter(msg => msg.type === 'ai' && msg.code)
            .slice(-1)[0];

          if (!latestCodeMessage || !latestCodeMessage.code) {
            return (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No code executed yet</p>
                  <p className="text-xs mt-1 opacity-75">Ask for a visualization or interactive component to see live results here</p>
                </div>
              </div>
            );
          }

          return (
            <CodePanel 
              key={latestCodeMessage.id} 
              message={latestCodeMessage}
              onPreviewResult={(result) => {
                console.log('[CodeAct] Preview result received:', result);
                console.log('[CodeAct] Current state - awaitingPreviewResult:', awaitingPreviewResult, 'isLoading:', isLoading);
                
                // Only process if we're expecting a preview result
                if (!awaitingPreviewResult) {
                  console.log('[CodeAct] WARNING: Ignoring preview result - not awaiting. This might be a timing issue!');
                  console.log('[CodeAct] Current conversation:', currentConversation);
                  return;
                }
                
                // Check if this is for the most recent AI message
                const isRecentMessage = latestCodeMessage.id === messages[messages.length - 1]?.id;
                if (!isRecentMessage) {
                  console.log('[CodeAct] Ignoring preview result - not from recent message');
                  return;
                }
                
                // Check if we have an active conversation that needs continuation
                if (currentConversation) {
                  // Check if this is a final preview (AI provided final_answer with code)
                  if (currentConversation.waitingForFinalPreview) {
                    console.log('[CodeAct] Preview result for final answer with code - conversation complete');
                    setCurrentConversation(null);
                    setAwaitingPreviewResult(false);
                    // No need to submit feedback, the AI already provided its final answer
                    return;
                  }
                  
                  // Normal case: continue if we haven't reached max turns
                  if (currentConversation.turnCount < currentConversation.maxTurns) {
                    console.log('[CodeAct] Processing preview result for turn:', currentConversation.turnCount);
                    
                    // Prevent duplicate feedback submissions
                    const now = Date.now();
                    if (now - lastFeedbackTime < 3000) {
                      console.log('[CodeAct] Skipping duplicate feedback - too soon after last submission');
                      return;
                    }
                    setLastFeedbackTime(now);
                    
                    // Prepare feedback message in the expected format
                    const feedbackMessage = result.success 
                      ? `EXECUTION_RESULT: Success! The React component rendered successfully. The preview shows the working component with no errors.`
                      : `EXECUTION_RESULT: Error - ${result.error}`;
                    
                    // Reset awaiting flag immediately to prevent duplicates
                    setAwaitingPreviewResult(false);
                    
                    // Check if we can submit now or need to queue
                    if (isLoading) {
                      console.log('[CodeAct] Loading in progress, queueing feedback for later');
                      setPendingFeedback(feedbackMessage);
                    } else {
                      // Auto-submit the feedback after a short delay
                      setTimeout(() => {
                        submitFeedback(feedbackMessage);
                      }, 1500); // Give user time to see the result
                    }
                  } else {
                    console.log('[CodeAct] Max turns reached');
                    setCurrentConversation(null);
                    setAwaitingPreviewResult(false);
                  }
                } else {
                  console.log('[CodeAct] No active conversation');
                  setAwaitingPreviewResult(false);
                }
              }}
            />
          );
        })()}
      </div>
    </div>
  );
}
