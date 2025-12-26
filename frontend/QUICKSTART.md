# Frontend Quick Start - 5 Minutes ⚡

Get the Retail Forge AI frontend running in 5 minutes.

## Prerequisites Check

✅ **Node.js 18+** - Run `node --version`  
✅ **npm 9+** - Run `npm --version`

If missing, download from: https://nodejs.org/

---

## Step 1: Install Dependencies (2 min)

```bash
cd frontend
npm install
```

**Expected output:**
```
✅ Added 150+ packages in 45s
```

---

## Step 2: Configure Environment (1 min)

```bash
# Copy environment template
cp .env.example .env

# Edit .env (use your favorite editor)
nano .env
```

**Required configuration:**

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# Image Service URL  
VITE_IMAGE_SERVICE_URL=http://localhost:8000
```

**Save and close** (Ctrl+X, Y, Enter for nano)

---

## Step 3: Start Development Server (30 sec)

```bash
npm run dev
```

**Wait for:**
```
  VITE v7.2.4  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## Step 4: Open in Browser (30 sec)

1. Open browser to: **http://localhost:5173**
2. You should see the Retail Forge AI canvas editor!

---

## ✅ You're Ready!

The frontend is now running. Here's what you can do:

### Test Basic Features

1. **Upload an Image**
   - Click "Upload" tab in left sidebar
   - Drag & drop or click to upload a product image
   - Image appears in canvas

2. **Add Text**
   - Click "Text" tab
   - Click "Add Heading" button
   - Text appears on canvas (click to edit)

3. **Move Objects**
   - Click any object on canvas
   - Drag to move
   - Use corner handles to resize

4. **Keyboard Shortcuts**
   - Press `?` to see all shortcuts
   - `Ctrl+Z` / `Cmd+Z` = Undo
   - `Del` = Delete selected object

---

## Common Issues

### Port 5173 Already in Use

```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Cannot Connect to Backend

**Check if backend is running:**
```bash
# In another terminal
cd ../backend
npm run dev
```

The backend should be running on `http://localhost:3000`

### Blank White Screen

**Check browser console (F12):**
- Look for errors in Console tab
- Common issue: CORS errors (backend not running)
- Solution: Start backend first, then frontend

---

## Next Steps

### 1. Start Backend Services

For full functionality, you need these services running:

```bash
# Terminal 1: Node.js API
cd backend
npm run dev

# Terminal 2: Python Image Service
cd backend
python image-service.py

# Terminal 3: Python BERT Service  
cd backend
python bert-service.py
```

See `backend/QUICKSTART.md` for details.

### 2. Get API Keys

For AI features, you need:

1. **OpenAI API Key** - https://platform.openai.com/api-keys
2. **Anthropic API Key** - https://console.anthropic.com/settings/keys
3. **Stability AI API Key** - https://platform.stability.ai/account/keys

Add these to `backend/.env`:

```env
OPENAI_API_KEY=sk-proj-YOUR_KEY
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
STABILITY_API_KEY=sk-YOUR_KEY
```

### 3. Explore Features

- **AI Layouts**: Upload product → Click "Layouts" tab → Generate AI layouts
- **AI Copy**: Click "Copy" tab → Enter product details → Generate copy
- **Background Generator**: Click "Gen BG" tab → Describe background → Generate
- **Validation**: Click toolbar "Validate" button → See compliance results
- **Export**: Click toolbar "Export" → Download multi-format package

---

## Development Tips

### Hot Reload

The dev server has hot reload enabled. Just save your files and the browser auto-refreshes!

### Component Structure

```
src/
├── components/
│   ├── Canvas/        # Canvas editor & controls
│   ├── AI/           # AI-powered features
│   ├── Upload/       # Image upload & library
│   ├── UI/           # Reusable UI components
│   └── Validation/   # Compliance checking
├── store/            # Zustand state management
├── hooks/            # Custom React hooks
└── utils/            # Helper functions
```

### Making Changes

1. Edit components in `src/components/`
2. Save file
3. Browser auto-reloads
4. Check browser console for errors

### Debugging

```bash
# Run with debug logging
npm run dev -- --debug

# Check for linting errors
npm run lint

# Format code
npm run format
```

---

## Production Build

```bash
# Build for production
npm run build

# Output in: dist/

# Preview production build
npm run preview
```

---

## Resources

- **Full Documentation**: See `FRONTEND_README.md`
- **Component Reference**: See `COMPONENT_REFERENCE.md`
- **Backend Setup**: See `../backend/QUICKSTART.md`
- **Troubleshooting**: See `TROUBLESHOOTING.md`

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Check for errors
npm run format           # Format code

# Cleanup
rm -rf node_modules      # Remove dependencies
npm install              # Reinstall
```

---

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Dev server running (`npm run dev`)
- [ ] Browser open to `http://localhost:5173`
- [ ] Can upload images and add text
- [ ] Backend API running (for full features)

✅ **All checked?** You're ready to build creatives!

---

Happy building! 🚀

For issues, check `TROUBLESHOOTING.md` or open a GitHub issue.