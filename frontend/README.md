# Retail Forge AI - Frontend Documentation

**AI-Powered Creative Builder for Compliant Retail Media Campaigns**

Built for **Tesco Retail Media InnovAItion Jam 2025**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Features & Components](#features--components)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Performance Optimizations](#performance-optimizations)
- [Styling Guidelines](#styling-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Retail Forge AI frontend is a React-based application that provides an intuitive canvas editor for creating compliant retail media creatives. It features real-time AI assistance, drag-and-drop functionality, and multi-format export capabilities.

### Key Features

- **Canvas Editor**: Fabric.js-powered visual editor with 1080x1080px default canvas
- **Multi-Agent AI**: Layout suggestions, copy generation, background creation
- **Real-Time Validation**: 30+ Tesco compliance rules checked automatically
- **Image Processing**: Background removal, color extraction, optimization
- **Multi-Format Export**: Instagram, Facebook, Stories, In-Store displays
- **Brand Memory**: Save and reuse brand kits for consistent campaigns

---

## 🛠 Technology Stack

### Core Framework
- **React 19.2.0** - UI framework with latest concurrent features
- **Vite 7.2.4** - Build tool and dev server
- **Fabric.js 5.3.0** - HTML5 canvas manipulation

### State Management
- **Zustand 5.0.8** - Lightweight state management
  - `canvasStore` - Canvas instance, undo/redo, zoom
  - `aiStore` - AI results, layouts, copy suggestions

### Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Custom CSS Modules** - Component-specific styles
- **Lucide React 0.555.0** - Icon library

### HTTP & Utilities
- **Axios 1.13.2** - HTTP client for API calls
- **React Hot Toast 2.6.0** - Toast notifications
- **React Hook Form 7.66.1** - Form validation
- **Zod 4.1.13** - Schema validation
- **JSZip 3.10.1** - ZIP file generation for exports

### Development Tools
- **ESLint 9.39.1** - Code linting
- **Prettier 3.6.2** - Code formatting
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.22** - CSS vendor prefixes

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   └── vite.svg           # Vite logo
├── src/
│   ├── assets/            # Images, fonts, static files
│   │   └── react.svg
│   ├── components/        # React components (organized by feature)
│   │   ├── AI/           # AI-powered components
│   │   │   ├── BackgroundGenerator.jsx
│   │   │   ├── CopySuggestions.jsx
│   │   │   ├── LayoutSuggestions.jsx
│   │   │   └── SmartAssistant.jsx
│   │   ├── Canvas/       # Canvas editor components
│   │   │   ├── CanvasEditor.jsx         # Main canvas container
│   │   │   ├── CanvasToolbar.jsx        # Top toolbar
│   │   │   ├── CanvasControls.jsx       # Right panel controls
│   │   │   ├── FormatSelector.jsx       # Format dropdown
│   │   │   ├── ImageControls.jsx        # Image manipulation
│   │   │   ├── CropTool.jsx            # Cropping functionality
│   │   │   ├── LayersPanel.jsx         # Layer management
│   │   │   └── BackgroundColorPicker.jsx
│   │   ├── Export/       # Export functionality
│   │   │   └── ExportPanel.jsx
│   │   ├── UI/           # Reusable UI components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── OnboardingTutorial.jsx
│   │   │   ├── KeyboardShortcuts.jsx
│   │   │   ├── ColorPalette.jsx
│   │   │   └── BrandKitPanel.jsx
│   │   ├── Upload/       # Upload & library
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── ImageLibrary.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── FilePreview.jsx
│   │   │   └── ValueTileSelector.jsx
│   │   └── Validation/   # Compliance validation
│   │       └── ValidationPanel.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useKeyboard.js
│   │   └── useOrchestrator.js
│   ├── services/         # API service layer
│   │   └── api.js        # Axios instance with interceptors
│   ├── store/            # Zustand state stores
│   │   ├── canvasStore.js
│   │   └── aiStore.js
│   ├── utils/            # Helper functions
│   │   ├── constants.js
│   │   ├── imageOptimizer.js
│   │   ├── snapGuides.js
│   │   ├── valueTileUtils.js
│   │   └── performanceUtils.js
│   ├── App.jsx           # Root component
│   ├── App.css           # Global styles
│   ├── main.jsx          # React entry point
│   └── index.css         # Base CSS
├── .env.example          # Environment variables template
├── .eslintrc.cjs         # ESLint configuration
├── .prettierrc           # Prettier configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
└── vite.config.js        # Vite configuration
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/retail-forge-ai.git
cd retail-forge-ai/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies listed in `package.json`:
- Production dependencies (~150+ packages)
- Development dependencies (ESLint, Prettier, Vite plugins)

### Step 3: Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API endpoint
VITE_API_BASE_URL=http://localhost:3000/api

# Image processing service
VITE_IMAGE_SERVICE_URL=http://localhost:8000
```

**Environment Variables:**
- `VITE_API_BASE_URL` - Node.js backend API (default: http://localhost:3000/api)
- `VITE_IMAGE_SERVICE_URL` - Python image service (default: http://localhost:8000)

### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

### Additional Scripts

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

---

## 🎨 Features & Components

### 1. Canvas Editor (`CanvasEditor.jsx`)

**Purpose**: Main editing workspace with Fabric.js canvas

**Features**:
- 1080x1080px default canvas (configurable via FormatSelector)
- Zoom controls (scroll to zoom, Alt+drag to pan)
- Object manipulation (drag, resize, rotate)
- Undo/redo with history (max 50 states)
- Snap guides for alignment
- Background color picker

**Key Props**:
```jsx
<CanvasEditor
  isReady={boolean}              // Canvas initialization status
  onDimensionsChange={function}   // Callback when canvas size changes
/>
```

**Canvas Configuration**:
```javascript
const fabricCanvas = new fabric.Canvas(canvasRef.current, {
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  selection: true,
  preserveObjectStacking: true,
  renderOnAddRemove: true,
  enableRetinaScaling: true,
  imageSmoothingEnabled: true,
});
```

---

### 2. Canvas Toolbar (`CanvasToolbar.jsx`)

**Purpose**: Top toolbar with core editing actions

**Features**:
- Undo/Redo buttons
- Delete selected object
- Clear canvas
- Format selector dropdown
- Validation button
- Export button (ZIP with PNG, JPEG, PDF)

**Keyboard Shortcuts**:
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Delete` - Delete selected
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Arrow Keys` - Move object (Shift+Arrow = 10px)

---

### 3. Sidebar (`Sidebar.jsx`)

**Purpose**: Multi-tab sidebar for uploads, AI tools, and controls

**Tabs**:

#### Upload Tab
- **Packshots**: Max 3 (first is lead product)
- **Logos**: Unlimited brand logos
- **Backgrounds**: Max 1 lifestyle image
- **Decorative**: Unlimited icons, badges

#### Text Tab
- Add heading (32px)
- Add subheading (24px)
- Add body text (16px)
- Add small text (12px)

#### Library Tab
- View all uploaded images grouped by type
- Click to add to canvas
- Delete images
- Shows lead badge on first packshot

#### Colors Tab
- Background color picker
- Apply color to text
- Recently extracted colors
- Quick color swatches

#### Layers Tab
- Drag to reorder
- Toggle visibility
- Lock/unlock layers
- Delete layers
- **Note**: Value tiles excluded from layers panel

#### Tiles Tab
- Tesco Brand Tile
- White Value Tile (price only)
- Clubcard Price Tile (offer + regular + end date)
- **Note**: Tiles locked at top-right, cannot be moved

#### AI Tabs
- **Layouts**: GPT-4 Vision layout suggestions
- **Copy**: AI copywriting with compliance
- **Gen BG**: Stable Diffusion background generation
- **Assistant**: Smart multi-step creative generation

---

### 4. AI Components

#### Layout Suggestions (`LayoutSuggestions.jsx`)

**Purpose**: Generate optimal layouts using GPT-4 Vision

**How It Works**:
1. User provides product image URL
2. Select category (beverages, food, beauty, etc.)
3. Choose style (modern, minimal, vibrant, etc.)
4. GPT-4 Vision analyzes product and suggests 3 layouts
5. Click "Apply" to position existing canvas elements

**API Call**:
```javascript
POST /api/ai/suggest-layouts
{
  "productImageUrl": "https://...",
  "category": "beverages",
  "style": "modern",
  "userId": 1
}
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "suggestions": {
      "layouts": [
        {
          "name": "Bold Product Focus",
          "description": "Large product with minimal text",
          "rationale": "Modern style works well...",
          "elements": {
            "product": { "x": 540, "y": 540, "width": 400, "height": 400 },
            "headline": { "x": 100, "y": 900, "fontSize": 48 },
            "logo": { "x": 900, "y": 100, "width": 80, "height": 80 }
          }
        }
      ]
    }
  }
}
```

#### Copy Suggestions (`CopySuggestions.jsx`)

**Purpose**: Generate compliant ad copy using Claude Sonnet 4.5

**Form Fields**:
- Product Name (required)
- Category (dropdown)
- Features (comma-separated)
- Style (energetic, elegant, minimal, playful, professional)

**API Call**:
```javascript
POST /api/ai/generate-copy
{
  "productInfo": {
    "name": "Fresh Orange Juice",
    "category": "beverages",
    "features": ["100% natural", "no sugar"],
    "audience": "general consumers"
  },
  "style": "energetic",
  "userId": 1
}
```

**Response**:
```javascript
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "headline": "Pure Natural Energy",
        "subhead": "Fresh-squeezed goodness in every sip",
        "rationale": "Appeals to health-conscious consumers",
        "complianceNotes": "No unsubstantiated claims"
      }
    ]
  }
}
```

**Actions**:
- Add headline to canvas (editable)
- Add subhead to canvas (editable)
- Copy text to clipboard

#### Background Generator (`BackgroundGenerator.jsx`)

**Purpose**: AI-generated backgrounds using Stable Diffusion

**Form Fields**:
- Prompt (text description)
- Style (professional, modern, minimal, vibrant, abstract, gradient, textured)

**Example Prompts**:
- "Soft pastel gradient"
- "Modern geometric patterns"
- "Warm summer sunset"
- "Cool blue abstract waves"

**API Call**:
```javascript
POST /api/image/generate-background
{
  "prompt": "soft pastel gradient",
  "style": "professional",
  "width": 1080,
  "height": 1080
}
```

**Processing Time**: 10-15 seconds

**Actions**:
- Apply as canvas background
- Add to canvas as image
- Download

#### Smart Assistant (`SmartAssistant.jsx`)

**Purpose**: Multi-step AI orchestration for complete ad generation

**Features**:
- **LEP Mode**: Left-aligned text, LEP badge right of packshots
- **Non-LEP Mode**: Centered text, logo at top-left
- Automatic background removal
- AI background generation
- Copy generation
- Layout composition

**LEP Rules**:
- All text left-aligned
- "LEP" text in Tesco blue (#00539F) to the right of ALL packshots
- White background
- Tagline split into multiple lines if needed
- No shadows on text

**Non-LEP Rules**:
- Centered text with shadows
- Logo at top-left (130, 110)
- Gradient or AI-generated background
- Single-line tagline

**Example Prompt**:
```
"Sports LEP ad for cricket bat with Rs 499 price"
```

**Processing Steps**:
1. Analyze prompt → Extract category, price, LEP flag
2. Generate copy → Claude Sonnet 4.5
3. Generate background (if non-LEP) → Stable Diffusion
4. Build layout → Position elements with correct styling
5. Success feedback

---

### 5. Image Controls (`ImageControls.jsx`)

**Purpose**: Advanced image manipulation tools

**Features**:

#### Dimensions
- Width × Height inputs (px)
- Lock aspect ratio toggle
- Real-time preview

#### Quick Scale
- 50%, 75%, 150%, 200% buttons
- Preserves aspect ratio

#### Rotation
- -90°, 90°, 180° buttons
- Custom angle input

#### Flip
- Horizontal flip
- Vertical flip

#### Alignment
- Left, Center, Right (horizontal)
- Top, Middle, Bottom (vertical)
- 3×3 grid buttons

#### Crop
- Click "Crop Image"
- Drag crop rectangle
- Confirm or cancel
- Original image restored on cancel

#### Color Extraction
- Extract 5 dominant colors
- Save to database
- Copy hex code on click
- Display color name and brightness

#### Background Removal
- AI-powered (SAM model via rembg)
- Processing time: 10-30 seconds
- Progress indicators
- Preserves transformations

---

### 6. Export Panel (`ExportPanel.jsx`)

**Purpose**: Multi-format export with compliance report

**Available Formats**:
1. Instagram Post (1080 × 1080)
2. Facebook Feed (1200 × 628)
3. Instagram Story (1080 × 1920)
4. In-Store Display (1920 × 1080)

**Export Process**:
1. Select formats (checkboxes)
2. Click "Export"
3. Backend generates:
   - PNG (high quality, multiplier 2)
   - JPEG (compressed, <500KB)
   - PDF compliance report
4. Downloads as ZIP file

**API Call**:
```javascript
POST /api/export
Content-Type: multipart/form-data

