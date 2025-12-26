# Frontend Troubleshooting Guide 🔧

Common issues and solutions for Retail Forge AI frontend.

---

## Table of Contents

1. [Development Server Issues](#development-server-issues)
2. [Build & Deployment Issues](#build--deployment-issues)
3. [Canvas & Fabric.js Issues](#canvas--fabricjs-issues)
4. [Image Upload Issues](#image-upload-issues)
5. [API & Backend Connection](#api--backend-connection)
6. [AI Features Not Working](#ai-features-not-working)
7. [Performance Issues](#performance-issues)
8. [Browser Compatibility](#browser-compatibility)

---

## Development Server Issues

### Port Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solutions:**

```bash
# Option 1: Kill the process
lsof -ti:5173 | xargs kill -9

# Option 2: Use different port
npm run dev -- --port 3001

# Option 3: Find and kill manually
lsof -i :5173
kill -9 <PID>
```

**Windows:**
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### Module Not Found

**Error:**
```
Error: Cannot find module 'react' or 'fabric'
```

**Solutions:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If still failing, check Node version
node --version  # Should be 18+

# Update npm
npm install -g npm@latest
```

---

### Vite Not Starting

**Error:**
```
Failed to load config from vite.config.js
```

**Solutions:**

```bash
# Check vite.config.js syntax
npm run lint

# Reinstall Vite
npm install vite@latest --save-dev

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

### Hot Reload Not Working

**Symptoms:** Changes don't reflect in browser

**Solutions:**

1. **Check file watchers**
   ```bash
   # Linux: Increase watchers
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart dev server**
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

3. **Clear browser cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## Build & Deployment Issues

### Build Fails

**Error:**
```
RollupError: Could not resolve './components/...'
```

**Solutions:**

1. **Check import paths**
   ```javascript
   // ❌ Wrong
   import Component from 'components/Component'
   
   // ✅ Correct
   import Component from './components/Component'
   ```

2. **Check file extensions**
   ```bash
   # Files should be .jsx not .js for JSX
   mv Component.js Component.jsx
   ```

3. **Clear build cache**
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

---

### Environment Variables Not Working

**Error:**
```
undefined when accessing import.meta.env.VITE_API_BASE_URL
```

**Solutions:**

1. **Check variable name prefix**
   ```env
   # ❌ Wrong
   API_URL=http://localhost:3000
   
   # ✅ Correct (must start with VITE_)
   VITE_API_URL=http://localhost:3000
   ```

2. **Restart dev server after .env changes**
   ```bash
   # Environment variables are loaded on startup
   # Ctrl+C, then npm run dev
   ```

3. **Check .env file location**
   ```bash
   # Should be in frontend/ root
   frontend/
   ├── .env          ← Here
   ├── src/
   └── vite.config.js
   ```

---

### Build Size Too Large

**Warning:**
```
dist/assets/index.js  1.2 MB
```

**Solutions:**

1. **Enable code splitting**
   ```javascript
   // vite.config.js
   export default {
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             fabric: ['fabric']
           }
         }
       }
     }
   }
   ```

2. **Lazy load heavy components**
   ```javascript
   import { lazy, Suspense } from 'react';
   
   const BackgroundGenerator = lazy(() => 
     import('./components/AI/BackgroundGenerator')
   );
   ```

3. **Analyze bundle**
   ```bash
   npm run build
   npx vite-bundle-visualizer
   ```

---

## Canvas & Fabric.js Issues

### Canvas Not Initializing

**Symptoms:** Blank white screen, no canvas visible

**Solutions:**

1. **Check console for errors**
   - Press F12 → Console tab
   - Look for Fabric.js errors

2. **Verify Fabric.js import**
   ```javascript
   // Correct import
   import { fabric } from 'fabric';
   
   // Check version
   console.log(fabric.version); // Should be 5.3.0
   ```

3. **Check canvas dimensions**
   ```javascript
   // Must have valid width/height
   const canvas = new fabric.Canvas('canvas', {
     width: 1080,
     height: 1080
   });
   ```

4. **Ensure canvas element exists**
   ```jsx
   // Canvas ref must be set before init
   const canvasRef = useRef(null);
   
   useEffect(() => {
     if (canvasRef.current) {
       const fabricCanvas = new fabric.Canvas(canvasRef.current);
     }
   }, []);
   
   return <canvas ref={canvasRef} />;
   ```

---

### Objects Not Selectable

**Symptoms:** Can't click or select objects on canvas

**Solutions:**

1. **Check selectable property**
   ```javascript
   obj.set({ selectable: true });
   ```

2. **Check z-index/layering**
   ```javascript
   canvas.bringToFront(obj);
   ```

3. **Verify object is on canvas**
   ```javascript
   console.log(canvas.getObjects()); // Should list your objects
   ```

---

### Canvas Performance Issues

**Symptoms:** Laggy, slow rendering, high CPU usage

**Solutions:**

1. **Enable object caching**
   ```javascript
   fabric.Object.prototype.objectCaching = true;
   ```

2. **Limit undo history**
   ```javascript
   // canvasStore.js
   const MAX_HISTORY = 50; // Reduced from default
   ```

3. **Optimize image size**
   ```javascript
   // Use imageOptimizer utility
   import { optimizeImageForCanvas } from './utils/imageOptimizer';
   
   const optimized = await optimizeImageForCanvas(imageUrl, 2000);
   ```

4. **Disable render on every change**
   ```javascript
   canvas.renderOnAddRemove = false;
   // ... make multiple changes
   canvas.renderAll(); // Render once
   canvas.renderOnAddRemove = true;
   ```

---

### Undo/Redo Not Working

**Symptoms:** Ctrl+Z does nothing or behaves incorrectly

**Solutions:**

1. **Check saveState calls**
   ```javascript
   // Must call saveState after modifications
   canvas.on('object:modified', () => {
     saveState();
   });
   ```

2. **Check history array**
   ```javascript
   // In useCanvasStore
   console.log(history.past.length); // Should increase
   ```

3. **Verify keyboard hook**
   ```javascript
   // useKeyboard.js should be imported in CanvasEditor
   import useKeyboard from '../hooks/useKeyboard';
   
   function CanvasEditor() {
     useKeyboard(); // Must be called
     // ...
   }
   ```

---

## Image Upload Issues

### Images Not Uploading

**Error:**
```
Failed to upload image
```

**Solutions:**

1. **Check file size**
   ```javascript
   // Max 10MB (configurable)
   if (file.size > 10 * 1024 * 1024) {
     alert('File too large');
   }
   ```

2. **Check file type**
   ```javascript
   // Only images allowed
   if (!file.type.startsWith('image/')) {
     alert('Not an image file');
   }
   ```

3. **Check backend is running**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"healthy"}
   ```

4. **Check CORS**
   ```javascript
   // Backend must allow frontend origin
   // backend/server.js
   app.use(cors({
     origin: 'http://localhost:5173'
   }));
   ```

---

### Images Not Displaying

**Symptoms:** Upload succeeds but image doesn't show

**Solutions:**

1. **Check image URL**
   ```javascript
   console.log(uploadData.url); // Should be valid URL or base64
   ```

2. **Check CORS on image**
   ```javascript
   // Use crossOrigin for external images
   fabric.Image.fromURL(url, (img) => {
     canvas.add(img);
   }, { crossOrigin: 'anonymous' });
   ```

3. **Check localStorage**
   ```javascript
   // Images stored in localStorage
   const images = localStorage.getItem('uploaded_images');
   console.log(JSON.parse(images));
   ```

---

### Background Removal Fails

**Error:**
```
Background removal failed
```

**Solutions:**

1. **Check image service is running**
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

2. **Check image size**
   ```bash
   # Images > 10MB may fail
   # Resize before upload
   ```

3. **Check Python dependencies**
   ```bash
   cd backend
   pip list | grep rembg  # Should show rembg installed
   ```

4. **Restart image service**
   ```bash
   # Ctrl+C to stop
   python image-service.py
   ```

---

## API & Backend Connection

### Cannot Connect to Backend

**Error:**
```
Failed to fetch
Network error
```

**Solutions:**

1. **Verify backend is running**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check API URL in .env**
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Check CORS configuration**
   ```javascript
   // Backend must allow frontend origin
   cors({
     origin: 'http://localhost:5173',
     credentials: true
   })
   ```

4. **Check browser console**
   - F12 → Network tab
   - Look for failed requests
   - Check request URL is correct

---

### API Requests Timing Out

**Error:**
```
Request timeout after 30000ms
```

**Solutions:**

1. **Increase timeout**
   ```javascript
   // services/api.js
   const api = axios.create({
     timeout: 60000 // 60 seconds
   });
   ```

2. **Check backend performance**
   ```bash
   # Backend may be processing slowly
   # Check backend logs for errors
   ```

3. **Check network**
   ```bash
   ping localhost
   curl -v http://localhost:3000/health
   ```

---

### 401 Unauthorized Errors

**Error:**
```
401 Unauthorized
```

**Solutions:**

1. **Check auth token**
   ```javascript
   // Check localStorage
   const token = localStorage.getItem('auth_token');
   console.log(token);
   ```

2. **Re-authenticate**
   ```javascript
   // Clear token and login again
   localStorage.removeItem('auth_token');
   ```

---

## AI Features Not Working

### Layout Suggestions Not Generating

**Error:**
```
Failed to generate layouts
```

**Solutions:**

1. **Check API keys in backend**
   ```bash
   # backend/.env
   echo $OPENAI_API_KEY  # Should not be empty
   ```

2. **Check backend logs**
   ```bash
   # Terminal running backend
   # Look for OpenAI API errors
   ```

3. **Check product image URL**
   ```javascript
   // Must be valid, accessible URL
   console.log(productImageUrl);
   ```

4. **Test API directly**
   ```bash
   curl -X POST http://localhost:3000/api/ai/suggest-layouts \
     -H "Content-Type: application/json" \
     -d '{"productImageUrl":"...","category":"beverages"}'
   ```

---

### Copy Generation Fails

**Error:**
```
Failed to generate copy
```

**Solutions:**

1. **Check Anthropic API key**
   ```bash
   # backend/.env
   echo $ANTHROPIC_API_KEY  # Should start with sk-ant-
   ```

2. **Check rate limits**
   - Free tier: Limited requests/day
   - Solution: Upgrade plan or wait

3. **Check input data**
   ```javascript
   // Must have product name
   console.log(copyFormData.productName);
   ```

---

### Background Generation Slow

**Symptoms:** Takes > 30 seconds or times out

**Solutions:**

1. **This is normal**
   - Stable Diffusion takes 10-15 seconds
   - Complex prompts take longer

2. **Show progress messages**
   ```javascript
   // Already implemented in BackgroundGenerator
   toast.loading('Creating your design...');
   ```

3. **Check Stability AI key**
   ```bash
   echo $STABILITY_API_KEY
   ```

---

## Performance Issues

### Slow Page Load

**Symptoms:** Takes > 5 seconds to load

**Solutions:**

1. **Check bundle size**
   ```bash
   npm run build
   # Look for large chunks
   ```

2. **Enable compression**
   ```javascript
   // vite.config.js
   import compression from 'vite-plugin-compression';
   
   plugins: [compression()]
   ```

3. **Use production build**
   ```bash
   # Development is slower
   npm run build
   npm run preview
   ```

---

### High Memory Usage

**Symptoms:** Browser tab uses > 1GB RAM

**Solutions:**

1. **Limit undo history**
   ```javascript
   // canvasStore.js
   const MAX_HISTORY = 50;
   ```

2. **Clear localStorage periodically**
   ```javascript
   // Clear old data
   localStorage.removeItem('uploaded_images');
   ```

3. **Optimize images**
   ```javascript
   // Use imageOptimizer for all uploads
   const optimized = await optimizeImageForCanvas(url);
   ```

---

### Validation Too Slow

**Symptoms:** Validation takes > 5 seconds

**Solutions:**

1. **Use debouncing** (already implemented)
   ```javascript
   // Validation debounced to 1.5s
   ```

2. **Disable auto-validation**
   - Click eye icon in Validation panel
   - Validate manually when ready

3. **Check backend performance**
   ```bash
   # Backend may be slow
   # Check logs for bottlenecks
   ```

---

## Browser Compatibility

### Issues in Safari

**Symptoms:** Features don't work in Safari

**Solutions:**

1. **Check Safari version**
   - Minimum: Safari 14+
   - Update to latest version

2. **Check console for errors**
   - Safari has stricter CORS
   - May block localStorage

3. **Test in Chrome**
   - Verify it works in Chrome
   - If yes, Safari-specific issue

---

### Issues in Firefox

**Symptoms:** Canvas rendering issues

**Solutions:**

1. **Check Firefox version**
   - Minimum: Firefox 88+

2. **Disable strict tracking**
   - Settings → Privacy
   - Disable "Strict" mode

---

### Mobile Issues

**Symptoms:** Doesn't work on mobile

**Solutions:**

1. **Not mobile-optimized**
   - Retail Forge is desktop-first
   - Use desktop browser for full features

2. **Test responsive design**
   ```bash
   # Browser DevTools
   # Toggle device toolbar (F12 → Ctrl+Shift+M)
   ```

---

## Debug Mode

### Enable Verbose Logging

```javascript
// Add to src/main.jsx
window.DEBUG = true;

// In components
if (window.DEBUG) {
  console.log('Debug info:', data);
}
```

### React DevTools

```bash
# Install browser extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Open with F12 → Components/Profiler tabs
```

### Network Debugging

```bash
# Browser F12 → Network tab
# Filter: Fetch/XHR
# Look for:
# - Failed requests (red)
# - Slow requests (> 1s)
# - Wrong URLs
```

---

## Getting Help

### Before Asking for Help

1. **Check browser console** (F12 → Console)
2. **Check Network tab** (F12 → Network)
3. **Check backend logs**
4. **Try in incognito mode**
5. **Clear cache and cookies**
6. **Restart dev server**
7. **Check this troubleshooting guide**

### Reporting Issues

Include:
- **Error message** (copy from console)
- **Steps to reproduce**
- **Browser & version**
- **Node version** (`node --version`)
- **npm version** (`npm --version`)
- **OS** (Windows/Mac/Linux)
- **Screenshots** (if relevant)

### Quick Fixes Checklist

- [ ] Restart dev server
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Clear localStorage
- [ ] Reinstall dependencies (`rm -rf node_modules && npm install`)
- [ ] Check .env file
- [ ] Verify backend is running
- [ ] Check API keys
- [ ] Update Node.js
- [ ] Try incognito mode
- [ ] Check browser console

---

## Emergency Reset

**Nuclear option - last resort:**

```bash
# Stop all servers
# Ctrl+C in all terminals

# Frontend cleanup
cd frontend
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev

# Backend cleanup  
cd ../backend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Clear browser data
# Settings → Clear browsing data
# Check: Cookies, Cache, Site data

# Clear localStorage
# Browser console: localStorage.clear()
```

---

**Still stuck?** Open a GitHub issue with details!