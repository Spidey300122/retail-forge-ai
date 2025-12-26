# Quick Start Guide - 5 Minutes

Get Retail Forge AI running locally in 5 minutes.

## Prerequisites Check

Before starting, verify you have:

✅ **Node.js 18+** - Run `node --version`  
✅ **Python 3.10+** - Run `python --version` or `python3 --version`  
✅ **PostgreSQL 14+** - Run `psql --version`  
✅ **Redis** - Run `redis-cli --version`  

If any are missing, install them first:
- Node.js: https://nodejs.org/
- Python: https://www.python.org/downloads/
- PostgreSQL: https://www.postgresql.org/download/
- Redis: https://redis.io/download

---

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/retail-forge-ai.git
cd retail-forge-ai/backend

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Or if using pip3:
pip3 install -r requirements.txt
```

**Expected output:**
```
✅ Added 150+ packages (Node.js)
✅ Successfully installed 40+ packages (Python)
```

---

## Step 2: Get API Keys (3 min)

You need three API keys. Sign up for free tiers:

### 1. OpenAI API Key
- Visit: https://platform.openai.com/api-keys
- Sign up or log in
- Click "Create new secret key"
- Copy the key starting with `sk-proj-`
- Free credit: $5 (for new accounts)

### 2. Anthropic API Key  
- Visit: https://console.anthropic.com/settings/keys
- Sign up or log in
- Click "Create Key"
- Copy the key starting with `sk-ant-`
- Free credit: $5 (for new accounts)

### 3. Stability AI API Key
- Visit: https://platform.stability.ai/account/keys
- Sign up or log in  
- Click "Create API Key"
- Copy the key starting with `sk-`
- Free credit: $10 (for new accounts)

---

## Step 3: Configure Environment (1 min)

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your text editor
nano .env
# OR
code .env
# OR
vim .env
```

**Edit the following lines in .env:**

```env
# Required API Keys (paste your keys here)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
STABILITY_API_KEY=sk-YOUR_KEY_HERE

# Database (update if needed)
DATABASE_URL=postgresql://localhost:5432/retail_forge_ai

# Redis (update if needed)
REDIS_URL=redis://localhost:6379

# Keep these as default
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Save and close** the file (Ctrl+X, then Y, then Enter for nano).

---

## Step 4: Database Setup (1 min)

```bash
# Start PostgreSQL if not running
# Mac (Homebrew):
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Windows: PostgreSQL should auto-start, or use Services

# Create the database
createdb retail_forge_ai

# Run the schema (from backend directory)
psql retail_forge_ai < ../complete-schema.sql

# Verify it worked
psql retail_forge_ai -c "SELECT COUNT(*) FROM users;"
```

**Expected output:**
```
 count 
-------
     1
(1 row)
```

✅ Database is ready!

---

## Step 5: Start Redis (30 sec)

```bash
# Start Redis server
# Mac:
brew services start redis

# Linux:
sudo systemctl start redis

# Or manually:
redis-server

# Verify it's running
redis-cli ping
```

**Expected output:**
```
PONG
```

✅ Redis is ready!

---

## Step 6: Start All Services (1 min)

Open **4 terminal windows/tabs** in the `backend` directory:

### Terminal 1: Node.js API
```bash
npm run dev
```

**Wait for:**
```
✅ Connected to PostgreSQL database
✅ Connected to Redis
Server running on http://localhost:3000
```

### Terminal 2: Python Image Service  
```bash
python image-service.py
```

**Wait for:**
```
🚀 Retail Forge AI - Image Processing Service
📍 Port: 8000
✅ Image service ready
```

### Terminal 3: Python BERT Service
```bash
python bert-service.py
```

**Wait for:**
```
🔧 Loading BERT classifier...
✅ BERT service ready
```

### Terminal 4: Test Everything
```bash
# Test Node.js API
curl http://localhost:3000/health

# Test Image Service
curl http://localhost:8000/health

# Test BERT Service
curl http://localhost:8001/health
```

**All should return:** `{"status":"healthy",...}`

---

## ✅ You're Ready!

All services are now running:

| Service | URL | Status |
|---------|-----|--------|
| Node.js API | http://localhost:3000 | ✅ Running |
| Image Service | http://localhost:8000 | ✅ Running |
| BERT Service | http://localhost:8001 | ✅ Running |
| PostgreSQL | localhost:5432 | ✅ Running |
| Redis | localhost:6379 | ✅ Running |

---

## Next Steps

### 1. Start the Frontend

```bash
# In a new terminal, go to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit: **http://localhost:5173**

### 2. Test the API

Try generating copy:

```bash
curl -X POST http://localhost:3000/api/ai/generate-copy \
  -H "Content-Type: application/json" \
  -d '{
    "productInfo": {
      "name": "Fresh Orange Juice",
      "category": "beverages"
    },
    "style": "energetic"
  }'
```

