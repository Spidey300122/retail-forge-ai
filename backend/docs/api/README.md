# API Documentation

Complete reference for Retail Forge AI REST API.

## Base URLs

```
Development: http://localhost:3000/api
Production: https://api.retailforge.ai/v1
```

## Authentication

Currently using demo mode. Production will require:

```http
Authorization: Bearer YOUR_API_KEY
```

## Rate Limits

- Free tier: 100 requests per 15 minutes
- Paid tier: 1000 requests per 15 minutes

## Endpoints Overview

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| Upload | `/upload` | POST | Upload images |
| AI | `/ai/suggest-layouts` | POST | Get layout suggestions |
| AI | `/ai/generate-copy` | POST | Generate copy variations |
| Image | `/image/remove-background` | POST | Remove background |
| Image | `/image/extract-colors` | POST | Extract color palette |
| Image | `/image/generate-background` | POST | Generate AI background |
| Validate | `/validate/creative` | POST | Validate compliance |
| Validate | `/validate/rules` | GET | Get all rules |
| Export | `/export` | POST | Export creative package |
| Orchestrator | `/orchestrator/process` | POST | Multi-agent processing |
| Color | `/color/palette` | POST | Save color palette |
| Color | `/color/palettes` | GET | Get user palettes |

## Detailed Endpoints

### 1. Upload Image

Upload product images, logos, or backgrounds.

```http
POST /api/upload
Content-Type: multipart/form-data

Request:
- image: File (required) - max 10MB, jpg/png/webp
- type: String - "product" | "logo" | "background"
- userId: Number (optional)

Response 200:
{
  "success": true,
  "data": {
    "imageId": "img_abc123",
    "url": "https://s3.../image.jpg",
    "filename": "product.jpg",
    "size": 2048000,
    "type": "product"
  }
}

Errors:
400: File too large or invalid format
500: Upload failed
```

**Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@product.jpg" \
  -F "type=product"
```

---

### 2. Suggest Layouts

Get AI-powered layout suggestions using GPT-4 Vision.

```http
POST /api/ai/suggest-layouts
Content-Type: application/json

Request:
{
  "productImageUrl": "https://...",  // required
  "category": "beverages",           // required
  "style": "modern",                 // optional: modern|minimal|vibrant|elegant
  "userId": 1                        // optional
}

Response 200:
{
  "success": true,
  "data": {
    "suggestions": {
      "layouts": [
        {
          "name": "Bold Product Focus",
          "description": "Large centered product with minimal text",
          "rationale": "Works well for visually striking products",
          "elements": {
            "product": { "x": 540, "y": 540, "width": 600, "height": 600 },
            "headline": { "x": 540, "y": 900, "fontSize": 48, "align": "center" },
            "logo": { "x": 100, "y": 100, "width": 120, "height": 120 }
          }
        },
        {
          "name": "Split Screen Modern",
          "description": "Product on left, text on right",
          "rationale": "Creates visual balance and emphasizes both elements",
          "elements": {
            "product": { "x": 270, "y": 540, "width": 500, "height": 500 },
            "headline": { "x": 810, "y": 400, "fontSize": 42, "align": "left" },
            "subhead": { "x": 810, "y": 500, "fontSize": 24, "align": "left" },
            "logo": { "x": 900, "y": 100, "width": 100, "height": 100 }
          }
        }
      ]
    },
    "processingTimeMs": 2341
  }
}

Errors:
400: Missing required fields
500: AI service error
503: OpenAI API unavailable
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/api/ai/suggest-layouts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productImageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
    category: 'beverages',
    style: 'modern'
  })
});

const data = await response.json();
console.log(data.data.suggestions.layouts);
```

---

### 3. Generate Copy

Generate compliant advertising copy using Claude AI.

```http
POST /api/ai/generate-copy
Content-Type: application/json

Request:
{
  "productInfo": {
    "name": "Fresh Orange Juice",      // required
    "category": "beverages",           // required
    "features": ["100% natural"],      // optional
    "audience": "health-conscious"     // optional
  },
  "style": "energetic"                 // optional
}

Styles:
- energetic: Exciting, dynamic, high-energy
- elegant: Sophisticated, refined, premium
- minimal: Simple, clean, direct
- playful: Fun, lighthearted, casual
- professional: Confident, trustworthy

