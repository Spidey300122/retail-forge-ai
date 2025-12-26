# Retail Forge AI - Backend

AI-powered creative builder for compliant retail media campaigns.

> **Repository Scope:** This repository contains the backend services for Retail Forge AI.  
> Frontend and infrastructure are maintained separately.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis
- API Keys: OpenAI, Anthropic, Stability AI

### Installation

1. **Install Node.js dependencies:**
```bash
cd backend
npm install
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys and database credentials
```

4. **Set up database:**
```bash
createdb retail_forge_ai
psql retail_forge_ai < ../complete-schema.sql
```

5. **Start services:**

Terminal 1 - Node.js API:
```bash
npm run dev
```

Terminal 2 - Python Image Service:
```bash
python image-service.py
```

Terminal 3 - Python BERT Service:
```bash
python bert-service.py
```

Terminal 4 - Redis:
```bash
redis-server
```

## 📡 Services

| Service | Port | Purpose |
|---------|------|---------|
| Node.js API | 3000 | Main REST API |
| Image Service | 8000 | Background removal, color extraction, optimization |
| BERT Service | 8001 | AI text classification for compliance |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching layer |

## 🏗️ Architecture

```
backend/
├── api/                    # REST API endpoints
│   ├── controllers/        # Request handlers
│   ├── routes/            # Route definitions
│   └── services/          # Business logic
├── ai-engine/             # AI orchestration
│   ├── agents/            # Specialized AI agents
│   │   ├── brandManager.js
│   │   ├── complianceOfficer.js
│   │   └── creativeDirector.js
│   ├── compliance/        # Compliance rules engine
│   │   ├── rules/         # Individual rule definitions
│   │   └── ruleEngine.js
│   └── orchestrator.js    # Multi-agent coordinator
├── config/                # Configuration files
├── db/                    # Database queries
├── image_processing/      # Python image processing
├── utils/                 # Utility functions
└── server.js             # Express server entry point
```

## 🤖 AI Agents

### 1. Creative Director
- **Model:** GPT-4o Vision
- **Purpose:** Layout suggestions using image analysis
- **Endpoint:** `POST /api/ai/suggest-layouts`

### 2. Compliance Officer
- **Model:** Claude Sonnet 4.5
- **Purpose:** Copy generation and validation
- **Endpoints:** 
  - `POST /api/ai/generate-copy`
  - `POST /api/ai/validate-copy`

### 3. Orchestrator
- **Purpose:** Coordinates all AI agents
- **Endpoint:** `POST /api/orchestrator/process`

## 📋 API Endpoints

**Base URL:** `http://localhost:3000`

### Public APIs (Client-Facing)

These endpoints are exposed to the frontend and external clients:

- `POST /api/upload` - Upload images
- `POST /api/ai/suggest-layouts` - Get layout suggestions
- `POST /api/ai/generate-copy` - Generate copy variations
- `POST /api/validate/creative` - Validate compliance
- `POST /api/validate/rules` - Get all compliance rules
- `POST /api/export` - Export creative package
- `POST /api/orchestrator/process` - Multi-agent processing
- `GET /api/color/palettes` - Get user color palettes
- `POST /api/color/palette` - Save color palette

### Internal Services (Backend-Only)

These services are used internally by the Node.js API:

- **Image Processing Service** (Port 8000)
  - `POST /process/remove-background` - Background removal
  - `POST /process/extract-colors` - Color extraction
  - `POST /process/optimize` - Image optimization
  - `POST /process/generate-background` - AI background generation
  - `GET /process/download/{filename}` - Download processed files

- **BERT Service** (Port 8001)
  - `POST /classify` - Text classification for compliance
  - `POST /classify-batch` - Batch text classification
  - `GET /health` - Service health check

### Core Endpoint Examples

#### Upload Image
```http
POST /api/upload
Content-Type: multipart/form-data

Body: { image: File }

Response: {
  success: true,
  data: {
    imageId: "img_123",
    url: "https://...",
    width: 1080,
    height: 1080
  }
}
```