Body:
- image: Blob (PNG from canvas)
- formats: ["instagram_post", "facebook_feed"]
- complianceData: JSON (validation results)
```

**Response**: ZIP file with:
```
retail_forge_export_[timestamp].zip
├── creative.png          # High quality
├── creative.jpg          # Compressed
├── Instagram_Post.jpg    # 1080×1080, <500KB
├── Facebook_Feed.jpg     # 1200×628, <500KB
├── compliance_report.pdf # Validation details
└── metadata.json         # Export info
```

---

### 7. Validation Panel (`ValidationPanel.jsx`)

**Purpose**: Real-time compliance checking against 30+ Tesco rules

**Features**:
- Auto-validation (toggleable)
- Manual validation button
- Debounced checks (1.5s after last edit)
- Score: 0-100
- Violations with severity levels
- Warnings for best practices
- Auto-fix suggestions

**Validation Request**:
```javascript
POST /api/validate/creative
{
  "creativeData": {
    "format": "instagram_post",
    "backgroundColor": "#ffffff",
    "text": "all text concatenated",
    "headline": "largest text element",
    "subhead": "second largest",
    "elements": [
      {
        "type": "i-text",
        "content": "Some text",
        "fontSize": 22,
        "fill": "#000000",
        "left": 100,
        "top": 100,
        "width": 200,
        "height": 50,
        "isPackshot": false,
        "index": 0
      }
    ],
    "category": "general",
    "isAlcohol": false
  }
}
```

**Validation Response**:
```javascript
{
  "success": true,
  "data": {
    "isCompliant": true,
    "score": 95,
    "rulesChecked": 30,
    "rulesPassed": 28,
    "violations": [
      {
        "ruleId": "min_font_size",
        "ruleName": "Minimum Font Size",
        "severity": "hard_fail",
        "message": "Text too small (18px). Minimum is 20px.",
        "suggestion": "Increase font size to 20px or larger",
        "affectedElements": [
          { "element": "text_0", "index": 0, "minimumSize": 20 }
        ]
      }
    ],
    "warnings": [
      {
        "ruleName": "Font Size Recommendation",
        "message": "Consider 24px for better readability"
      }
    ]
  }
}
```

**Rule Categories**:
1. **Content Rules** (8 rules)
   - No T&Cs language
   - No competition mentions
   - No sustainability claims (unless certified)
   - No price callouts in copy
   - No unsubstantiated claims

2. **Design Rules** (10 rules)
   - Min font size: 20px (10px checkout, 12px tags)
   - WCAG AA contrast (4.5:1 text, 3:1 large)
   - Value tile positioning
   - CTA size requirements
   - LEP design standards

3. **Layout Rules** (5 rules)
   - Packshot spacing (24px minimum)
   - Social safe zones (200px top, 250px bottom for Stories)
   - CTA positioning
   - Max 3 packshots

4. **Media Rules** (2 rules)
   - Photography of people (requires confirmation)
   - Image quality standards

**Auto-Fix Features**:
- Font size violations → Set to minimum size
- Contrast violations → Change text color to black/white
- Highlight affected elements (red border, 5s timeout)

---

### 8. Brand Kit Panel (`BrandKitPanel.jsx`)

**Purpose**: Save and reuse brand settings

**Saved Data**:
- Kit name
- Logo URL
- Color palette (5 colors)
- Font preferences
- Canvas size preference
- Last used timestamp

**Storage**: LocalStorage (JSON)

**Features**:
- Create new kit from current canvas
- Load existing kit
- Delete kit
- Auto-applies colors to canvas background
- Shows last used date

---

### 9. Onboarding Tutorial (`OnboardingTutorial.jsx`)

**Purpose**: First-time user walkthrough

**Steps**:
1. Welcome message
2. Upload tab explanation
3. Layouts tab explanation
4. Copy tab explanation
5. Validate tab explanation
6. Export tab explanation
7. Brand memory tip
8. Completion

**Storage**: LocalStorage flag `retailforge_tutorial_completed`

**Features**:
- Skip tutorial
- Previous/Next buttons
- Progress bar
- Tab highlighting
- Auto-plays on first visit

---

### 10. Keyboard Shortcuts (`KeyboardShortcuts.jsx`)

**Purpose**: Keyboard navigation help

**Shortcuts**:
- `?` - Show shortcuts modal
- `Esc` - Deselect / Close modal
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Ctrl+C` - Copy
- `Ctrl+V` - Paste
- `Del` - Delete selected
- `↑↓←→` - Move object (1px)
- `Shift+↑↓←→` - Move object (10px)
- `Scroll` - Zoom in/out
- `Alt+Drag` or `Cmd+Drag` - Pan canvas
- `Ctrl+[` - Send backward
- `Ctrl+]` - Bring forward

