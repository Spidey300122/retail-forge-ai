# Database Schema Documentation

## Entity Relationship
```
users
  └─── brand_profiles
         └─── creatives
                ├─── compliance_validations
                ├─── exports
                └─── creative_history
  └─── images
  └─── ai_logs
  └─── api_usage
```

## Tables

### users
Core user accounts.

### brand_profiles
Stores brand identity (colors, fonts, preferences) that AI learns over time.

### images
All uploaded/generated images with metadata.

### creatives
Canvas projects with Fabric.js JSON and validation status.

### compliance_validations
History of validation checks for each creative.

### exports
Exported creative files in various formats.

### creative_history
User choices for brand learning (which layouts chosen, colors used).

### ai_logs
Debug logs for AI agent interactions.

### api_usage
Rate limiting tracking per user/endpoint/day.

## Key JSONB Fields

### brand_profiles.color_palette
```json
[
  {
    "hex": "#FF5733",
    "rgb": [255, 87, 51],
    "name": "primary",
    "usage": "dominant"
  }
]
```

### creatives.canvas_data
```json
{
  "version": "5.3.0",
  "objects": [
    {
      "type": "image",
      "src": "https://s3.../image.jpg",
      "left": 100,
      "top": 100
    }
  ]
}
```

### compliance_validations.violations
```json
[
  {
    "rule": "min_font_size",
    "severity": "error",
    "message": "Font size must be at least 20px",
    "element": "text_0",
    "suggestion": {
      "action": "increase_font",
      "value": 20
    }
  }
]
```