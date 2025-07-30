'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Custom styling for different markdown elements
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-gray-900">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-gray-900">{children}</h3>,
        p: ({ children }) => <p className="mb-3 text-gray-800 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-gray-800">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-1 mb-3 italic text-gray-700">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4 border-gray-300" />,
        a: ({ href, children }) => (
          <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}