**UI**: Floating button (bottom-right, purple gradient)

---

## 🗄 State Management

### Canvas Store (`canvasStore.js`)

**Purpose**: Manage canvas instance and editing state

**State**:
```javascript
{
  canvas: fabric.Canvas | null,        // Fabric.js instance
  elements: [],                        // Canvas objects (unused)
  selectedElement: null,               // Currently selected object
  history: {
    past: [],                          // Undo stack (max 50)
    future: []                         // Redo stack
  },
  zoom: 100,                          // Zoom percentage
  _isLoadingState: false              // Loading flag
}
```

**Actions**:
```javascript
setCanvas(canvas)                     // Initialize canvas
clearCanvas()                         // Clear all objects + reset history
saveState()                          // Save to undo stack (debounced 300ms)
undo()                               // Restore previous state
redo()                               // Restore next state
setSelectedElement(element)          // Set selected object
setZoom(zoom)                        // Set zoom level
```

**Undo/Redo Implementation**:
- Uses `canvas.toJSON()` with custom properties
- Saves max 50 states (prevents memory issues)
- Debounced saves (300ms) to avoid excessive history
- Clears future stack on new action
- Preserves custom properties: `isValueTile`, `tileType`, `excludeFromLayers`, `imageType`, `isLead`

**Usage**:
```javascript
import useCanvasStore from '@/store/canvasStore';

function MyComponent() {
  const { canvas, undo, redo, saveState } = useCanvasStore();
  
  const handleEdit = () => {
    // Make changes to canvas
    canvas.add(newObject);
    
    // Save state for undo
    saveState();
  };
}
```

