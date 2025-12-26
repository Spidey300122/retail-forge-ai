# Component Reference Guide

Complete reference for all React components in Retail Forge AI

---

## Table of Contents

- [Canvas Components](#canvas-components)
- [AI Components](#ai-components)
- [Upload Components](#upload-components)
- [UI Components](#ui-components)
- [Validation Components](#validation-components)
- [Export Components](#export-components)

---

## Canvas Components

### CanvasEditor

**Location**: `src/components/Canvas/CanvasEditor.jsx`

**Purpose**: Main canvas workspace with Fabric.js integration

**Props**:
```typescript
interface CanvasEditorProps {
  // No props - uses Zustand store
}
```

**Features**:
- 1080×1080px default canvas
- Zoom controls (scroll wheel)
- Pan controls (Alt/Cmd + drag)
- Object manipulation (drag, resize, rotate)
- Snap guides (10px tolerance)
- Background image support
- Undo/redo integration

**Usage**:
```jsx
import CanvasEditor from '@/components/Canvas/CanvasEditor';

function App() {
  return <CanvasEditor />;
}
```

**Canvas Configuration**:
```javascript
{
  width: 1080,
  height: 1080,
  backgroundColor: '#ffffff',
  selection: true,
  preserveObjectStacking: true,
  renderOnAddRemove: true,
  enableRetinaScaling: true,
  imageSmoothingEnabled: true,
}
```

**Custom Properties**:
- `isValueTile` - Marks value tile objects
- `tileType` - Type of value tile (new, white, clubcard)
- `excludeFromLayers` - Hide from layers panel
- `imageType` - Type of image (packshot, logo, background, decorative)
- `isLead` - First packshot marker

---

### CanvasToolbar

**Location**: `src/components/Canvas/CanvasToolbar.jsx`

**Purpose**: Top toolbar with editing actions

**Props**:
```typescript
interface CanvasToolbarProps {
  isReady: boolean;
  onDimensionsChange?: (dimensions: {width: number, height: number}) => void;
}
```

**Features**:
- Undo/Redo buttons (with Zustand integration)
- Delete selected object
- Clear canvas
- Format selector dropdown
- Validate button (opens modal)
- Export button (generates ZIP)

**Validation Modal**:
```jsx
<ValidationModal
  isOpen={boolean}
  onClose={() => void}
  validationResults={object}
  isValidating={boolean}
/>
```

**Export Process**:
1. Capture canvas as PNG (multiplier 2)
2. Convert to Blob
3. Send to `/api/export` with formats array
4. Receive ZIP file
5. Trigger browser download

---

### CanvasControls

**Location**: `src/components/Canvas/CanvasControls.jsx`

**Purpose**: Right sidebar controls (zoom, tips)

**Props**:
```typescript
interface CanvasControlsProps {
  isReady: boolean;
}
```

**Features**:
- Zoom in/out buttons
- Zoom percentage display
- Reset view button
- Tips box (keyboard shortcuts)
- ImageControls integration

**Zoom Levels**:
- Min: 10% (0.1)
- Max: 300% (3)
- Default: 100% (1)

---

### FormatSelector

**Location**: `src/components/Canvas/FormatSelector.jsx`

**Purpose**: Dropdown for canvas format selection

**Props**:
```typescript
interface FormatSelectorProps {
  onDimensionsChange?: (dimensions: {width: number, height: number}) => void;
}
```

**Available Formats**:
```javascript
const CANVAS_FORMATS = [
  { id: 'instagram_post', name: 'Instagram Post', width: 1080, height: 1080, icon: '📱' },
  { id: 'instagram_story', name: 'Instagram Story', width: 1080, height: 1920, icon: '📲' },
  { id: 'facebook_feed', name: 'Facebook Feed', width: 1200, height: 628, icon: '👍' },
  { id: 'instore_display', name: 'In-Store Display', width: 1920, height: 1080, icon: '🏪' },
  { id: 'custom', name: 'Custom Size', width: 1080, height: 1080, icon: '⚙️' },
];
```

**Custom Size**:
- Min: 100×100px
- Max: 5000×5000px
- Input validation

---

### ImageControls

**Location**: `src/components/Canvas/ImageControls.jsx`

**Purpose**: Advanced image manipulation tools

**Props**: None (uses Zustand store for canvas)

**Sections**:

#### 1. Dimensions
```jsx
<input 
  type="number" 
  value={width} 
  onChange={handleWidthChange}
  onBlur={saveState} 
/>
```
- Width × Height inputs (px)
- Lock aspect ratio checkbox
- Real-time updates

#### 2. Quick Scale
```jsx
<button onClick={() => handleScale(0.5)}>50%</button>
<button onClick={() => handleScale(0.75)}>75%</button>
<button onClick={() => handleScale(1.5)}>150%</button>
<button onClick={() => handleScale(2)}>200%</button>
```

#### 3. Rotation
```jsx
<button onClick={() => handleRotate(-90)}>-90°</button>
<button onClick={() => handleRotate(90)}>90°</button>
<button onClick={() => handleRotate(180)}>180°</button>
<input type="number" value={customAngle} />
```

#### 4. Flip
```jsx
<button onClick={handleFlipHorizontal}>Horizontal</button>
<button onClick={handleFlipVertical}>Vertical</button>
```

#### 5. Alignment (3×3 grid)
```jsx
<button onClick={() => handleAlign('left')}>←</button>
<button onClick={() => handleAlign('center-h')}>↔</button>
<button onClick={() => handleAlign('right')}>→</button>
<button onClick={() => handleAlign('top')}>↑</button>
<button onClick={() => handleAlign('center-v')}>↕</button>
<button onClick={() => handleAlign('bottom')}>↓</button>
```

#### 6. Crop
```jsx
<button onClick={handleStartCrop}>Crop Image</button>
```
Opens `CropTool` component

#### 7. Color Extraction
```jsx
<button onClick={handleExtractColors}>Extract Colors</button>
```
- Extracts 5 dominant colors
- Saves to database
- Displays color swatches
- Click to copy hex code

#### 8. Background Removal
```jsx
<button onClick={handleRemoveBackground} disabled={isProcessing}>
  {isProcessing ? 'Removing...' : 'Remove Background'}
</button>
```
- Processing time: 10-30 seconds
- Progress indicators
- Preserves transformations

---

### CropTool

**Location**: `src/components/Canvas/CropTool.jsx`

**Purpose**: Interactive image cropping overlay

**Props**:
```typescript
interface CropToolProps {
  image: fabric.Image;
  onComplete: (croppedImage: fabric.Image) => void;
  onCancel: () => void;
}
```

**Features**:
- Draggable crop rectangle
- Visual overlay (dark background)
- Confirm/Cancel buttons
- Original image restoration on cancel
- Preserves angle/flip transformations

**Usage**:
```jsx
{isCropping && (
  <CropTool
    image={selectedObject}
    onComplete={handleCropComplete}
    onCancel={handleCropCancel}
  />
)}
```

---

### LayersPanel

**Location**: `src/components/Canvas/LayersPanel.jsx`

**Purpose**: Manage canvas object layers

**Props**: None

**Features**:
- Drag to reorder (HTML5 drag & drop)
- Toggle visibility (eye icon)
- Lock/unlock (padlock icon)
- Delete layer (trash icon)
- Selected layer highlighting
- **Excludes**: Value tiles (`isValueTile: true`)

**Layer Card Structure**:
```jsx
<div className="layer-card">
  <GripVertical /> {/* Drag handle */}
  <div className="layer-info">
    <p className="layer-name">{getLayerName(obj)}</p>
    <p className="layer-type">{obj.type}</p>
  </div>
  <button onClick={toggleVisibility}><Eye /></button>
  <button onClick={toggleLock}><Lock /></button>
  <button onClick={deleteLayer}><Trash2 /></button>
</div>
```

---

### BackgroundColorPicker

**Location**: `src/components/Canvas/BackgroundColorPicker.jsx`

**Purpose**: Canvas background & text color picker

**Props**:
```typescript
interface BackgroundColorPickerProps {
  extractedColors?: Array<{
    hex: string;
    rgb: number[];
    name: string;
    brightness: number;
  }>;
}
```

**Features**:
- Color input (hex)
- Color preview swatch
- Quick color grid
- Recently used colors
- Apply to background button
- Apply to selected text button
- Bold/Italic text formatting

**Sections**:

#### 1. Color Selector
```jsx
<input 
  type="text" 
  value={selectedColor} 
  onChange={handleColorChange}
  placeholder="#FFFFFF"
  maxLength={7}
/>
```

#### 2. Quick Colors
```jsx
{extractedColors.map(color => (
  <div 
    key={color.hex}
    onClick={() => setSelectedColor(color.hex)}
    style={{ backgroundColor: color.hex }}
  />
))}
```

#### 3. Recent Colors (from database)
```jsx
{recentColors.map(color => (
  <div style={{ backgroundColor: color.hex }} />
))}
```

#### 4. Text Formatting
```jsx
<button onClick={handleToggleBold}>Bold</button>
<button onClick={handleToggleItalic}>Italic</button>
```

---

## AI Components

### LayoutSuggestions

**Location**: `src/components/AI/LayoutSuggestions.jsx`

**Purpose**: GPT-4 Vision layout suggestions

**Props**: None

**Form Fields**:
```typescript
interface LayoutForm {
  productImageUrl: string;
  category: 'beverages' | 'food' | 'beauty' | 'electronics' | 'fashion' | 'home' | 'sports' | 'toys';
  style: 'modern' | 'minimal' | 'vibrant' | 'elegant' | 'playful' | 'professional' | 'bold' | 'clean';
}
```

**API Integration**:
```javascript
POST /api/ai/suggest-layouts
{
  "productImageUrl": "https://...",
  "category": "beverages",
  "style": "modern",
  "userId": 1
}
```

**Layout Structure**:
```typescript
interface Layout {
  name: string;
  description: string;
  rationale: string;
  elements: {
    product: { x: number, y: number, width: number, height: number };
    headline: { x: number, y: number, fontSize: number, align: string };
    logo?: { x: number, y: number, width: number, height: number };
  };
}
```

**Apply Logic**:
- Finds existing product image on canvas
- Moves to suggested position
- Adds text if specified
- Adds logo placeholder if specified

---

### CopySuggestions

**Location**: `src/components/AI/CopySuggestions.jsx`

**Purpose**: AI copywriting with Claude Sonnet 4.5

**Props**: None

**Form Fields**:
```typescript
interface CopyForm {
  productName: string;      // Required
  category: string;         // Dropdown
  features: string;         // Comma-separated
  style: 'energetic' | 'elegant' | 'minimal' | 'playful' | 'professional';
}
```

**API Integration**:
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

**Copy Structure**:
```typescript
interface CopySuggestion {
  headline: string;
  subhead: string;
  rationale: string;
  complianceNotes: string;
}
```

**Actions**:
```jsx
<button onClick={() => handleAddToCanvas(suggestion, true)}>
  Add Headline
</button>
<button onClick={() => handleAddToCanvas(suggestion, false)}>
  Add Subhead
</button>
<button onClick={() => handleCopyText(suggestion.headline)}>
  Copy
</button>
```

---

### BackgroundGenerator

**Location**: `src/components/AI/BackgroundGenerator.jsx`

**Purpose**: AI background generation with Stable Diffusion

**Props**: None

**Form Fields**:
```typescript
interface BackgroundForm {
  prompt: string;
  style: 'professional' | 'modern' | 'minimal' | 'vibrant' | 'abstract' | 'gradient' | 'textured';
  width: 1080;
  height: 1080;
}
```

**API Integration**:
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
```jsx
<button onClick={() => handleApplyAsBackground(image)}>
  Set as Background
</button>
<button onClick={() => handleAddToCanvas(image)}>
  Add to Canvas
</button>
<button onClick={() => handleDownload(image)}>
  Download
</button>
```

**Gallery**:
```jsx
{generatedImages.map(image => (
  <div className="gallery-card">
    <img src={image.url} />
    <div className="card-info">
      <p>{image.prompt}</p>
      <span>{image.style}</span>
      <span>{image.metadata.file_size_kb}KB</span>
    </div>
  </div>
))}
```

---

### SmartAssistant

**Location**: `src/components/AI/SmartAssistant.jsx`

**Purpose**: Multi-step AI orchestration

**Props**: None

**Input**:
```typescript
interface AssistantInput {
  text: string;  // Natural language prompt
}
```

**Example Prompts**:
- "Sports LEP ad for cricket bat with Rs 499 price"
- "Premium beverage ad exclusive to Tesco"
- "Beauty product with warm gradient background"

**Detection Logic**:
```javascript
const detectCategory = (prompt) => {
  if (prompt.match(/\b(sport|athletic|fitness)\b/)) return 'sports';
  if (prompt.match(/\b(beverage|drink|juice)\b/)) return 'beverage';
  // ...
};

const detectLEP = (prompt) => 
  prompt.includes('lep') || prompt.includes('low price');

const detectExclusive = (prompt) => 
  prompt.includes('exclusive');

const extractPrice = (prompt) => {
  const match = prompt.match(/(?:Rs|₹)\s*(\d+(?:,\d+)*)/i);
  return match ? `Rs ${match[1]}` : null;
};
```

**Processing Steps**:
1. **Analyze** → Extract category, LEP flag, price
2. **Generate Copy** → Claude Sonnet 4.5
3. **Generate Background** (if non-LEP) → Stable Diffusion
4. **Build Layout** → Position elements with correct styling

**LEP Mode**:
- All text left-aligned
- "LEP" text in Tesco blue (#00539F) to the right of ALL packshots
- White background
- No shadows

**Non-LEP Mode**:
- Centered text with shadows
- Logo at top-left
- Gradient/AI background
- Single-line tagline

---

## Upload Components

### ImageUpload

**Location**: `src/components/Upload/ImageUpload.jsx`

**Purpose**: File upload with categorization

**Props**:
```typescript
interface ImageUploadProps {
  onUploadComplete: (data: UploadData) => void;
  imageType: 'packshot' | 'logo' | 'background' | 'decorative';
  maxUploads: number | null;  // null = unlimited
}
```

**Features**:
- Drag & drop support
- File type validation (image/*)
- File size validation (max 10MB)
- Preview generation
- Base64 conversion
- LocalStorage persistence
- Lead packshot detection (first packshot)

**Upload Process**:
1. User selects/drops files
2. Validate file type & size
3. Generate preview (URL.createObjectURL)
4. Convert to base64
5. Save to localStorage
6. Trigger `onUploadComplete` callback

**Counter Display** (packshots only):
```jsx
{imageType === 'packshot' && maxUploads && (
  <div>
    {uploadCount}/{maxUploads} packshots used
  </div>
)}
```

---

### ImageLibrary

**Location**: `src/components/Upload/ImageLibrary.jsx`

**Purpose**: View and manage uploaded images

**Props**:
```typescript
interface ImageLibraryProps {
  onSelectImage: (image: UploadData) => void;
}
```

**Features**:
- Grid layout (2 columns)
- Grouped by type (packshots, logos, backgrounds, decorative)
- Lead badge on first packshot
- Type badges (color-coded)
- Click to add to canvas
- Hover actions (Add, Delete)
- Clear all button

**Image Card Structure**:
```jsx
<div className="image-card" onClick={() => onSelectImage(image)}>
  {/* Type & Lead Badges */}
  <div className="badge packshot">PACKSHOT</div>
  {isLead && <div className="badge lead">LEAD</div>}
  
  {/* Image */}
  <img src={image.url} />
  
  {/* Filename */}
  <div className="filename">{image.filename}</div>
  
  {/* Hover Overlay */}
  <div className="overlay">
    <button onClick={handleAdd}>Add</button>
    <button onClick={handleDelete}>Delete</button>
  </div>
</div>
```

---

### UploadZone

**Location**: `src/components/Upload/UploadZone.jsx`

**Purpose**: Drag & drop upload zone

**Props**:
```typescript
interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  accept?: string;        // Default: 'image/*'
  maxSize?: number;       // Default: 10 (MB)
  disabled?: boolean;     // Default: false
}
```

**States**:
- Default: Gray dashed border
- Dragging: Blue border, blue background
- Disabled: Gray, low opacity

**Validation**:
```javascript
const handleFiles = (files) => {
  const validFiles = files.filter(file => {
    // Check type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image`);
      return false;
    }
    
    // Check size
    if (file.size / (1024 * 1024) > maxSize) {
      alert(`${file.name} exceeds ${maxSize}MB`);
      return false;
    }
    
    return true;
  });
  
  onUpload(validFiles);
};
```

---

### FilePreview

**Location**: `src/components/Upload/FilePreview.jsx`

**Purpose**: Preview uploaded file with status

**Props**:
```typescript
interface FilePreviewProps {
  file: File;
  preview: string;        // Blob URL
  status: 'uploading' | 'success' | 'error';
  onRemove: () => void;
  isLead?: boolean;       // Show LEAD badge
}
```

**Status Colors**:
- Uploading: Blue border, blue background
- Success: Green border, green background
- Error: Red border, red background

**Structure**:
```jsx
<div className={`preview ${status}`}>
  {isLead && <div className="lead-badge">LEAD</div>}
  <img src={preview} />
  <div className="info">
    <p>{file.name}</p>
    <p>{(file.size / 1024).toFixed(1)} KB</p>
  </div>
  {status === 'uploading' && <Loader />}
  {status === 'success' && <Check />}
  {status === 'error' && <X />}
  {status !== 'uploading' && (
    <button onClick={onRemove}><X /></button>
  )}
</div>
```

---

### ValueTileSelector

**Location**: `src/components/Upload/ValueTileSelector.jsx`

**Purpose**: Add Tesco value tiles to canvas

**Props**:
```typescript
interface ValueTileSelectorProps {
  onAddTile: (tileData: TileData) => void;
}
```

**Tile Types**:

#### 1. Tesco Brand Tile
```typescript
{
  id: 'new',
  name: 'Tesco Brand Tile',
  description: 'Shows "Tesco" logo, predefined',
  color: 'transparent',  // Uses canvas background
  textColor: '#00539F',
  editable: false
}
```

#### 2. White Value Tile
```typescript
{
  id: 'white',
  name: 'White Value Tile',
  description: 'Only price can be edited',
  color: 'white',
  textColor: '#00539F',
  editable: true,
  fields: ['price']
}
```
- Input: Price (e.g., "2.99")
- Display: "£2.99"

#### 3. Clubcard Price Tile
```typescript
{
  id: 'clubcard',
  name: 'Clubcard Price',
  description: 'Offer, regular price & end date',
  color: '#00539F',
  textColor: 'white',
  editable: true,
  fields: ['offerPrice', 'regularPrice', 'endDate']
}
```
- Inputs:
  - Offer Price (e.g., "1.99")
  - Regular Price (e.g., "2.99")
  - End Date (DD/MM format, e.g., "23/06")
- Validation: DD/MM format, valid day/month

**Tile Behavior**:
- Positioned at top-right (20px margin)
- Locked (cannot move, resize, rotate)
- Excluded from layers panel
- Always on top (bringToFront)
- Properties: `isValueTile: true`, `excludeFromLayers: true`

---

## UI Components

### Sidebar

**Location**: `src/components/UI/Sidebar.jsx`

**Purpose**: Multi-tab sidebar for all tools

**Props**:
```typescript
interface SidebarProps {
  onAddToCanvas: (uploadData: UploadData) => void;
  onAddText: (textConfig: TextConfig) => void;
}
```

**Tabs** (3 rows × 3-4 cols):

#### Row 1
1. **Upload** - Packshots, Logos, Backgrounds, Decorative
2. **Text** - Add text elements
3. **Library** - View uploaded images
4. **Colors** - Background & text color picker

#### Row 2
5. **Layers** - Layer management
6. **Tiles** - Value tiles
7. **Layouts** - AI layout suggestions
8. **Copy** - AI copywriting

#### Row 3
9. **Gen BG** - AI background generation
10. **Assistant** - Smart assistant

**Tab Structure**:
```jsx
<button 
  className={`sidebar-tab ${activeTab === 'uploads' ? 'active' : ''}`}
  onClick={() => setActiveTab('uploads')}
>
  <Upload size={18} />
  <span>Upload</span>
</button>
```

---

### Tooltip

**Location**: `src/components/UI/Tooltip.jsx`

**Purpose**: Hover tooltips

**Props**:
```typescript
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}
```

**Usage**:
```jsx
<Tooltip text="Undo (Ctrl+Z)" position="bottom">
  <button onClick={handleUndo}>
    <Undo size={20} />
  </button>
</Tooltip>
```

---

### ErrorBoundary

**Location**: `src/components/UI/ErrorBoundary.jsx`

**Purpose**: Catch React errors

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
}
```

**Usage**:
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Error UI**:
```jsx
<div className="error-screen">
  <AlertTriangle size={32} />
  <h2>Something went wrong</h2>
  <p>{error.message}</p>
  <button onClick={handleReload}>
    <RefreshCw size={16} />
    Reload Application
  </button>
</div>
```

---

### OnboardingTutorial

**Location**: `src/components/UI/OnboardingTutorial.jsx`

**Purpose**: First-time user tutorial

**Props**:
```typescript
interface OnboardingTutorialProps {
  onComplete?: () => void;
}
```

**Steps** (8 total):
1. Welcome
2. Upload tab
3. Layouts tab
4. Copy tab
5. Validate tab
6. Export tab
7. Brand memory
8. Completion

**Features**:
- Skip tutorial button
- Previous/Next navigation
- Progress bar
- Tab highlighting
- Auto-shows on first visit
- LocalStorage flag: `retailforge_tutorial_completed`

---

### KeyboardShortcuts

**Location**: `src/components/UI/KeyboardShortcuts.jsx`

**Purpose**: Keyboard shortcuts help

**Shortcuts**:
```javascript
const shortcuts = [
  { category: 'General', items: [
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Deselect all / Close modal' }
  ]},
  { category: 'Canvas', items: [
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'C'], description: 'Copy' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
    { keys: ['Del'], description: 'Delete' }
  ]},
  // ...
];
```

**UI**: 
- Floating button (bottom-right, purple)
- Modal with categorized shortcuts
- Keyboard badge styles

---

### ColorPalette

**Location**: `src/components/UI/ColorPalette.jsx`

**Purpose**: Display extracted colors

**Props**:
```typescript
interface ColorPaletteProps {
  colors: Array<{
    hex: string;
    rgb: number[];
    name: string;
    brightness: number;
  }>;
  onSelectColor?: (color: object) => void;
  selectedColor?: string;
  title?: string;
}
```

**Display**:
- Grid layout (5 columns)
- Color swatch with hex code
- Color name
- Click to select
- Selected indicator (checkmark)

---

### BrandKitPanel

**Location**: `src/components/UI/BrandKitPanel.jsx`

**Purpose**: Save and load brand kits

**Kit Structure**:
```typescript
interface BrandKit {
  id: string;
  name: string;
  logoUrl: string;
  colors: string[];       // Hex codes
  fonts: string[];        // Font families
  preferences: {
    lastUsed: string;
    canvasSize: { width: number, height: number };
  };
  createdAt: string;
  lastUsed: string;
}
```

**Features**:
- Create kit from current canvas
- Load kit (applies colors to canvas)
- Delete kit
- Show last used date
- Sort by recent usage
- LocalStorage persistence

---

## Validation Components

### ValidationPanel

**Location**: `src/components/Validation/ValidationPanel.jsx`

**Purpose**: Real-time compliance validation

**Props**: None

**Features**:
- Auto-validation toggle
- Manual validation button
- Debounced checks (1.5s)
- Score display (0-100)
- Violation cards (expandable)
- Warning cards
- Auto-fix buttons
- Highlight affected elements

**Violation Card**:
```jsx
<div className={`violation-card ${severity}`}>
  <div className="header" onClick={toggleExpand}>
    <AlertCircle />
    <div>
      <h5>{violation.ruleName}</h5>
      <p>{violation.message}</p>
    </div>
    <button>{expanded ? '−' : '+'}</button>
  </div>
  
  {expanded && (
    <div className="details">
      {/* Suggestion */}
      <div className="suggestion">
        <Lightbulb />
        <span>{violation.suggestion}</span>
      </div>
      
      {/* Actions */}
      <button onClick={highlightViolation}>Highlight</button>
      <button onClick={applyFix}>Auto-Fix</button>
      
      {/* Affected Elements */}
      <div className="affected">
        <p>Affected elements:</p>
        <ul>
          {violation.affectedElements.map(el => (
            <li>{el.element}</li>
          ))}
        </ul>
      </div>
    </div>
  )}
</div>
```

**Auto-Fix Logic**:
```javascript
// Font size fix
const applyFontSizeFix = (violation) => {
  violation.affectedElements.forEach(el => {
    const obj = canvas.getObjects()[el.index];
    obj.set({ fontSize: el.minimumSize || 20 });
  });
  canvas.renderAll();
  saveState();
};

// Contrast fix
const applyContrastFix = (violation) => {
  const bgBrightness = getColorBrightness(canvas.backgroundColor);
  const newColor = bgBrightness > 128 ? '#000000' : '#ffffff';
  
  violation.affectedElements.forEach(el => {
    const obj = canvas.getObjects()[el.index];
    obj.set({ fill: newColor });
  });
  canvas.renderAll();
  saveState();
};
```

---

## Export Components

### ExportPanel

**Location**: `src/components/Export/ExportPanel.jsx`

**Purpose**: Multi-format export

**Props**: None

**Format Selection**:
```jsx
{AVAILABLE_FORMATS.map(fmt => (
  <div 
    className={`format-card ${selected ? 'selected' : ''}`}
    onClick={() => toggleFormat(fmt.id)}
  >
    <div className="checkbox">
      {selected && <Check />}
    </div>
    <div>
      <p>{fmt.name}</p>
      <p>{fmt.dims}</p>
    </div>
  </div>
))}
```

**Export Process**:
```javascript
const handleExport = async () => {
  // 1. Get canvas as PNG
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: 2,
    quality: 1
  });
  
  // 2. Convert to Blob
  const blob = await fetch(dataUrl).then(r => r.blob());
  
  // 3. Prepare FormData
  const formData = new FormData();
  formData.append('image', blob, 'master.png');
  formData.append('formats', JSON.stringify(selectedFormats));
  formData.append('complianceData', JSON.stringify(complianceData));
  
  // 4. Send to backend
  const response = await fetch('/api/export', {
    method: 'POST',
    body: formData,
  });
  
  // 5. Download ZIP
  const zipBlob = await response.blob();
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `retail_forge_assets_${Date.now()}.zip`;
  link.click();
};
```

---

## Utility Functions

### imageOptimizer.js

```javascript
export async function optimizeImageForCanvas(imageUrl, maxSize = 2000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (img.width <= maxSize && img.height <= maxSize) {
        resolve(imageUrl);
        return;
      }
      
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      const newWidth = Math.floor(img.width * scale);
      const newHeight = Math.floor(img.height * scale);
      
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
}
```

---

### valueTileUtils.js

```javascript
export function addValueTileToCanvas(canvas, tileData) {
  // Remove existing tile
  const existing = canvas.getObjects().find(obj => obj.isValueTile);
  if (existing) canvas.remove(existing);
  
  // Create tile group
  let tileGroup;
  switch (tileData.type) {
    case 'new': tileGroup = createNewTile(tileData); break;
    case 'white': tileGroup = createWhiteTile(tileData); break;
    case 'clubcard': tileGroup = createClubcardTile(tileData); break;
  }
  
  // Position at top-right
  const margin = 20;
  tileGroup.set({
    left: canvas.width - tileGroup.width - margin,
    top: margin,
    selectable: false,
    evented: false,
    isValueTile: true,
    excludeFromLayers: true
  });
  
  canvas.add(tileGroup);
  canvas.bringToFront(tileGroup);
  return tileGroup;
}
```

---

**End of Component Reference**

For more details, see the main [Frontend README](./FRONTEND_README.md)