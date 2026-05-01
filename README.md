<div align="center">
  <h1>🚀 Lumina Toolkit</h1>
  <p><strong>AI-Powered Productivity Suite for Modern Professionals</strong></p>
  <p>
    <a href="#features">✨ Features</a> •
    <a href="#installation">🛠️ Installation</a> •
    <a href="#usage">📖 Usage</a> •
    <a href="#deployment">🚀 Deployment</a> •
    <a href="#contributing">💻 Contributing</a>
  </p>
</div>

# 🌟 Lumina Toolkit

A comprehensive SaaS application powered by Mistral AI, offering intelligent tools for career development, content creation, and productivity enhancement. Built with React, TypeScript, and modern web technologies.

## ✨ Features

### 🤖 AI-Powered Tools
- **AI Chat** - Intelligent conversational assistant
- **AI Caption Generator** - Create engaging social media captions
- **YouTube Title Generator** - Optimize video titles for maximum reach
- **ATS Score Checker** - Analyze and optimize resumes for ATS systems
- **Cover Letter Generator** - Create professional cover letters instantly
- **Interview Preparation** - Practice with AI-generated interview questions

### 📝 Career Tools
- **Resume Builder** - Professional resume creation with multiple templates
- **GPA Calculator** - Academic performance tracking
- **Age Calculator** - Quick age and date calculations
- **PDF Converter** - Convert documents to PDF format
- **Job Tracker** - Manage job applications and interviews

### 🎨 Design & UX
- **Mobile Responsive** - Optimized for all devices
- **Modern UI** - Clean, intuitive interface
- **Dark Mode** - Eye-friendly dark theme support
- **Real-time Updates** - Live preview and instant results

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI**: Mistral AI (Free-tier compatible)
- **Build Tools**: Vite, Terser
- **Deployment**: Vercel (Free tier optimized)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Mistral AI API key (free tier available)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lumina-toolkit.git
cd lumina-toolkit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your API key
MISTRAL_API_KEY=your_mistral_api_key_here
NODE_ENV=development
```

### 4. Get Your Mistral API Key
1. Visit [Mistral Console](https://console.mistral.ai/)
2. Sign up for a free account
3. Create a new API key
4. Add it to your `.env` file

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### AI Tools
1. **AI Chat**: Start conversations with the AI assistant
2. **Caption Generator**: Input content, select platform and tone
3. **YouTube Titles**: Enter topic and target audience
4. **ATS Checker**: Upload resume for analysis
5. **Cover Letter**: Fill job details and generate
6. **Interview Prep**: Select role and experience level

### Career Tools
1. **Resume Builder**: Choose template and fill sections
2. **GPA Calculator**: Enter grades and credits
3. **PDF Tools**: Convert and download documents
4. **Job Tracker**: Add and manage applications

## 🚀 Deployment

### Vercel (Recommended)

#### Quick Deploy with CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

#### Vercel Dashboard
1. Push code to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Configure environment variables:
   - `MISTRAL_API_KEY`
   - `NODE_ENV=production`
4. Click "Deploy"

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔧 Configuration

### Environment Variables
```bash
# Required
MISTRAL_API_KEY=your_mistral_api_key
NODE_ENV=production

# Optional
APP_URL=https://your-app.vercel.app
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

## 📱 Mobile Optimization

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interfaces
- Adaptive layouts
- Optimized performance
- Mobile-specific navigation

## 🔒 Security

- **API Key Protection**: Server-side only storage
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: 100 requests/minute per user
- **Error Handling**: Graceful error responses

## ⚡ Performance

- **Code Splitting**: Optimized bundle sizes
- **Caching**: API response caching (5 minutes)
- **Retry Logic**: Exponential backoff for failed requests
- **Minification**: Optimized production builds
- **CDN Ready**: Global distribution support

## 🧪 Testing

### Local Testing
```bash
# Test AI functionality
curl http://localhost:3000/api/ai/health

# Expected response
{
  "status": "ok",
  "service": "configured",
  "provider": "mistral"
}
```

### Production Testing
After deployment, test these endpoints:
- Main App: `https://your-app.vercel.app`
- Health Check: `https://your-app.vercel.app/api/ai/health`
- API Test: `https://your-app.vercel.app/api/ai/generate`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use semantic HTML
- Maintain mobile responsiveness
- Test on multiple browsers
- Document new features

## 📊 Project Structure

```
lumina-toolkit/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── lib/                # Utility functions
│   └── api/                # Backend API routes
├── public/                 # Static assets
├── scripts/               # Deployment scripts
├── api/                   # Vercel serverless functions
└── dist/                  # Build output
```

## 🐛 Troubleshooting

### Common Issues

#### 1. API Key Error
```bash
# Check if API key is set
echo $MISTRAL_API_KEY

# Verify API key format (should start with "...")
```

#### 2. Build Fails
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

#### 3. Port Conflict
```bash
# Kill existing processes
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

#### 4. AI Not Responding
- Check API key validity
- Verify network connection
- Check Vercel function logs
- Review rate limiting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mistral AI](https://mistral.ai/) for powerful AI capabilities
- [Vercel](https://vercel.com/) for hosting platform
- [React](https://reactjs.org/) for frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

- 📧 Email: support@lumina-toolkit.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/lumina-toolkit/issues)
- 💬 Discord: [Join our community](https://discord.gg/lumina-toolkit)

---

<div align="center">
  <p>Made with ❤️ by the Lumina Toolkit Team</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