---

### AI Store (`aiStore.js`)

**Purpose**: Store AI generation results and form state

**State**:
```javascript
{
  generatedLayouts: [],               // Layout suggestions from AI
  generatedCopy: [],                  // Copy suggestions from AI
  assistantInput: '',                 // Smart assistant prompt
  assistantResults: null,             // Assistant recommendations
  copyFormData: {                     // Copy tab form state
    productName: '',
    category: 'beverages',
    features: '',
    style: 'energetic'
  }
}
```

**Actions**:
```javascript
setGeneratedLayouts(layouts)         // Save layout suggestions
setGeneratedCopy(copy)              // Save copy suggestions
setAssistantInput(input)            // Save assistant prompt
setAssistantResults(results)        // Save assistant results
setCopyFormData(updates)            // Update copy form fields
```

**Persistence**:
- Layouts persist across tab switches
- Copy form data preserved when switching tabs
- Assistant results shown in UI

**Usage**:
```javascript
import useAIStore from '@/store/aiStore';

function CopySuggestions() {
  const { 
    generatedCopy, 
    setGeneratedCopy,
    copyFormData,
    setCopyFormData 
  } = useAIStore();
  
  const handleGenerate = async () => {
    const result = await generateCopy(copyFormData);
    setGeneratedCopy(result.suggestions);
  };
}
```