### 3. Explore the Canvas

- Upload a product image
- Try AI layout suggestions
- Generate copy variations
- Validate compliance
- Export your creative!

---

## Quick Test Suite

Run automated tests to verify everything:

```bash
# Test database connection
node test-step-by-step.js

# Test AI services (uses API credits)
node test-ai-services.js

# Test image processing
node test-image-service.js

# Full integration tests
node test-integration.js
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 8001
lsof -ti:8001 | xargs kill -9
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
# Mac:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Verify connection string
echo $DATABASE_URL
```

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# If not running, start it:
# Mac:
brew services start redis

# Linux:
sudo systemctl start redis
```

### Python Module Not Found

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Or use pip3
pip3 install -r requirements.txt --force-reinstall
```

### API Key Invalid

1. Double-check you copied the **entire key**
2. Make sure there are **no spaces** before or after the key in .env
3. Verify the key format:
   - OpenAI: starts with `sk-proj-`
   - Anthropic: starts with `sk-ant-`
   - Stability: starts with `sk-`

### BERT Model Download Slow

The first time you run `bert-service.py`, it downloads a ~440MB model. This is normal and only happens once.

**Progress:**
```
Downloading: 100%|████████████| 440MB/440MB [02:30<00:00, 2.92MB/s]
```

Just wait for it to complete (~2-5 minutes depending on internet speed).

---

## Common Commands

### Stop All Services
```bash
# Stop Node.js: Ctrl+C in Terminal 1
# Stop Image Service: Ctrl+C in Terminal 2
# Stop BERT Service: Ctrl+C in Terminal 3

# Stop PostgreSQL
brew services stop postgresql@14  # Mac
sudo systemctl stop postgresql    # Linux

# Stop Redis
brew services stop redis           # Mac
sudo systemctl stop redis          # Linux
```

### View Logs
```bash
# Node.js logs: in Terminal 1
# Python logs: in Terminals 2 & 3

# PostgreSQL logs
tail -f /usr/local/var/log/postgresql@14.log  # Mac

# Redis logs
tail -f /usr/local/var/log/redis.log          # Mac
```

### Clear Cache
```bash
# Clear Redis cache
redis-cli FLUSHALL

# Clear Node.js cache
rm -rf node_modules package-lock.json
npm install
```

---

## Development Workflow

**Typical daily startup:**

```bash
# 1. Start PostgreSQL + Redis (if not auto-starting)
brew services start postgresql@14
brew services start redis

# 2. Start backend services (3 terminals)
cd backend
npm run dev                    # Terminal 1
python image-service.py        # Terminal 2
python bert-service.py         # Terminal 3

# 3. Start frontend (1 terminal)
cd frontend
npm run dev                    # Terminal 4
```

**Before committing code:**

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
node test-integration.js
```

---

## What's Running Where?

### Node.js API (Port 3000)
- REST API endpoints
- Database queries
- Redis caching
- AI orchestration

### Image Service (Port 8000)
- Background removal (rembg)
- Color extraction
- Image optimization
- Background generation (Stable Diffusion)

### BERT Service (Port 8001)
- AI text classification
- Compliance detection
- Content validation

### PostgreSQL (Port 5432)
- User data
- Creative projects
- Validation history
- Color palettes

### Redis (Port 6379)
- API response caching
- Rate limiting
- Session storage

---

## Resource Usage

**Typical memory usage:**
- Node.js API: ~150MB
- Image Service: ~500MB (with models loaded)
- BERT Service: ~800MB (with model loaded)
- PostgreSQL: ~100MB
- Redis: ~50MB

**Total:** ~1.6GB RAM

**Disk space:**
- Dependencies: ~2GB
- AI models: ~1GB (downloaded on first run)
- Database: ~100MB (grows with usage)

---

## Getting Help

1. **Check logs** in the terminal windows for error messages
2. **Review documentation** in `/backend/docs/`
3. **Run health checks**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:8000/health
   curl http://localhost:8001/health
   ```
4. **Search existing issues** on GitHub
5. **Open a new issue** with:
   - Error message
   - Steps to reproduce
   - Environment info (`node --version`, `python --version`, OS)

---

## Success Checklist

- [ ] All 5 services running (API, Image, BERT, PostgreSQL, Redis)
- [ ] All health checks return "healthy"
- [ ] Can generate copy via API
- [ ] Frontend loads at http://localhost:5173
- [ ] Can upload images in canvas
- [ ] Can validate compliance

✅ **All checked?** You're ready to build amazing creatives!

---

## Next: Explore the Features

Now that everything is running, try:

1. **Canvas Builder** - Drag, drop, and design
2. **AI Layouts** - Get smart layout suggestions
3. **Copy Generator** - Create compliant ad copy
4. **Compliance Validation** - Real-time rule checking
5. **Background Generator** - AI-powered backgrounds
6. **Export** - Download in multiple formats

Happy building! 🚀