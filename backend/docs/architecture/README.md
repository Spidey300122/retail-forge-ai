# Architecture Overview

## System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Canvas Editor│  │ Validation UI│  │  Export UI   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Gateway │  │Image Service │  │ AI Orchestr. │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
         ┌──────────┐ ┌─────────┐ ┌─────────┐
         │PostgreSQL│ │  Redis  │ │  AWS S3 │
         └──────────┘ └─────────┘ └─────────┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
         ┌──────────┐ ┌─────────┐ ┌─────────┐
         │  GPT-4   │ │ Claude  │ │ Stable  │
         │  Vision  │ │   API   │ │Diffusion│
         └──────────┘ └─────────┘ └─────────┘
```

## Multi-Agent Architecture

### Creative Director Agent
- **Technology**: GPT-4 Vision
- **Responsibilities**: Layout suggestions, design recommendations
- **Input**: Product images, category, user intent
- **Output**: 3 layout options with rationale

### Compliance Officer Agent
- **Technology**: Fine-tuned BERT + Rule Engine
- **Responsibilities**: Validate against 30+ rules
- **Input**: Creative data (text, positions, sizes)
- **Output**: Violations list + suggestions

### Design Assistant Agent
- **Technology**: Stable Diffusion XL
- **Responsibilities**: Background generation, image enhancement
- **Input**: Style preferences, product type
- **Output**: Professional backgrounds

### Brand Manager Agent
- **Technology**: Custom ML Model
- **Responsibilities**: Learn brand identity, ensure consistency
- **Input**: Historical creatives, user choices
- **Output**: Personalized recommendations

## Data Flow

1. User uploads product image
2. Frontend sends to Image Processing Service
3. Background removal (SAM model)
4. Color extraction
5. Creative Director suggests layouts
6. User customizes
7. Real-time compliance validation
8. Export to multiple formats
9. Store in brand memory