Categories:
- beverages: Drinks, juices, beverages
- food: Snacks, meals, groceries
- beauty: Cosmetics, skincare, personal care
- electronics: Tech products, gadgets
- fashion: Clothing, accessories
- home: Furniture, decor, kitchenware

Response 200:
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "headline": "Pure Energy in Every Sip",
        "subhead": "100% natural orange juice with no added sugar",
        "rationale": "Emphasizes purity and natural benefits",
        "complianceNotes": "No health claims, factual features only",
        "style": "energetic",
        "category": "beverages"
      },
      {
        "headline": "Refresh Your Day Naturally",
        "subhead": "Fresh-squeezed goodness you can taste",
        "rationale": "Focuses on freshness and sensory appeal",
        "complianceNotes": "Avoids unsubstantiated claims",
        "style": "energetic",
        "category": "beverages"
      },
      {
        "headline": "Nature's Best in a Bottle",
        "subhead": "Pure orange juice, nothing else",
        "rationale": "Simple messaging highlighting natural ingredients",
        "complianceNotes": "Factual, no prohibited language",
        "style": "energetic",
        "category": "beverages"
      }
    ],
    "processingTimeMs": 1823
  }
}

Compliance Rules Applied:
- No T&Cs language
- No competition mentions
- No unsubstantiated claims
- No green/sustainability claims
- Headlines under 50 characters
- No price callouts
- No money-back guarantees
```

**Example (Python):**
```python
import requests

response = requests.post('http://localhost:3000/api/ai/generate-copy', json={
    'productInfo': {
        'name': 'Fresh Orange Juice',
        'category': 'beverages',
        'features': ['100% natural', 'No sugar added']
    },
    'style': 'energetic'
})

data = response.json()
for suggestion in data['data']['suggestions']:
    print(f"Headline: {suggestion['headline']}")
    print(f"Subhead: {suggestion['subhead']}\n")
```

---

### 4. Validate Creative

Validate creative against all compliance rules (30+ rules).

```http
POST /api/validate/creative
Content-Type: application/json

Request:
{
  "creativeData": {
    "format": "instagram_post",        // required
    "backgroundColor": "#ffffff",
    "text": "Fresh and delicious",     // optional: main text content
    "headline": "Fresh Juice",         // optional
    "subhead": "100% Natural",         // optional
    "category": "beverages",           // optional
    "isAlcohol": false,               // optional
    "elements": [
      {
        "type": "text",
        "content": "Fresh and delicious",
        "fontSize": 32,
        "fill": "#000000",
        "left": 100,
        "top": 100,
        "width": 300,
        "height": 40
      },
      {
        "type": "image",
        "isPackshot": true,
        "left": 400,
        "top": 400,
        "width": 300,
        "height": 300
      }
    ],
    "valueTile": {
      "type": "white",              // white|new|clubcard
      "x": 100,
      "y": 100,
      "width": 150,
      "height": 80,
      "titleFontSize": 16,
      "priceFontSize": 36
    },
    "cta": {
      "x": 540,
      "y": 950,
      "width": 200,
      "height": 48
    },
    "tag": {
      "text": "Only at Tesco",
      "fontSize": 12,
      "x": 540,
      "y": 1020
    },
    "drinkaware": {              // Required if isAlcohol: true
      "height": 20,
      "color": "#000000"
    }
  }
}

Response 200:
{
  "success": true,
  "data": {
    "isCompliant": true,
    "score": 95,
    "rulesChecked": 25,
    "rulesPassed": 24,
    "rulesFailed": 1,
    "violations": [],
    "warnings": [
      {
        "ruleId": "background_color",
        "ruleName": "Background Color Warning",
        "category": "design",
        "severity": "warning",
        "message": "Background too dark",
        "suggestion": "Consider using a lighter background",
        "metadata": {}
      }
    ],
    "rulesByCategory": {
      "content": { "passed": 8, "failed": 0 },
      "design": { "passed": 9, "failed": 1 },
      "layout": { "passed": 5, "failed": 0 },
      "tags": { "passed": 2, "failed": 0 }
    },
    "processingTimeMs": 342,
    "summary": "✓ Compliant with 1 minor suggestion(s)."
  }
}