---

## 🔌 API Integration

### API Service (`services/api.js`)

**Purpose**: Axios instance with interceptors

**Configuration**:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Request Interceptor**:
- Adds `Authorization: Bearer {token}` header if token exists
- Logs requests in development mode

**Response Interceptor**:
- Returns `response.data` (unwraps Axios response)
- Logs responses in development
- Handles 401 errors (clears token, optionally redirects)
- Rejects with error for failed requests

**Usage**:
```javascript
import api from '@/services/api';

// GET request
const response = await api.get('/test');

// POST request
const result = await api.post('/ai/generate-copy', {
  productInfo: { name: 'Product' },
  style: 'modern'
});

// File upload
const formData = new FormData();
formData.append('image', file);
const upload = await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

### API Endpoints

All endpoints use base URL: `http://localhost:3000/api`

#### Upload & Processing

**Upload Image**
```javascript
POST /upload
Content-Type: multipart/form-data
Body: { image: File, type: string }

Response:
{
  "success": true,
  "data": {
    "imageId": "img_abc123",
    "url": "base64...",
    "width": 800,
    "height": 600,
    "filename": "image.jpg"
  }
}
```

**Remove Background**
```javascript
POST /api/image/remove-background
Content-Type: multipart/form-data
Body: { file: File, method: "fast" }

Response:
{
  "success": true,
  "download_url": "/uploads/processed/image-nobg.png"
}
```

