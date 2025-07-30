'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Sparkles, Copy, Check, Edit, Eye } from 'lucide-react';
import Editor from '@monaco-editor/react';
import LivePreview from './LivePreview';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  thought?: string;
  code?: string;
  screenshot?: string;
  componentUrl?: string;
  timestamp: Date;
  conversationId?: string;
}

interface CodePanelProps {
  message: Message;
  onPreviewResult?: (result: { success: boolean; error?: string }) => void;
}

export default function CodePanel({ message, onPreviewResult }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'edit'>('code');
  const [copied, setCopied] = useState(false);
  const [editableCode, setEditableCode] = useState(message.code || '');
  const [isEditing, setIsEditing] = useState(false);

  // Auto-switch to preview only once when code first becomes available
  useEffect(() => {
    if (message.code && activeTab === 'code' && !isEditing) {
      // Only auto-switch if user hasn't manually changed tabs
      const hasUserInteracted = sessionStorage.getItem(`panel-${message.id}-interacted`);
      if (!hasUserInteracted) {
        setTimeout(() => setActiveTab('preview'), 1000);
      }
    }
  }, [message.code]);

  // Update editable code when message code changes
  useEffect(() => {
    setEditableCode(message.code || '');
  }, [message.code]);

  const copyToClipboard = () => {
    const codeToCopy = isEditing ? editableCode : message.code;
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950/50">
        <div className="flex items-center">
          <button
            onClick={() => {
              setActiveTab('code');
              sessionStorage.setItem(`panel-${message.id}-interacted`, 'true');
            }}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'code' 
                ? 'text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code
            </span>
            {activeTab === 'code' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" 
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('preview');
              sessionStorage.setItem(`panel-${message.id}-interacted`, 'true');
            }}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'preview' 
                ? 'text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </span>
            {activeTab === 'preview' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" 
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('edit');
              setIsEditing(true);
              sessionStorage.setItem(`panel-${message.id}-interacted`, 'true');
            }}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'edit' 
                ? 'text-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </span>
            {activeTab === 'edit' && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" 
              />
            )}
          </button>
        </div>
        <div className="px-4 flex items-center gap-3">
          {(activeTab === 'code' || activeTab === 'edit') && (
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          <span className="text-xs text-gray-500">Live Preview</span>
        </div>
      </div>

      {/* Content Area with Sliding Animation */}
      <div className="flex-1 overflow-hidden relative bg-gray-900">
        <AnimatePresence mode="wait">
          {activeTab === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue={message.code || ''}
                value={message.code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false
                }}
              />
            </motion.div>
          ) : activeTab === 'preview' ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <LivePreview 
                code={editableCode || message.code || ''} 
                onPreviewResult={onPreviewResult}
              />
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={editableCode}
                theme="vs-dark"
                onChange={(value) => setEditableCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false
                }}
              />
              {/* Live Preview Overlay */}
              {isEditing && (
                <div className="absolute bottom-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  Preview updates live as you type
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}