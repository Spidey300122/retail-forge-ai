# 🎨 Retail Forge AI

**AI-powered creative builder for compliant retail media campaigns**

---

## 🎯 Overview

Retail Forge AI breaks down the creative barrier preventing small brands from accessing Tesco's retail media platform. Our multi-agent AI system enables brands to create professional, compliant creatives in 5 minutes instead of weeks.

## ✨ Key Features

- **Multi-Agent AI System**: Specialized agents for creativity, compliance, design, and brand management
- **Real-Time Compliance**: Instant validation against 30+ Tesco retail media rules
- **Intelligent Guidance**: Suggests compliant alternatives instead of blocking users
- **Multi-Format Export**: Instagram, Facebook, In-store displays (all <500KB)
- **Brand Memory**: Learns preferences over time for personalized recommendations

## 🏗️ Architecture
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │ ───► │   Backend    │ ───► │  AI Agents  │
│   (React)   │      │ (Node/Flask) │      │ (GPT-4/etc) │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │    Redis     │
                     │    AWS S3    │
                     └──────────────┘
```

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Fabric.js (canvas manipulation)
- Tailwind CSS
- Zustand (state management)

**Backend:**
- Node.js + Express
- Python + FastAPI
- PostgreSQL
- Redis

**AI Services:**
- OpenAI GPT-4 Vision (layout suggestions)
- Anthropic Claude (copy generation)
- Stability AI (background generation)
- Meta SAM (background removal)
- HuggingFace BERT (text classification)

## 📦 Installation
## Database Setup

### 1. Install PostgreSQL
See [docs/database/README.md](docs/database/README.md)

### 2. Create Database
```bash
createdb retail_forge_ai
psql retail_forge_ai < docs/database/schema.sql
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update DATABASE_URL:
```
DATABASE_URL=postgresql://retail_forge:dev_password_123@localhost:5432/retail_forge_ai
```

## Redis Setup

### Install Redis
```bash
# Mac
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

## Project Structure
```
retail-forge-ai/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express API
│   ├── api/          # Routes, controllers, services
│   ├── ai-engine/    # AI agents and orchestration
│   ├── config/       # Database, Redis, AWS config
│   ├── db/           # Database queries
│   └── utils/        # Helper functions
├── docs/             # Documentation
└── tests/            # Test files
```

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis

### Setup
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/retail-forge-ai.git
cd retail-forge-ai

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development servers
npm run dev
```

## 🚀 Quick Start

1. Upload product image and logo
2. AI suggests 3 optimal layouts
3. Customize with drag-and-drop
4. Real-time compliance validation
5. Export to all formats

## 📖 Documentation

- [Architecture Overview](./docs/architecture/README.md)
- [API Documentation](./docs/api/README.md)
- [User Guide](./docs/user-guide/README.md)
- [Compliance Rules](./docs/compliance-rules.md)

## 👥 Team

**Team ATX - Tesco Retail Media Hackathon 2025**

- **Shauryaman Saxena** - AI/ML Lead
- **Mahatva Chandna** - AI/ML Engineer

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built for Tesco Retail Media InnovAItion Jam 2025