#### Generate Copy
```http
POST /api/ai/generate-copy
Content-Type: application/json

Body: {
  productInfo: {
    name: "Fresh Orange Juice",
    category: "beverages",
    features: ["100% natural"]
  },
  style: "energetic"
}

Response: {
  success: true,
  data: {
    suggestions: [
      {
        headline: "Pure Energy in Every Sip",
        subhead: "100% natural orange juice",
        rationale: "...",
        complianceNotes: "..."
      }
    ]
  }
}
```

#### Validate Compliance
```http
POST /api/validate/creative
Content-Type: application/json

Body: {
  creativeData: {
    format: "instagram_post",
    elements: [...],
    backgroundColor: "#ffffff"
  }
}

Response: {
  success: true,
  data: {
    isCompliant: true,
    score: 95,
    violations: [],
    warnings: []
  }
}
```

#### Export Creative
```http
POST /api/export
Content-Type: multipart/form-data

Body: {
  image: File,
  formats: ["instagram_post", "facebook_feed"],
  complianceData: {...}
}

Response: ZIP file with:
  - creative.png (high quality)
  - creative.jpg (compressed)
  - Instagram_Post.jpg
  - Facebook_Feed.jpg
  - compliance_report.pdf
  - metadata.json
```

### Image Processing

#### Remove Background
```http
POST /api/image/remove-background
Content-Type: multipart/form-data

Body: { file: File, method: "fast" }
```

#### Extract Colors
```http
POST /api/image/extract-colors
Content-Type: multipart/form-data

Body: { file: File, count: 5 }
```

#### Generate Background
```http
POST /api/image/generate-background
Content-Type: application/json

Body: {
  prompt: "modern gradient background",
  style: "professional",
  width: 1080,
  height: 1080
}
```

## 🔒 Compliance Rules

The system validates against 30+ Tesco retail media rules:

### Content Rules (8)
- No T&Cs language
- No competition/contest mentions
- No sustainability claims (unless certified)
- No price callouts in copy
- No money-back guarantees
- No unsubstantiated claims

### Design Rules (10)
- Minimum font size: 20px (10px for checkout)
- WCAG AA contrast standards
- Value tile positioning
- CTA size requirements
- Tag placement rules
- LEP (Low Everyday Price) design standards

### Layout Rules (5)
- Packshot spacing (24px minimum)
- Social media safe zones
- CTA positioning
- Element hierarchy
- Maximum 3 packshots

### Media Rules (2)
- Photography of people (requires confirmation)
- Image quality standards

## 🧪 Testing

Run all tests:
```bash
# Backend API tests
node test-integration.js

# AI services tests
node test-ai-services.js

# Validation engine tests
node test-day14-validation-ui.js

# Export pipeline tests
node test-day15-export.js
```

## 🔧 Configuration

### Environment Variables

Required:
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://user:pass@localhost:5432/retail_forge_ai
REDIS_URL=redis://localhost:6379

OPENAI_API_KEY=sk-proj-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
STABILITY_API_KEY=sk-xxxxx
```

Optional (for production):
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=retail-forge-assets
AWS_REGION=us-east-1
```

## 📊 Database Schema

Key tables:
- `users` - User accounts
- `brand_profiles` - Brand identity and preferences
- `images` - Uploaded/generated images
- `creatives` - Canvas projects
- `compliance_validations` - Validation history
- `exports` - Exported files
- `color_palettes` - Extracted color schemes
- `ai_logs` - AI interaction logs

See `complete-schema.sql` for full schema.

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed
```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string in .env
echo $DATABASE_URL
```

### Redis Connection Failed
```bash
# Start Redis
redis-server

# Test connection
redis-cli ping
```

### Python Services Not Starting
```bash
# Verify dependencies
pip list | grep -E "rembg|transformers|stability"

# Check port availability
lsof -ti:8000
lsof -ti:8001
```

## 📈 Performance

- Layout suggestions: < 3s
- Copy generation: < 2s
- Compliance validation: < 500ms
- Background removal: < 5s
- Background generation: 10-15s
- Export (single format): < 3s

## 🔐 Security

- CORS enabled for specific origins only
- Rate limiting: 100 requests/15 minutes per IP
- File size limits: 10MB max
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

## 📝 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

Built for Tesco Retail Media InnovAItion Jam 2025

**Team ATX:**
- Shauryaman Saxena - AI/ML Lead
- Mahatva Chandna - AI/ML Engineer