**Extract Colors**
```javascript
POST /api/image/extract-colors
Content-Type: multipart/form-data
Body: { file: File, count: 5 }

Response:
{
  "success": true,
  "colors": [
    { "hex": "#FF5733", "rgb": [255, 87, 51], "name": "Red Orange", "brightness": 150 }
  ]
}
```

**Generate Background**
```javascript
POST /api/image/generate-background
Content-Type: application/json
Body: { prompt: "soft gradient", style: "professional", width: 1080, height: 1080 }

Response:
{
  "success": true,
  "data": {
    "file_id": "bg_xyz",
    "download_url": "/uploads/generated/background.jpg",
    "metadata": { "file_size_kb": 487 }
  }
}
```

#### AI Services

**Suggest Layouts**
```javascript
POST /api/ai/suggest-layouts
Body: { productImageUrl, category, style, userId }

Response:
{
  "success": true,
  "data": {
    "suggestions": {
      "layouts": [
        {
          "name": "Bold Product Focus",
          "description": "Large product with minimal text",
          "rationale": "Modern style works well...",
          "elements": { product, headline, logo }
        }
      ]
    }
  }
}
```

**Generate Copy**
```javascript
POST /api/ai/generate-copy
Body: { productInfo: { name, category, features }, style, userId }

Response:
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "headline": "Pure Natural Energy",
        "subhead": "Fresh-squeezed goodness",
        "rationale": "Appeals to health-conscious consumers",
        "complianceNotes": "No unsubstantiated claims"
      }
    ]
  }
}
```

#### Validation

**Validate Creative**
```javascript
POST /api/validate/creative
Body: { creativeData: { format, elements, text, category, isAlcohol } }

Response:
{
  "success": true,
  "data": {
    "isCompliant": true,
    "score": 95,
    "rulesChecked": 30,
    "rulesPassed": 28,
    "violations": [],
    "warnings": []
  }
}
```

#### Export

**Export Creative**
```javascript
POST /api/export
Content-Type: multipart/form-data
Body: { 
  image: Blob, 
  formats: ["instagram_post", "facebook_feed"],
  complianceData: JSON 
}

Response: ZIP file (application/zip)
```

---

## ⚡ Performance Optimizations

### 1. Debouncing & Throttling

**Validation Debounce** (1.5s):
```javascript
import { debounce } from '@/utils/performanceUtils';

const debouncedValidation = debounce(() => {
  validateCreative();
}, 1500);
```

**Canvas Render Throttle** (16ms = ~60fps):
```javascript
const scheduleRender = debounce(() => {
  canvas.renderAll();
}, 16);
```

### 2. API Response Caching

**APICache Class**:
```javascript
import { apiCache, cachedAPICall } from '@/utils/performanceUtils';

// Cache AI layouts for 1 hour
const layouts = await cachedAPICall(
  `layouts_${productId}_${category}`,
  () => generateLayouts(productId, category)
);
```

### 3. Image Optimization