Response 200 (Non-compliant):
{
  "success": true,
  "data": {
    "isCompliant": false,
    "score": 65,
    "violations": [
      {
        "ruleId": "no_tcs",
        "ruleName": "No Terms & Conditions",
        "category": "content",
        "severity": "hard_fail",
        "message": "Terms & Conditions are not allowed.",
        "suggestion": "Remove all T&C references.",
        "affectedElements": []
      },
      {
        "ruleId": "min_font_size",
        "ruleName": "Minimum Font Size",
        "category": "design",
        "severity": "hard_fail",
        "message": "1 text element(s) below minimum 20px",
        "suggestion": "Increase font size to at least 20px",
        "affectedElements": [
          {
            "element": "text_0",
            "currentSize": 12,
            "minimumSize": 20
          }
        ]
      }
    ],
    "warnings": [],
    "summary": "⚠️ Found 2 critical issue(s) that must be fixed."
  }
}

Errors:
400: Invalid creative data
500: Validation engine error
```

**Rule Categories:**

1. **Content Rules** (8 rules)
   - No T&Cs language
   - No competition mentions
   - No green claims
   - No charity mentions
   - No price callouts
   - No money-back guarantees
   - No unsubstantiated claims
   - BERT text classification

2. **Design Rules** (10 rules)
   - Minimum font size
   - WCAG contrast
   - Value tile position
   - No overlapping elements
   - Drinkaware for alcohol
   - Background color validation
   - CTA size requirements
   - Tag size/position
   - Value tile font sizing
   - LEP design requirements

3. **Layout Rules** (5 rules)
   - Packshot spacing
   - Social safe zones
   - CTA positioning
   - Element hierarchy
   - Maximum 3 packshots

4. **Tag Rules** (2 rules)
   - Approved tags only
   - Clubcard date format

5. **Media Rules** (2 rules)
   - Photography of people
   - Image quality

---

### 5. Get All Rules

Retrieve all available compliance rules.

```http
GET /api/validate/rules

Response 200:
{
  "success": true,
  "data": {
    "rules": [
      {
        "ruleId": "bert_text_classification",
        "name": "AI Text Classification",
        "category": "content",
        "severity": "hard_fail"
      },
      {
        "ruleId": "min_font_size",
        "name": "Minimum Font Size",
        "category": "design",
        "severity": "hard_fail"
      }
      // ... all 27 rules
    ],
    "totalRules": 27
  }
}
```

---

### 6. Remove Background

Remove background from images using AI (rembg).

```http
POST /api/image/remove-background
Content-Type: multipart/form-data

Request:
- file: File (required)
- method: String - "fast" | "standard" (default: "fast")

Response 200:
{
  "success": true,
  "data": {
    "file_id": "abc123",
    "output_filename": "abc123_nobg.png",
    "downloadUrl": "http://localhost:8000/process/download/abc123_nobg.png",
    "metadata": {
      "dimensions": { "width": 1080, "height": 1080 },
      "method": "rembg",
      "processing_time_seconds": 2.3
    },
    "processingTimeMs": 2341
  }
}

Errors:
400: File too large (max 10MB)
500: Processing failed
503: Image service unavailable
```

---

### 7. Extract Colors

Extract dominant colors from images.

```http
POST /api/image/extract-colors
Content-Type: multipart/form-data

Request:
- file: File (required)
- count: Number (default: 5, max: 10)

Response 200:
{
  "success": true,
  "colors": [
    {
      "hex": "#FF5733",
      "rgb": [255, 87, 51],
      "name": "Orange",
      "usage": "dominant",
      "percentage": 45.2,
      "brightness": 138.5,
      "frequency": 524288
    },
    {
      "hex": "#3498DB",
      "rgb": [52, 152, 219],
      "name": "Blue",
      "usage": "primary",
      "percentage": 28.7,
      "brightness": 142.3,
      "frequency": 334592
    }
  ],
  "total_pixels": 1166400
}
```

---

### 8. Generate Background

Generate AI-powered backgrounds using Stable Diffusion.

```http
POST /api/image/generate-background
Content-Type: application/json

