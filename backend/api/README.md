# API Documentation

## Copy Generation Endpoints

### Generate Copy

Generate compliant advertising copy using Claude AI.

**Endpoint:** `POST /api/ai/generate-copy`

**Request:**
```json
{
  "productInfo": {
    "name": "Fresh Orange Juice",
    "category": "beverages",
    "features": ["100% natural", "No sugar added"],
    "audience": "health-conscious families"
  },
  "style": "energetic"
}
```

**Response:**
```json
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
      }
    ],
    "processingTimeMs": 2341
  }
}
```

**Parameters:**
- `productInfo.name` (required): Product name
- `productInfo.category` (required): Product category
- `productInfo.features` (optional): Array of product features
- `productInfo.audience` (optional): Target audience description
- `style` (optional): Copy style - `energetic`, `elegant`, `minimal`, `playful`, `professional`

**Styles:**
- **Energetic**: Exciting, dynamic, high-energy
- **Elegant**: Sophisticated, refined, premium
- **Minimal**: Simple, clean, direct
- **Playful**: Fun, lighthearted, casual
- **Professional**: Confident, trustworthy, authoritative

**Compliance:**
All generated copy is automatically checked against:
- No T&Cs language
- No competition/contest mentions
- No unsubstantiated claims
- No green claims without certification
- Character limits for optimal display

### Validate Copy

Validate existing copy text against compliance rules.

**Endpoint:** `POST /api/ai/validate-copy`

**Request:**
```json
{
  "text": "Win a prize! T&Cs apply."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCompliant": false,
    "violations": [
      {
        "type": "prohibited_text",
        "severity": "error",
        "message": "Contains prohibited T&Cs language",
        "suggestion": "Remove terms and conditions references"
      },
      {
        "type": "competition_language",
        "severity": "error",
        "message": "Contains competition/contest language",
        "suggestion": "Use 'available now' instead of 'win'"
      }
    ],
    "score": 0
  }
}
```

**Error Codes:**
- `400` - Invalid request (missing product info)
- `500` - AI service error
- `503` - Service temporarily unavailable
````