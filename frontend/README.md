# 🎨 Retail Forge AI

**AI-powered creative builder for compliant retail media campaigns**

> Built for **Tesco Retail Media InnovAItion Jam 2025**

---

## 🎯 Hackathon Challenge Solution

Retail Forge AI solves the creative barrier preventing small brands from accessing Tesco's retail media platform. Our multi-agent AI system enables brands to create professional, compliant creatives in **5 minutes** instead of weeks.

### Key Challenge Requirements Met ✓

- ✅ **Import & Manipulate Images**: Upload packshots, remove backgrounds, resize, rotate
- ✅ **Color Palette Management**: Extract and store brand colors automatically
- ✅ **Visual Builder**: Drag-and-drop canvas with real-time editing
- ✅ **AI-Powered Suggestions**: GPT-4 Vision suggests optimal layouts
- ✅ **Compliance Engine**: 30+ Tesco guidelines validated in real-time
- ✅ **Multi-Format Export**: Instagram, Facebook (all <500KB)
- ✅ **Brand Memory**: Learns preferences over time

### Stretch Goals Achieved 🚀

- ✅ **Adaptive Resizing**: AI-driven layout suggestions for multiple formats
- ✅ **Intelligent Validation**: Real-time compliance checking with BERT + rules engine
- ✅ **Collaborative Workflow**: Brand kits for team consistency
- ✅ **Campaign-Ready Output**: Exports with compliance reports

---

## ✨ Core Features

### 1. Multi-Agent AI System
- **Creative Director** (GPT-4 Vision): Layout suggestions based on product images
- **Compliance Officer** (Claude + BERT): Real-time validation against 30+ rules
- **Design Assistant** (Stable Diffusion): AI-generated backgrounds
- **Brand Manager**: Learns and applies brand preferences

### 2. Image Manipulation
- AI-powered background removal (SAM model)
- Rotate, flip, scale, crop tools
- Brand color extraction
- Image optimization (<500KB)

### 3. Compliance Engine
Validates against Tesco guidelines:
- ✓ Font size minimums (20px default)
- ✓ WCAG AA contrast ratios
- ✓ No T&Cs or competition language
- ✓ Drinkaware for alcohol products
- ✓ Social safe zones (Stories: 200px top, 250px bottom)
- ✓ Value tile positioning
- ✓ Tag text compliance

### 4. Smart Export
- Instagram Post (1080x1080)
- Facebook Feed (1200x628)
- Instagram Story (1080x1920)
- In-Store Display (1920x1080)
- Includes PDF compliance report

---

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
                     └──────────────┘
```

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Fabric.js, Tailwind CSS, Zustand

**Backend:** Node.js, Express, Python FastAPI, PostgreSQL, Redis

**AI Services:**
- OpenAI GPT-4 Vision (layout suggestions)
- Anthropic Claude Sonnet 4.5 (copy generation)
- Stability AI SDXL (background generation)
- Meta SAM (background removal)
- HuggingFace BERT (text classification)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis

### Quick Start
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/retail-forge-ai.git
cd retail-forge-ai

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys (see below)
npm run dev

# 3. Setup Python Services
pip install -r requirements.txt
python image-service.py  # Port 8000
python bert-service.py    # Port 8001

# 4. Setup Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev  # Port 5173

# 5. Setup Database
createdb retail_forge_ai
psql retail_forge_ai < docs/database/schema.sql
```

### Required API Keys

1. **OpenAI API**: https://platform.openai.com/api-keys
2. **Anthropic API**: https://console.anthropic.com/settings/keys
3. **Stability AI**: https://platform.stability.ai/account/keys

Optional (for S3 storage):
4. **AWS S3**: https://console.aws.amazon.com/iam/

---

## 🚀 Usage Guide

### 1. Upload Product Image
- Go to **Upload** tab
- Drag & drop or click to upload product image
- AI automatically removes background

### 2. Get AI Layout Suggestions
- Switch to **Layouts** tab
- Enter product category (beverages, food, beauty, etc.)
- Click "Generate Layouts"
- GPT-4 Vision suggests 3 optimal layouts

### 3. Add AI-Generated Copy
- Go to **Copy** tab
- Enter product details
- Select style (energetic, elegant, minimal)
- Get compliant headlines instantly

### 4. Validate Compliance
- **Auto-validation**: Real-time checking as you edit
- **Manual**: Click "Validate" button in toolbar
- View violations with auto-fix suggestions

### 5. Export Campaign Assets
- Click **Export** in toolbar
- Select formats (Instagram, Facebook, Stories)
- Download ZIP with:
  - Optimized images (<500KB each)
  - PDF compliance report

---

## 📊 Compliance Rules Implemented

### Content Rules (8 rules)
- No T&Cs or terms text
- No competition/contest language
- No green/sustainability claims
- No charity partnerships
- Drinkaware required for alcohol

### Design Rules (12 rules)
- Minimum font sizes (20px, 10px, 12px variants)
- WCAG AA contrast (4.5:1 text, 3:1 large text)
- Value tile positioning
- No overlapping critical elements

### Layout Rules (7 rules)
- Packshot spacing (24px minimum)
- Social safe zones (9:16 format)
- CTA positioning
- Maximum 3 packshots

### Tag Rules (5 rules)
- Approved tag text only
- Clubcard date format (DD/MM)

---

## 🎬 Demo Video

[Link to demo video - add after recording]

---

## 👥 Team ATX

**Tesco Retail Media Hackathon 2025**

- **Shauryaman Saxena** - AI/ML Lead & Backend Architecture
- **Mahatva Chandna** - AI/ML Engineer & Frontend Development

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

Built for Tesco Retail Media InnovAItion Jam 2025

Special thanks to the Tesco team for the opportunity to solve this challenge!

---

## 📧 Contact

For questions or demo requests, please reach out via the hackathon portal.