Request:
{
  "prompt": "modern gradient background for tech product",
  "style": "professional",  // professional|modern|minimal|vibrant|abstract|gradient|textured
  "width": 1080,            // optional, default: 1024
  "height": 1080            // optional, default: 1024
}

Styles:
- professional: Clean, corporate, professional lighting
- modern: Contemporary, sleek, minimalist
- minimal: Simple, clean background, subtle
- vibrant: Vibrant colors, energetic, bold
- abstract: Abstract art, creative, artistic
- gradient: Smooth gradient, color blend
- textured: Subtle texture, depth

Response 200:
{
  "success": true,
  "data": {
    "file_id": "bg_xyz789",
    "output_filename": "bg_xyz789_background.jpg",
    "download_url": "/process/download/bg_xyz789_background.jpg",
    "metadata": {
      "prompt": "modern gradient background for tech product",
      "enhanced_prompt": "modern gradient..., 4k, ultra detailed, professional quality...",
      "style": "professional",
      "dimensions": { "width": 1080, "height": 1080 },
      "processing_time_seconds": 12.4,
      "file_size_kb": 487.3
    }
  }
}

Errors:
400: Invalid parameters
500: Generation failed
503: Stability AI service unavailable
```

**Note:** Background generation takes 10-15 seconds. The AI automatically:
- Enhances prompts for better results
- Applies style-specific optimizations
- Optimizes output to <500KB
- Converts to JPEG for efficiency

---

### 9. Export Creative

Export creative in multiple formats with compliance report.

```http
POST /api/export
Content-Type: multipart/form-data

Request:
- image: File (required) - Canvas screenshot
- formats: JSON String - ["instagram_post", "facebook_feed"]
- complianceData: JSON String - Validation results
- canvasSize: String (optional) - "1080x1080"

Example:
const formData = new FormData();
formData.append('image', canvasBlob);
formData.append('formats', JSON.stringify(['instagram_post', 'facebook_feed']));
formData.append('complianceData', JSON.stringify(validationResult));

Response 200: ZIP file

ZIP Contents:
  - creative.png           # High quality original (100% quality)
  - creative.jpg           # Compressed version (90% quality)
  - Instagram_Post.jpg     # 1080x1080, <500KB
  - Facebook_Feed.jpg      # 1200x628, <500KB
  - compliance_report.pdf  # Detailed compliance report
  - metadata.json          # Export metadata

Format Options:
- instagram_post: 1080x1080
- facebook_feed: 1200x628
- instagram_story: 1080x1920
- instore_display: 1920x1080

Errors:
400: No image provided
500: Export processing failed
```

**Compliance Report includes:**
- Pass/Fail status with visual indicator
- Overall compliance score
- List of all violations with suggestions
- List of warnings
- Rules passed/failed breakdown
- Timestamp and page numbers

---

### 10. Orchestrator Process

Multi-agent AI processing for complex requests.

```http
POST /api/orchestrator/process
Content-Type: application/json

Request:
{
  "userInput": "Create modern layout with energetic copy",
  "productImageUrl": "https://...",
  "productInfo": {
    "name": "Orange Juice",
    "category": "beverages",
    "features": ["100% natural"]
  },
  "creativeData": { ... }  // optional, for validation
}

Response 200:
{
  "success": true,
  "data": {
    "intent": {
      "needsLayout": true,
      "needsCopy": true,
      "needsCompliance": false,
      "needsBackground": false,
      "category": "beverages",
      "style": "modern"
    },
    "layouts": [
      {
        "name": "Bold Product Focus",
        "description": "...",
        "elements": {...}
      }
    ],
    "copy": [
      {
        "headline": "Pure Energy",
        "subhead": "...",
        "rationale": "..."
      }
    ],
    "validation": null,
    "recommendations": [
      {
        "type": "success",
        "message": "✨ Generated 3 layout options → Check 'Layouts' tab"
      },
      {
        "type": "success",
        "message": "✍️ Generated 3 copy variations → Check 'Copy' tab"
      }
    ],
    "processingTimeMs": 4523
  }
}
```

The orchestrator intelligently:
- Analyzes user intent
- Determines which AI agents to invoke
- Coordinates multiple agents in parallel
- Provides actionable recommendations
- Handles errors gracefully

---

### 11. Save Color Palette

Save extracted color palette for a user.

```http
POST /api/color/palette
Content-Type: application/json

