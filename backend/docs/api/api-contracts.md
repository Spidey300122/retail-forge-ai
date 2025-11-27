# API Contracts - Retail Forge AI

## Service Communication

### Frontend ↔ API Gateway (Node.js)

#### 1. Upload Image
```http
POST /api/upload
Content-Type: multipart/form-data

Request:
{
  image: File,
  type: "product" | "logo" | "background"
}

Response:
{
  success: true,
  data: {
    imageId: "img_abc123",
    url: "https://s3.../image.jpg",
    width: 1920,
    height: 1080,
    sizeKB: 845
  }
}
```

#### 2. Remove Background
```http
POST /api/remove-background
Content-Type: application/json

Request:
{
  imageId: "img_abc123"
}

Response:
{
  success: true,
  data: {
    processedImageId: "img_def456",
    url: "https://s3.../image-nobg.png",
    processingTimeMs: 2300
  }
}
```

#### 3. Extract Colors
```http
POST /api/extract-colors
Content-Type: application/json

Request:
{
  imageId: "img_abc123",
  count: 5
}

Response:
{
  success: true,
  data: {
    colors: [
      { hex: "#FF5733", rgb: [255, 87, 51], usage: "dominant" },
      { hex: "#3498DB", rgb: [52, 152, 219], usage: "accent" }
    ]
  }
}
```

#### 4. Suggest Layouts
```http
POST /api/suggest-layouts
Content-Type: application/json

Request:
{
  productImageId: "img_abc123",
  category: "beverages",
  style: "modern",
  context: {
    brandColors: ["#FF5733"],
    targetFormat: "instagram_post"
  }
}

Response:
{
  success: true,
  data: {
    suggestions: [
      {
        layoutId: "layout_001",
        thumbnail: "https://...",
        name: "Bold Product Focus",
        description: "Large product with minimal text",
        confidence: 0.92,
        elements: {
          product: { x: 540, y: 540, width: 400, height: 400 },
          headline: { x: 100, y: 900, fontSize: 48 },
          logo: { x: 900, y: 100, width: 80, height: 80 }
        }
      }
    ],
    reasoning: "Modern style works well with beverages..."
  }
}
```

#### 5. Generate Copy
```http
POST /api/generate-copy
Content-Type: application/json

Request:
{
  productInfo: {
    name: "Fresh Orange Juice",
    category: "beverages",
    features: ["100% natural", "No sugar added"]
  },
  style: "energetic",
  length: "short"
}

Response:
{
  success: true,
  data: {
    suggestions: [
      {
        headline: "Pure Natural Energy",
        subhead: "Fresh-squeezed goodness in every sip",
        confidence: 0.88
      },
      {
        headline: "Start Your Day Fresh",
        subhead: "100% natural orange juice",
        confidence: 0.85
      }
    ]
  }
}
```

#### 6. Validate Compliance
```http
POST /api/validate
Content-Type: application/json

Request:
{
  creative: {
    elements: [
      {
        type: "text",
        content: "Limited Time Offer",
        fontSize: 22,
        position: { x: 100, y: 100 }
      },
      {
        type: "image",
        imageId: "img_abc123",
        position: { x: 200, y: 200 }
      }
    ],
    format: "instagram_post",
    category: "beverages",
    isAlcohol: false
  }
}

Response:
{
  success: true,
  data: {
    isCompliant: true,
    violations: [],
    warnings: [
      {
        ruleId: "font_size_recommendation",
        severity: "warning",
        message: "Consider 24px for better readability",
        element: "text_0",
        suggestion: {
          action: "increase_font",
          value: 24
        }
      }
    ],
    score: 95
  }
}
```

#### 7. Export Creative
```http
POST /api/export
Content-Type: application/json

Request:
{
  creativeData: {
    canvasJSON: {...},  // Fabric.js canvas JSON
    elements: [...]
  },
  formats: ["instagram_post", "facebook_feed", "instagram_story"],
  quality: "high"
}

Response:
{
  success: true,
  data: {
    exports: [
      {
        format: "instagram_post",
        url: "https://s3.../export_ig.jpg",
        dimensions: { width: 1080, height: 1080 },
        sizeKB: 487
      }
    ],
    complianceReportUrl: "https://s3.../report.pdf",
    zipUrl: "https://s3.../all_formats.zip"
  }
}
```

### API Gateway ↔ Python Services

#### Image Service (FastAPI - Port 8000)
```python
# POST /process/remove-background
{
  "image_path": "s3://bucket/image.jpg"
}
→
{
  "processed_path": "s3://bucket/image-nobg.png",
  "mask_path": "s3://bucket/mask.png"
}

# POST /process/extract-colors
{
  "image_path": "s3://bucket/logo.jpg",
  "count": 5
}
→
{
  "colors": [
    {"hex": "#FF5733", "rgb": [255, 87, 51]}
  ]
}

# POST /process/optimize
{
  "image_path": "s3://bucket/image.jpg",
  "target_size_kb": 500,
  "format": "jpeg"
}
→
{
  "optimized_path": "s3://bucket/image-opt.jpg",
  "size_kb": 487,
  "quality": 85
}
```

#### AI Orchestrator (Python - Port 8001)
```python
# POST /ai/suggest-layouts
{
  "product_image_url": "https://...",
  "category": "beverages",
  "style": "modern"
}
→
{
  "layouts": [...]
}

# POST /ai/generate-copy
{
  "product_info": {...},
  "style": "energetic"
}
→
{
  "suggestions": [...]
}

# POST /ai/validate-compliance
{
  "creative_data": {...}
}
→
{
  "violations": [],
  "warnings": []
}
```

## Error Handling

All endpoints follow this error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {},
    "timestamp": "2025-11-27T10:30:00Z"
  }
}
```

### Error Codes

- `INVALID_REQUEST`: Malformed request
- `IMAGE_TOO_LARGE`: File exceeds size limit
- `PROCESSING_FAILED`: Server-side processing error
- `API_RATE_LIMIT`: Too many requests
- `EXTERNAL_API_ERROR`: Third-party API failure
- `VALIDATION_FAILED`: Compliance validation found issues

## Response Times (Target SLAs)

- Image upload: < 2s
- Background removal: < 5s
- Color extraction: < 1s
- Layout suggestions: < 3s
- Copy generation: < 2s
- Compliance validation: < 500ms
- Export (single format): < 3s