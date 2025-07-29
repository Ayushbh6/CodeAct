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

    // Create React component file
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
  <script src="https://unpkg.com/recharts@2.8.0/esm/index.js" type="module"></script>
  <script src="https://unpkg.com/framer-motion@11.2.10/dist/framer-motion.js"></script>
  <script src="https://unpkg.com/lucide-react@0.394.0/dist/umd/lucide-react.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
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
    ${reactCode}
    
    // Render the component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(${componentName}));
  </script>
</body>
</html>`;

    await fs.writeFile(htmlPath, htmlWrapper);

    // Launch headless browser to render and screenshot
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the HTML file
    await page.goto(`file://${htmlPath}`, { 
      waitUntil: 'networkidle0',
      timeout: timeout 
    });

    // Wait a bit for animations to settle
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    await browser.close();

    // Get screenshot as base64 for immediate response
    const screenshotBuffer = await fs.readFile(screenshotPath);
    const screenshotBase64 = screenshotBuffer.toString('base64');

    // Cleanup temporary files (optional - keep for debugging)
    // await fs.remove(componentPath);
    // await fs.remove(htmlPath);

    // Success response
    res.json({
      success: true,
      executionId,
      componentName,
      componentType,
      screenshot: {
        url: `/screenshots/${executionId}.png`,
        base64: `data:image/png;base64,${screenshotBase64}`,
        path: screenshotPath
      },
      files: {
        component: componentPath,
        html: htmlPath
      },
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