Request:
{
  "userId": 1,
  "imageId": "img_abc123",
  "colors": [
    {
      "hex": "#FF5733",
      "rgb": [255, 87, 51],
      "name": "Orange",
      "usage": "dominant"
    }
  ]
}

Response 200:
{
  "success": true,
  "data": {
    "id": 42,
    "user_id": 1,
    "image_id": "img_abc123",
    "colors": [...],
    "extracted_at": "2025-12-26T10:30:00Z"
  }
}
```

---

### 12. Get User Palettes

Retrieve user's saved color palettes.

```http
GET /api/color/palettes?userId=1&limit=10

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 42,
      "colors": [...],
      "extracted_at": "2025-12-26T10:30:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints use consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `INVALID_REQUEST` | 400 | Malformed request data |
| `IMAGE_TOO_LARGE` | 400 | File exceeds 10MB limit |
| `INVALID_FILE_TYPE` | 400 | Only jpg/png/webp allowed |
| `PROCESSING_FAILED` | 500 | Server-side processing error |
| `API_RATE_LIMIT` | 429 | Too many requests |
| `EXTERNAL_API_ERROR` | 503 | Third-party API failure |
| `VALIDATION_FAILED` | 200 | Compliance check found issues (success:true) |

---

## Response Times (Target SLAs)

| Operation | Target | Typical |
|-----------|--------|---------|
| Image upload | < 2s | ~500ms |
| Background removal | < 5s | ~2-3s |
| Color extraction | < 1s | ~300ms |
| Layout suggestions | < 3s | ~2s |
| Copy generation | < 2s | ~1.5s |
| Compliance validation | < 500ms | ~300ms |
| Background generation | < 15s | ~12s |
| Export (single format) | < 3s | ~2s |

---

## SDK Examples

### JavaScript/Node.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Generate copy
const { data } = await api.post('/ai/generate-copy', {
  productInfo: {
    name: 'Fresh Orange Juice',
    category: 'beverages',
    features: ['100% natural']
  },
  style: 'energetic'
});

console.log(data.data.suggestions[0].headline);

// Validate creative
const validation = await api.post('/validate/creative', {
  creativeData: {
    format: 'instagram_post',
    elements: [...]
  }
});

if (validation.data.data.isCompliant) {
  console.log('✅ Compliant!');
} else {
  console.log('❌ Issues:', validation.data.data.violations);
}
```

### Python

```python
import requests

API_BASE = 'http://localhost:3000/api'

# Validate creative
response = requests.post(
    f'{API_BASE}/validate/creative',
    json={'creativeData': {...}}
)

result = response.json()
print(f"Compliant: {result['data']['isCompliant']}")
print(f"Score: {result['data']['score']}/100")

# Generate copy
copy_response = requests.post(
    f'{API_BASE}/ai/generate-copy',
    json={
        'productInfo': {
            'name': 'Orange Juice',
            'category': 'beverages'
        },
        'style': 'energetic'
    }
)

suggestions = copy_response.json()['data']['suggestions']
for s in suggestions:
    print(f"Headline: {s['headline']}")
```

### cURL

```bash
# Upload image
curl -X POST http://localhost:3000/api/upload \
  -F "image=@product.jpg" \
  -F "type=product"

# Generate copy
curl -X POST http://localhost:3000/api/ai/generate-copy \
  -H "Content-Type: application/json" \
  -d '{
    "productInfo": {
      "name": "Orange Juice",
      "category": "beverages"
    },
    "style": "energetic"
  }'

# Validate
curl -X POST http://localhost:3000/api/validate/creative \
  -H "Content-Type: application/json" \
  -d '{
    "creativeData": {
      "format": "instagram_post",
      "elements": []
    }
  }'
```

---

## Webhooks (Coming Soon)

Subscribe to events:
- `creative.validated` - Compliance check completed
- `creative.exported` - Export ready for download
- `user.quota_exceeded` - Rate limit reached
- `background.generated` - AI background ready

---

## Support

For API issues:
- GitHub: [retail-forge-ai/issues](https://github.com/YOUR_USERNAME/retail-forge-ai/issues)
- Email: support@retailforge.ai
- Documentation: Full docs available in `/backend/docs/`