**Before Canvas Add**:
```javascript
import { optimizeImageForCanvas } from '@/utils/imageOptimizer';

const optimizedUrl = await optimizeImageForCanvas(imageUrl, 2000);
// Resizes to max 2000px, quality 0.9
```

### 4. Undo/Redo Optimization

- Max 50 history states (prevents memory bloat)
- 300ms debounce on `saveState()`
- Loading flag prevents recursive saves

### 5. Race Condition Prevention

**Latest Request Tracking**:
```javascript
const latestRequestRef = useRef(0);

const validate = async () => {
  const requestId = ++latestRequestRef.current;
  const result = await fetch(...);
  
  // Only update if this is still the latest request
  if (requestId === latestRequestRef.current) {
    setResults(result);
  }
};
```

**Abort Previous Requests**:
```javascript
const abortControllerRef = useRef(null);

const validate = async () => {
  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  
  const abortController = new AbortController();
  abortControllerRef.current = abortController;
  
  await fetch(..., { signal: abortController.signal });
};
```

### 6. LocalStorage Compression

**Compressed Storage**:
```javascript
import { compressedStorage } from '@/utils/performanceUtils';

// Save
compressedStorage.set('uploaded_images', images);

// Load
const images = compressedStorage.get('uploaded_images');
```

### 7. Lazy Loading

**Intersection Observer**:
```javascript
import { lazyLoadImage } from '@/utils/performanceUtils';

const observer = lazyLoadImage(imgElement, imageUrl);
```

---

## 🎨 Styling Guidelines

### 1. Tailwind CSS

**Utility-First Approach**:
```jsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
  Submit
</button>
```

**Custom Tailwind Config** (`tailwind.config.js`):
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        tesco: {
          blue: '#00539F',
          red: '#E31E24',
        }
      }
    },
  },
}
```

### 2. Component-Specific CSS

**CSS Modules**:
```css
/* ComponentName.css */
.component-name {
  /* Styles */
}
```

**Import**:
```jsx
import './ComponentName.css';
```

### 3. Global Styles

**index.css**:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
```

### 4. Design System

**Colors**:
- Primary: `#2563eb` (blue-600)
- Success: `#22c55e` (green-500)
- Warning: `#fbbf24` (yellow-400)
- Error: `#ef4444` (red-500)
- Tesco Blue: `#00539F`
- Tesco Red: `#E31E24`

**Typography**:
- Font Family: `'Inter', system-ui, sans-serif`
- Heading: `20-24px, bold`
- Body: `14px, normal`
- Small: `12px, normal`

**Spacing**:
- xs: `4px`
- sm: `8px`
- md: `12px`
- lg: `16px`
- xl: `24px`

**Border Radius**:
- sm: `4px`
- md: `6px`
- lg: `8px`
- full: `9999px`

---

## 🧪 Testing

### Manual Testing Checklist

#### Canvas Editor
- [ ] Canvas initializes (1080×1080)
- [ ] Objects can be dragged
- [ ] Objects can be resized
- [ ] Objects can be rotated
- [ ] Undo/redo works
- [ ] Delete works (Del key)
- [ ] Copy/paste works (Ctrl+C/V)
- [ ] Zoom works (scroll)
- [ ] Pan works (Alt+drag)

#### Upload
- [ ] Images upload successfully
- [ ] File preview shows
- [ ] Max 3 packshots enforced
- [ ] First packshot marked as LEAD
- [ ] Images appear in library
- [ ] Images can be added to canvas

#### AI Tools
- [ ] Layout suggestions generate
- [ ] Layouts apply to canvas
- [ ] Copy suggestions generate
- [ ] Copy adds to canvas
- [ ] Background generates (10-15s)
- [ ] Background applies to canvas
- [ ] Smart assistant works

#### Image Controls
- [ ] Dimensions update
- [ ] Quick scale works
- [ ] Rotation works
- [ ] Flip works
- [ ] Alignment works
- [ ] Crop works
- [ ] Color extraction works
- [ ] Background removal works (10-30s)

#### Validation
- [ ] Auto-validation triggers
- [ ] Manual validation works
- [ ] Score displays
- [ ] Violations show
- [ ] Warnings show
- [ ] Auto-fix works
- [ ] Highlight works

