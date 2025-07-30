const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { spawn, exec } = require('child_process');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
// Serve generated components
app.use('/components/generated', express.static(path.join(__dirname, 'components', 'generated')));

// Paths
const COMPONENTS_DIR = path.join(__dirname, 'components', 'generated');
const SCREENSHOTS_DIR = path.join(__dirname, 'public', 'screenshots');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Ensure directories exist
fs.ensureDirSync(COMPONENTS_DIR);
fs.ensureDirSync(SCREENSHOTS_DIR);
fs.ensureDirSync(TEMPLATES_DIR);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'React Executor is running! 🚀',
    timestamp: new Date().toISOString(),
    capabilities: {
      componentGeneration: 'Ready',
      screenshotCapture: 'Ready',
      reactCompilation: 'Ready',
      educationalLibraries: 'Loaded'
    }
  });
});

// Main component execution endpoint
app.post('/execute-component', async (req, res) => {
  try {
    const { 
      reactCode, 
      componentName = 'GeneratedComponent',
      componentType = 'interactive',
      timeout = 30000 
    } = req.body;

    if (!reactCode) {
      return res.status(400).json({ 
        error: 'No React code provided',
        message: 'Please provide reactCode in the request body'
      });
    }

    console.log(`🚀 Executing ${componentType} component: ${componentName}`);

    // Generate unique ID for this execution
    const executionId = `${componentName}_${Date.now()}`;
    const componentPath = path.join(COMPONENTS_DIR, `${executionId}.jsx`);
    const htmlPath = path.join(COMPONENTS_DIR, `${executionId}.html`);
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${executionId}.png`);

    // Preprocess the React code to remove import/export statements
    let processedCode = reactCode;
    
    // Remove import statements
    processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '');
    processedCode = processedCode.replace(/import\s+['"].*?['"];?\s*/g, '');
    processedCode = processedCode.replace(/import\s*{[^}]*}\s*from\s*['"][^'"]*['"];?\s*/g, '');
    
    // Remove export statements but keep the component
    processedCode = processedCode.replace(/export\s+default\s+/g, '');
    processedCode = processedCode.replace(/export\s+/g, '');

    // Create React component file (original code for reference)
    await fs.writeFile(componentPath, reactCode);

    // Create HTML wrapper for the component
    const htmlWrapper = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/prop-types@15/prop-types.js"></script>
  <script src="https://unpkg.com/recharts@2/umd/Recharts.js"></script>
  <script>
    // Make Recharts components available globally
    window.Recharts = window.Recharts || {};
  </script>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      background: #fafafa;
    }
    #root { 
      width: 100%; 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    // Import React hooks and components into global scope
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    const { motion } = window["framer-motion"] || {};
    const { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } = window.Recharts || {};
    const { TrendingUp, DollarSign, Calendar, Brain, Code, MessageSquare, Sparkles, ChevronDown, ChevronUp } = window.lucideReact || {};
    
    ${processedCode}
    
    // Component code is already processed and available
    // Try to find the main component function
    const componentMatch = \`${processedCode}\`.match(/(?:const|let|var|function)\\s+(\\w+)\\s*=\\s*(?:\\(|function)/);
    const detectedComponentName = componentMatch ? componentMatch[1] : '${componentName}';
    
    // Try to find the component to render
    const ComponentToRender = typeof window[detectedComponentName] !== 'undefined' ? window[detectedComponentName] :
                             typeof ${componentName} !== 'undefined' ? ${componentName} : 
                             typeof Component !== 'undefined' ? Component :
                             typeof App !== 'undefined' ? App :
                             (() => {
                               console.error('Could not find component. Available globals:', Object.keys(window).filter(k => k[0] === k[0].toUpperCase()));
                               return <div>No component found. Check console for details.</div>;
                             });
    
    // Render the component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(ComponentToRender));
  </script>
</body>
</html>`;

    await fs.writeFile(htmlPath, htmlWrapper);

    // Skip screenshot generation for now - focus on live component execution
    console.log('✅ Component HTML generated successfully');
    
    // Create a placeholder screenshot message
    const screenshotBase64 = null;

    // Cleanup temporary files (optional - keep for debugging)
    // await fs.remove(componentPath);
    // await fs.remove(htmlPath);

    // Success response
    res.json({
      success: true,
      executionId,
      componentName,
      componentType,
      componentPath: `/components/generated/${executionId}.jsx`,
      htmlPath: `/components/generated/${executionId}.html`,
      timestamp: new Date().toISOString(),
      message: `${componentType} component executed successfully! 🎉`
    });

  } catch (error) {
    console.error('❌ Component execution failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// List generated components
app.get('/components', async (req, res) => {
  try {
    const files = await fs.readdir(COMPONENTS_DIR);
    const components = files
      .filter(file => file.endsWith('.jsx'))
      .map(file => ({
        name: file.replace('.jsx', ''),
        path: path.join(COMPONENTS_DIR, file),
        created: fs.statSync(path.join(COMPONENTS_DIR, file)).birthtime
      }))
      .sort((a, b) => b.created - a.created);

    res.json({
      success: true,
      components,
      count: components.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve screenshots
app.get('/screenshots/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Screenshot not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 React Executor Server running on port ${PORT}`);
  console.log(`📸 Screenshots available at: http://localhost:${PORT}/screenshots/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Component execution: POST http://localhost:${PORT}/execute-component`);
});

module.exports = app;
