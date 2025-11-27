# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://api.retailforge.ai/v1
```

## Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Image Upload
```http
POST /api/upload-image
Content-Type: multipart/form-data

Body:
- image: File (jpeg, png, max 10MB)

Response:
{
  "imageId": "img_123abc",
  "url": "https://s3.../image.jpg",
  "width": 1920,
  "height": 1080
}
```

### Background Removal
```http
POST /api/remove-background
Content-Type: application/json

Body:
{
  "imageId": "img_123abc"
}

Response:
{
  "processedImageId": "img_456def",
  "url": "https://s3.../image-nobg.png",
  "processingTime": 2.3
}
```

### Layout Suggestions
```http
POST /api/suggest-layouts
Content-Type: application/json

Body:
{
  "productImage": "img_123abc",
  "category": "beverages",
  "style": "modern"
}

Response:
{
  "suggestions": [
    {
      "layoutId": "layout_1",
      "thumbnail": "https://...",
      "description": "Bold product-centric design",
      "elements": {...}
    }
  ]
}
```

### Compliance Validation
```http
POST /api/validate-compliance
Content-Type: application/json

Body:
{
  "creativeData": {
    "text": "Fresh Juice - Limited Time!",
    "fontSize": 22,
    "elements": [...]
  }
}

Response:
{
  "isCompliant": true,
  "violations": [],
  "warnings": [
    {
      "rule": "font_size_recommendation",
      "message": "Consider increasing to 24px for better readability"
    }
  ]
}
```

### Export Creatives
```http
POST /api/export
Content-Type: application/json

Body:
{
  "creativeId": "creative_789",
  "formats": ["instagram_post", "facebook_feed", "instagram_story"]
}

Response:
{
  "exportId": "export_999",
  "files": [
    {
      "format": "instagram_post",
      "url": "https://s3.../export/ig_post.jpg",
      "size": 487000
    }
  ],
  "complianceReport": "https://s3.../report.pdf"
}
```

## Error Responses
```json
{
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Image size exceeds 10MB limit",
    "details": {}
  }
}
```

## Rate Limits
- 100 requests per hour (free tier)
- 1000 requests per hour (paid tier)