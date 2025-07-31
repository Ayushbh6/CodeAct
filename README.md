# CodeAct Agent - Interactive Learning Assistant

## 🎯 Overview
CodeAct is an AI-powered learning assistant that helps users understand complex concepts through interactive React visualizations. It features real-time code preview, professional code editing with Monaco Editor, and support for educational libraries like Recharts, Framer Motion, and D3.

## ✨ Features

- **Live React Preview**: Instant rendering of React components as AI generates code
- **Monaco Editor Integration**: Professional code editing experience with syntax highlighting
- **Multiple View Modes**: 
  - Code view (read-only with syntax highlighting)
  - Preview mode (live component rendering)
  - Edit mode (modify code with instant preview updates)
- **Educational Libraries**: Pre-loaded support for visualization libraries
- **Streaming AI Responses**: See AI's thinking process and code generation in real-time
- **Error Handling**: Graceful error boundaries with helpful error messages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd codeact
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Add your API keys to .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Deployment

### Railway Deployment
This app is configured for easy Railway deployment:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `OPENROUTER_API_KEY`
   - `TAVILY_API_KEY` 
   - `GOOGLE_API_KEY`
   - `GEMINI_API_KEY`
   - `GITHUB_API_KEY`
3. Railway will automatically build and deploy using `railway.json` configuration

## 🏗️ Architecture

### Frontend Components
- **`page.tsx`**: Main chat interface with AI conversation management
- **`CodePanel.tsx`**: Code display and editing panel with Monaco Editor
- **`LivePreview.tsx`**: Real-time React component rendering with Babel transpilation

### Key Technologies
- **Next.js 15**: React framework with App Router
- **Monaco Editor**: VS Code's editor for web
- **Babel Standalone**: Client-side JavaScript transpilation
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling

## 📚 Supported Libraries

The following libraries are available in the live preview environment:
- React 18
- Recharts (charts and graphs)
- Framer Motion (animations)
- D3.js (data visualizations)
- Victory (composable charts)
- Lucide React (icons)
- Tailwind CSS (styling)

## 🎨 Usage Examples

Ask the AI to create:
- "Create an interactive compound interest calculator"
- "Show me how binary search works with animations"
- "Build a visualization of sorting algorithms"
- "Create an interactive physics simulation"

## 🛠️ Development

### Project Structure
```
codeact/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── components/   # React components
│   │   └── page.tsx      # Main page
│   └── types/           # TypeScript definitions
├── public/              # Static assets
└── package.json         # Dependencies
```

### Adding New Libraries
To add support for new libraries in the preview:
1. Add the CDN link in `LivePreview.tsx`
2. Make the library available in the global scope
3. Update the component detection logic if needed

## 🐛 Troubleshooting

### Common Issues

1. **Monaco Editor not loading**: Clear browser cache and reload
2. **Preview not updating**: Check browser console for Babel errors
3. **Libraries not available**: Ensure CDN links are accessible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for interactive learning