#### Export
- [ ] Format selection works
- [ ] Export generates ZIP
- [ ] PNG quality is high
- [ ] JPEG is <500KB
- [ ] PDF report includes
- [ ] All formats render correctly

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in `dist/`:
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Source maps (optional)

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at `http://localhost:4173`

### Deployment Targets

#### 1. Vercel

```bash
npm install -g vercel
vercel
```

**Configuration** (`.vercel/project.json`):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### 2. Netlify

**`netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. AWS S3 + CloudFront

```bash
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### 4. Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build & Run**:
```bash
docker build -t retail-forge-frontend .
docker run -p 80:80 retail-forge-frontend
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Canvas Not Initializing

**Symptom**: Blank screen, no canvas visible

**Solutions**:
```javascript
// Check if canvas ref is available
if (!canvasRef.current) {
  console.error('Canvas ref not found');
}

// Ensure Fabric.js loaded
if (typeof fabric === 'undefined') {
  console.error('Fabric.js not loaded');
}

// Check for errors in browser console
```

#### 2. API Calls Failing

**Symptom**: Network errors, timeout errors

**Solutions**:
```bash
# Check backend is running
curl http://localhost:3000/health

# Check environment variables
echo $VITE_API_BASE_URL

# Check CORS settings in backend
```

#### 3. Images Not Uploading

**Symptom**: Upload fails, no preview

**Solutions**:
- Check file size (max 10MB)
- Check file type (image/* only)
- Check network tab for 413 errors
- Verify backend `/api/upload` endpoint

#### 4. Validation Not Working

**Symptom**: No results, loading forever

**Solutions**:
```javascript
// Check if canvas has objects
const objects = canvas.getObjects();
console.log('Canvas objects:', objects.length);

// Check validation endpoint
curl -X POST http://localhost:3000/api/validate/creative \
  -H "Content-Type: application/json" \
  -d '{"creativeData": {...}}'
```

#### 5. Export Not Downloading

**Symptom**: Export button does nothing

**Solutions**:
- Check browser console for errors
- Verify backend `/api/export` endpoint
- Check if ZIP file is generated
- Test with smaller canvas (less objects)

#### 6. Undo/Redo Not Working

**Symptom**: Undo button disabled

**Solutions**:
```javascript
// Check history state
const { history } = useCanvasStore.getState();
console.log('Past:', history.past.length);
console.log('Future:', history.future.length);

// Manually save state
saveState();
```

#### 7. Performance Issues

**Symptom**: Slow canvas, laggy interactions

**Solutions**:
- Reduce canvas size (e.g., 720×720 for preview)
- Optimize images before adding to canvas
- Limit undo history (reduce MAX_HISTORY)
- Disable real-time validation
- Use object caching:
  ```javascript
  obj.set({
    objectCaching: true,
    statefullCache: true
  });
  ```

### Browser Compatibility

**Minimum Requirements**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Known Issues**:
- Safari: Canvas exports may have slight color shifts
- Firefox: Background removal slower (no WebGL acceleration)
- Mobile: Touch events not fully supported (use desktop)

---

## 📚 Additional Resources

### Documentation
- [Fabric.js Docs](http://fabricjs.com/docs/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [Tailwind Docs](https://tailwindcss.com/docs)

### Tutorials
- [Fabric.js Tutorial](http://fabricjs.com/fabric-intro-part-1)
- [React State Management](https://react.dev/learn/managing-state)
- [Vite Guide](https://vitejs.dev/guide/)

### API References
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Anthropic API](https://docs.anthropic.com/claude/reference)
- [Stability AI](https://platform.stability.ai/docs)

---

## 🤝 Contributing

### Code Style

**Formatting**:
```bash
npm run format
```

**Linting**:
```bash
npm run lint
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `perf:` - Performance improvement
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file

---

## 👥 Team

**Team ATX - Tesco Retail Media InnovAItion Jam 2025**

- **Shauryaman Saxena** - AI/ML Lead & Backend Architecture
- **Mahatva Chandna** - AI/ML Engineer & Frontend Development

---

## 🙏 Acknowledgments

Built for Tesco Retail Media InnovAItion Jam 2025

Special thanks to the Tesco team for the opportunity to solve this challenge!

---

**Last Updated**: December 26, 2025
**Version**: 1.0.0