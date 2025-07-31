'use client';

import { useEffect, useRef, useState } from 'react';
import * as Babel from '@babel/standalone';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  className?: string;
  onPreviewResult?: (result: { success: boolean; error?: string }) => void;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-red-50 text-red-900 p-8">
      <AlertCircle className="w-12 h-12 mb-4 text-red-600" />
      <h2 className="text-xl font-semibold mb-2">Component Error</h2>
      <pre className="text-sm bg-red-100 p-4 rounded-lg overflow-auto max-w-full mb-4">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

export default function LivePreview({ code, className = '', onPreviewResult }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPreviewCode, setLastPreviewCode] = useState<string>('');

  const updatePreview = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument || !iframe.contentWindow) return;

      setIsLoading(true);
      setError(null);

      let processedCode = '';
      
      try {
        console.log('LivePreview: Transforming code...', code?.substring(0, 100));
        
        // Preprocess the code to remove import/export statements
        processedCode = code;
        processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
        processedCode = processedCode.replace(/import\s+['"].*?['"];?\s*/g, '');
        processedCode = processedCode.replace(/import\s*\{[^}]*\}\s*from\s*['"'][^'"]*['"'];?\s*/g, '');
        // Handle exports by making components available globally
        processedCode = processedCode.replace(/export\s+default\s+function\s+(\w+)/g, (match, name) => {
          console.log('Found exported function component:', name);
          return `window.${name} = function ${name}`;
        });
        processedCode = processedCode.replace(/export\s+default\s+(\w+);?/g, (match, name) => {
          console.log('Found default export:', name);
          return `window.${name} = ${name};`;
        });
        processedCode = processedCode.replace(/export\s+/g, '');
        
        // Fix AI-generated code that incorrectly escaped JSX tags
        // Convert escaped JSX tags back to proper JSX
        const beforeTagFix = processedCode;
        processedCode = processedCode.replace(/&lt;(\/?[a-zA-Z][^&>]*?)&gt;/g, '<$1>');
        
        if (beforeTagFix !== processedCode) {
          console.log('Fixed escaped JSX tags');
        }
        
        // Fix common JSX parsing issues by escaping problematic characters in text content only
        // Look for text content between JSX tags that contains comparison operators
        processedCode = processedCode.replace(
          />([^<>{}]*?)([<>])([^<>{}]*?)</g,
          (match, before, operator, after) => {
            // Only escape if this is clearly text content (not JSX structure)
            // Check if this is actually text content by looking for whitespace around operators
            if ((before.trim() || after.trim()) && 
                !before.includes('className') && 
                !after.includes('className') &&
                !before.includes('=') && 
                !after.includes('=')) {
              const escapedOp = operator === '<' ? '&lt;' : '&gt;';
              console.log(`Escaping text content: "${before}${operator}${after}" -> "${before}${escapedOp}${after}"`);
              return `>${before}${escapedOp}${after}<`;
            }
            return match;
          }
        );
        
        console.log('Final processed code:', processedCode.substring(0, 300));
        
        // Transform the code using Babel
        const transformedCode = Babel.transform(processedCode, {
          presets: ['env', 'react'],
          plugins: []
        }).code;
        
        console.log('LivePreview: Transformation successful');

        // Create the HTML content for the iframe
        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Live React Preview</title>
            
            <!-- React and ReactDOM -->
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            
            <!-- Educational Libraries -->
            <script src="https://unpkg.com/prop-types@15.8.1/prop-types.js"></script>
            <script src="https://unpkg.com/recharts@2.5.0/umd/Recharts.js"></script>
            <script src="https://unpkg.com/lucide@0.263.1/dist/umd/lucide.js"></script>
            <script src="https://unpkg.com/d3@7/dist/d3.min.js"></script>
            
            <!-- Tailwind CSS -->
            <script src="https://cdn.tailwindcss.com"></script>
            
            <!-- Base Styles -->
            <style>
              * {
                box-sizing: border-box;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #ffffff;
                overflow: auto;
              }
              #root {
                min-height: 100vh;
                width: 100%;
              }
              .error-display {
                padding: 20px;
                background: #fee;
                color: #c00;
                border: 1px solid #fcc;
                border-radius: 8px;
                margin: 20px;
                font-family: monospace;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              (function() {
                'use strict';
                try {
                  console.log('Starting component execution...');
                  
                  // Make libraries available globally
                  const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;
                
                // Recharts components
                const { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Area, AreaChart, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } = window.Recharts || {};
                
                // Lucide icons - create React components from the icon functions
                const lucideIcons = window.lucide || {};
                const createIcon = (iconName) => {
                  const icon = lucideIcons[iconName];
                  if (!icon) return null;
                  return (props) => {
                    const svgString = icon.toSvg(props);
                    return React.createElement('span', {
                      dangerouslySetInnerHTML: { __html: svgString },
                      ...props
                    });
                  };
                };
                
                // Common icons
                const TrendingUp = createIcon('trending-up');
                const DollarSign = createIcon('dollar-sign');
                const Calendar = createIcon('calendar');
                const Brain = createIcon('brain');
                const Code = createIcon('code');
                const MessageSquare = createIcon('message-square');
                const Sparkles = createIcon('sparkles');
                const ChevronDown = createIcon('chevron-down');
                const ChevronUp = createIcon('chevron-up');
                
                // Execute user code in try-catch to handle any errors
                console.log('About to execute transformed code...');
                
                // Flag to track if component rendered itself
                window.__COMPONENT_SELF_RENDERED__ = false;
                
                // Override ReactDOM.createRoot to detect self-rendering
                const originalCreateRoot = ReactDOM.createRoot;
                ReactDOM.createRoot = function(element) {
                  const root = originalCreateRoot.apply(this, arguments);
                  const originalRender = root.render;
                  root.render = function() {
                    window.__COMPONENT_SELF_RENDERED__ = true;
                    console.log('Component is self-rendering');
                    return originalRender.apply(this, arguments);
                  };
                  return root;
                };
                
                try {
                  ${transformedCode}
                  console.log('Code executed successfully');
                } catch (codeError) {
                  console.error('Error in user code:', codeError);
                  document.getElementById('root').innerHTML = '<div class="error-display">Error in component code: ' + codeError.message + '</div>';
                  window.__PREVIEW_SUCCESS__ = false;
                  return;
                }
                
                // Find the component to render - try multiple strategies
                let ComponentToRender = null;
                
                // Strategy 1: Look for common component names (include the actual component name from code)
                const componentNames = ['App', 'Component', 'Main', 'Example', 'GeneratedComponent', 'ColorfulCounter', 'Counter', 'SalesBarChart'];
                for (const name of componentNames) {
                  if (typeof window[name] !== 'undefined' && typeof window[name] === 'function') {
                    ComponentToRender = window[name];
                    console.log('Found component:', name);
                    break;
                  }
                }
                
                // Strategy 2: Try to extract from the original code pattern
                if (!ComponentToRender) {
                  // Match function ComponentName() or const ComponentName = () =>
                  const patterns = [
                    /function\\s+(\\w+)\\s*\\(/,
                    /const\\s+(\\w+)\\s*=\\s*\\(.*?\\)\\s*=>/,
                    /const\\s+(\\w+)\\s*=\\s*function/,
                    /let\\s+(\\w+)\\s*=\\s*\\(.*?\\)\\s*=>/,
                    /var\\s+(\\w+)\\s*=\\s*\\(.*?\\)\\s*=>/
                  ];
                  
                  const originalCode = ${JSON.stringify(processedCode)};
                  for (const pattern of patterns) {
                    const match = originalCode.match(pattern);
                    if (match && match[1]) {
                      const componentName = match[1];
                      if (typeof window[componentName] !== 'undefined') {
                        ComponentToRender = window[componentName];
                        console.log('Found component via pattern:', componentName);
                        break;
                      }
                    }
                  }
                }
                
                // Strategy 3: Look for any capitalized function
                if (!ComponentToRender) {
                  const globalKeys = Object.keys(window);
                  const componentKey = globalKeys.find(key => {
                    return key[0] === key[0].toUpperCase() && 
                           typeof window[key] === 'function' &&
                           key !== 'Object' && key !== 'Function' && key !== 'Array' &&
                           !key.startsWith('HTML') && !key.startsWith('SVG') &&
                           !key.startsWith('CSS') && !key.startsWith('DOM');
                  });
                  if (componentKey) {
                    ComponentToRender = window[componentKey];
                    console.log('Found component via capitalized function:', componentKey);
                  }
                }
                
                // Check if component already rendered itself
                if (window.__COMPONENT_SELF_RENDERED__) {
                  console.log('Component rendered itself successfully');
                  window.__PREVIEW_SUCCESS__ = true;
                } else {
                  // Log all available functions for debugging
                  console.log('Available global functions:', Object.keys(window).filter(k => 
                    typeof window[k] === 'function' && 
                    k[0] === k[0].toUpperCase() &&
                    !['Object', 'Function', 'Array', 'String', 'Number', 'Boolean', 'Date', 'RegExp', 'Error'].includes(k)
                  ).slice(0, 10));
                  
                  if (ComponentToRender) {
                    console.log('Found component:', ComponentToRender.name || 'Anonymous');
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(ComponentToRender));
                    
                    // Mark as successful render
                    window.__PREVIEW_SUCCESS__ = true;
                  } else {
                    console.error('No component found. Available globals:', Object.keys(window).filter(k => k[0] === k[0].toUpperCase()).slice(0, 20));
                    window.__PREVIEW_SUCCESS__ = false;
                    throw new Error('No React component found. Make sure to define a component like "function App() { ... }"');
                  }
                }
                } catch (error) {
                  document.getElementById('root').innerHTML = '<div class="error-display">Error: ' + error.message + '</div>';
                  console.error('Preview error:', error);
                }
              })();
            </script>
          </body>
          </html>
        `;

        // Write the HTML to the iframe
        const doc = iframe.contentDocument;
        doc.open();
        doc.write(html);
        doc.close();

        setIsLoading(false);
        
        // Notify parent of preview result after checking if component actually rendered
        if (onPreviewResult) {
          setTimeout(() => {
            // Check if the component actually rendered by looking for the success flag
            const iframeWindow = iframe.contentWindow as Window & { __PREVIEW_SUCCESS__?: boolean; __COMPONENT_SELF_RENDERED__?: boolean };
            const actuallyRendered = iframeWindow?.__PREVIEW_SUCCESS__ === true;
            const selfRendered = iframeWindow?.__COMPONENT_SELF_RENDERED__ === true;
            
            if (actuallyRendered || selfRendered) {
              console.log('LivePreview: Component rendered successfully', { actuallyRendered, selfRendered });
              onPreviewResult({ success: true });
            } else {
              console.log('LivePreview: Component failed to render (no component found)');
              onPreviewResult({ 
                success: false, 
                error: 'No React component found. Make sure to define a component like "function App() { ... }"' 
              });
            }
          }, 800); // Slightly longer delay to ensure render completes
        }
      } catch (err) {
        console.error('Preview transformation error:', err);
        
        // Enhanced error handling with code context
        if (err instanceof Error) {
          let errorMessage = err.message;
          
          // If it's a Babel parsing error, try to provide more helpful feedback
          if (errorMessage.includes('Unexpected token')) {
            // Try to extract the problematic line and column
            const errorMatch = errorMessage.match(/\((\d+):(\d+)\)/);
            if (errorMatch) {
              const lineNum = parseInt(errorMatch[1]);
              const colNum = parseInt(errorMatch[2]);
              
              // Get the problematic line from the processed code
              const lines = processedCode.split('\n');
              const problematicLine = lines[lineNum - 1];
              
              if (problematicLine) {
                errorMessage = `Syntax error at line ${lineNum}, column ${colNum}:\n\n${problematicLine}\n\nCommon fixes:\n- Use &lt; instead of < in text content\n- Use &gt; instead of > in text content\n- Check for unmatched JSX tags\n- Ensure all JSX expressions are wrapped in {}`;
              }
            }
            
            // Check for common JSX text content issues
            if (processedCode.includes('< ') || processedCode.includes(' >')) {
              errorMessage += '\n\nDetected unescaped < or > characters in text. Use &lt; and &gt; instead.';
            }
          }
          
          setError(errorMessage);
        } else {
          setError('Failed to transform code');
        }
        setIsLoading(false);
        
        // Notify parent of error
        if (onPreviewResult) {
          onPreviewResult({ 
            success: false, 
            error: err instanceof Error ? err.message : 'Failed to transform code' 
          });
        }
      }
    };

  useEffect(() => {
    // Debounce the preview update - wait for code to be fully written
    const timeoutId = setTimeout(() => {
      // Don't update if code hasn't changed or is empty
      if (!code || code === lastPreviewCode) {
        return;
      }
      
      console.log('LivePreview: Updating preview after debounce');
      setLastPreviewCode(code);
      updatePreview();
    }, 1500); // Wait 1.5 seconds to ensure AI has finished streaming code
    
    return () => clearTimeout(timeoutId);
  }, [code, lastPreviewCode, onPreviewResult]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[code]}>
      <div className={`relative w-full h-full ${className}`}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-gray-600">Loading preview...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute inset-0 bg-red-50 p-8 overflow-auto z-10">
            <div className="bg-red-100 border border-red-300 text-red-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Transform Error
              </h3>
              <pre className="text-sm overflow-auto">{error}</pre>
            </div>
          </div>
        )}

        {/* Preview Iframe */}
        <iframe
          ref={iframeRef}
          title="Live React Preview"
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </ErrorBoundary>
  );
}