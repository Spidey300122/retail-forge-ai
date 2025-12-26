# Architecture Documentation

Technical architecture overview of Retail Forge AI backend system.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Design](#component-design)
4. [Data Flow](#data-flow)
5. [AI Engine Architecture](#ai-engine-architecture)
6. [Database Design](#database-design)
7. [API Architecture](#api-architecture)
8. [Security Architecture](#security-architecture)
9. [Performance Optimization](#performance-optimization)
10. [Technology Stack](#technology-stack)

---

## System Overview

Retail Forge AI is a multi-agent AI system for generating compliant retail media creatives. The backend orchestrates specialized AI agents, enforces compliance rules, and provides real-time validation.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend Layer                         │
│                     (React + Fabric.js)                       │
└────────────────────┬─────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼─────────────────────────────────────────┐
│                     API Gateway Layer                         │
│                   (Express.js - Port 3000)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │   Upload    │  │  AI Routes  │  │  Validation  │        │
│  │  Controller │  │ Controller  │  │  Controller  │        │
│  └─────────────┘  └─────────────┘  └──────────────┘        │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                   Business Logic Layer                        │
│                   (AI Orchestrator + Agents)                  │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Creative      │  │  Compliance  │  │     Brand      │ │
│  │   Director      │  │   Officer    │  │    Manager     │ │
│  │  (GPT-4o)       │  │ (Claude 4.5) │  │  (Learning)    │ │
│  └─────────────────┘  └──────────────┘  └────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Rule Engine (30+ Compliance Rules)          │ │
│  │  Content • Design • Layout • Tags • Media              │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                    External Services Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Image     │  │     BERT     │  │   External   │      │
│  │   Service    │  │   Service    │  │  AI APIs     │      │
│  │  (Port 8000) │  │ (Port 8001)  │  │ (OpenAI etc) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                     Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │    AWS S3    │      │
│  │  (Port 5432) │  │ (Port 6379)  │  │ (Optional)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## Architecture Patterns

### 1. Multi-Agent Architecture

**Pattern:** Specialized agents handle specific tasks

```javascript
// AI Orchestrator coordinates agents
class AIOrchestrator {
  constructor() {
    this.agents = {
      creative: creativeDirector,      // Layout suggestions
      compliance: complianceOfficer,   // Copy generation & validation
      brand: brandManager,             // Brand learning
      validation: ruleEngine           // Compliance checking
    };
  }

  async processRequest(userInput) {
    // Analyze intent
    const intent = await this.analyzeIntent(userInput);
    
    // Invoke relevant agents in parallel
    const [layouts, copy] = await Promise.all([
      intent.needsLayout ? this.agents.creative.suggest() : null,
      intent.needsCopy ? this.agents.compliance.generate() : null
    ]);
    
    // Validate if needed
    if (intent.needsValidation) {
      await this.agents.validation.validate();
    }
    
    return { layouts, copy, recommendations };
  }
}
```

**Benefits:**
- Separation of concerns
- Independent scaling
- Easy to add new agents
- Parallel processing

### 2. Repository Pattern

**Pattern:** Abstract data access layer

```javascript
// db/queries.js - Data access layer
export async function getUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function saveCreative(creativeData) {
  const query = 'INSERT INTO creatives (...) VALUES (...) RETURNING *';
  const result = await pool.query(query, [creativeData]);
  return result.rows[0];
}

// Controllers use repositories, not direct DB access
import * as db from '../../db/queries.js';

export async function getCreative(req, res) {
  const creative = await db.getCreativeById(req.params.id);
  res.json({ success: true, data: creative });
}
```

**Benefits:**
- Testable (mock repositories)
- Consistent data access
- Easy to switch databases
- Centralized query optimization

### 3. Strategy Pattern (Compliance Rules)

**Pattern:** Encapsulate rule logic

```javascript
// Base rule class
export class ComplianceRule {
  constructor(ruleId, name, category, severity) {
    this.ruleId = ruleId;
    this.name = name;
    this.category = category;
    this.severity = severity;
  }
  
  validate(creativeData) {
    throw new Error('Must be implemented by subclass');
  }
}

// Concrete rule implementations
export class MinimumFontSizeRule extends ComplianceRule {
  constructor() {
    super('min_font_size', 'Minimum Font Size', 'design', 'hard_fail');
  }
  
  validate(creativeData) {
    const violations = [];
    const minSize = this.getMinimumSize(creativeData.format);
    
    creativeData.elements.forEach((el, index) => {
      if (el.type === 'text' && el.fontSize < minSize) {
        violations.push({ element: index, currentSize: el.fontSize });
      }
    });
    
    return {
      passed: violations.length === 0,
      message: violations.length > 0 ? `${violations.length} text elements below ${minSize}px` : null,
      violations
    };
  }
}

// Rule engine applies all rules
export class RuleEngine {
  constructor() {
    this.rules = [
      new MinimumFontSizeRule(),
      new WCAGContrastRule(),
      new NoTCsRule(),
      // ... 27 more rules
    ];
  }
  
  async validateAll(creativeData) {
    const results = await Promise.all(
      this.rules.map(rule => rule.validate(creativeData))
    );
    return this.aggregateResults(results);
  }
}
```

**Benefits:**
- Easy to add/remove rules
- Each rule is independently testable
- Rules can be enabled/disabled dynamically
- Clear separation of concerns

### 4. Caching Strategy (Cache-Aside)

**Pattern:** Application manages cache

```javascript
// utils/aiCache.js
export async function getCachedAIResponse(prefix, requestData) {
  const key = generateCacheKey(prefix, requestData);
  
  // 1. Try to get from cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  return null;
}

export async function cacheAIResponse(prefix, requestData, responseData, ttl = 3600) {
  const key = generateCacheKey(prefix, requestData);
  await redis.setex(key, ttl, JSON.stringify(responseData));
}

// Usage in AI service
async function generateCopy(productInfo, style) {
  // Check cache
  const cached = await getCachedAIResponse('copy', { productInfo, style });
  if (cached) return cached;
  
  // Generate via API
  const result = await claude.generateCopy(productInfo, style);
  
  // Cache result
  await cacheAIResponse('copy', { productInfo, style }, result, 3600);
  
  return result;
}
```

**Cache Invalidation:**
- Time-based: 1 hour TTL for AI responses
- Event-based: Clear user cache on profile update
- Manual: Admin can flush specific keys

---

## Component Design

### 1. API Gateway (Express.js)

**Responsibilities:**
- Route requests
- Authentication/authorization
- Rate limiting
- Request validation
- CORS handling
- Error handling

```javascript
// server.js structure
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Middleware stack
app.use(cors(corsOptions));                 // CORS
app.use(express.json({ limit: '10mb' }));   // Body parsing
app.use('/api/', rateLimiter);              // Rate limiting
app.use(requestLogger);                     // Logging

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/validate', validateRoutes);
app.use('/api/export', exportRoutes);

// Error handling
app.use(errorHandler);
app.use(notFoundHandler);
```

### 2. AI Orchestrator

**Responsibilities:**
- Intent analysis
- Agent coordination
- Result aggregation
- Recommendation generation

```javascript
// ai-engine/orchestrator.js
class AIOrchestrator {
  async analyzeIntent(userInput) {
    // NLP-like intent detection
    return {
      needsLayout: /layout|design|arrange/.test(userInput),
      needsCopy: /copy|text|headline/.test(userInput),
      needsValidation: /check|validate|compliant/.test(userInput),
      category: this.detectCategory(userInput),
      style: this.detectStyle(userInput)
    };
  }
  
  async processCreativeRequest(request) {
    const intent = await this.analyzeIntent(request.userInput);
    const results = {};
    
    // Parallel agent invocation
    if (intent.needsLayout) {
      results.layouts = await this.agents.creative.suggestLayouts(request);
    }
    
    if (intent.needsCopy) {
      results.copy = await this.agents.compliance.generateCopy(request);
    }
    
    // Sequential validation (depends on creative data)
    if (intent.needsValidation && request.creativeData) {
      results.validation = await this.agents.validation.validateAll(request.creativeData);
    }
    
    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);
    
    return results;
  }
}
```

### 3. Compliance Rule Engine

**Responsibilities:**
- Rule registration
- Validation orchestration
- Result aggregation
- Score calculation

```javascript
// ai-engine/compliance/ruleEngine.js
export class RuleEngine {
  constructor() {
    this.rules = [];
    this.initializeRules();
  }
  
  initializeRules() {
    // Content rules (8)
    this.addRule(new BERTTextRule());
    this.addRule(new NoTCsRule());
    this.addRule(new NoCompetitionRule());
    // ... 5 more
    
    // Design rules (10)
    this.addRule(new MinimumFontSizeRule());
    this.addRule(new WCAGContrastRule());
    // ... 8 more
    
    // Layout rules (5)
    this.addRule(new PackshotSpacingRule());
    // ... 4 more
    
    // Tag rules (2)
    this.addRule(new ApprovedTagsOnlyRule());
    // ... 1 more
    
    // Media rules (2)
    this.addRule(new PhotographyOfPeopleRule());
    this.addRule(new ImageQualityRule());
  }
  
  async validateAll(creativeData) {
    const results = {
      isCompliant: true,
      violations: [],
      warnings: [],
      rulesChecked: 0,
      rulesPassed: 0,
      rulesFailed: 0
    };
    
    // Run all rules
    for (const rule of this.rules) {
      const result = await rule.validate(creativeData);
      results.rulesChecked++;
      
      if (!result.passed) {
        results.rulesFailed++;
        
        if (rule.severity === 'hard_fail') {
          results.isCompliant = false;
          results.violations.push({
            ruleId: rule.ruleId,
            message: result.message,
            suggestion: result.suggestion
          });
        } else {
          results.warnings.push({
            ruleId: rule.ruleId,
            message: result.message
          });
        }
      } else {
        results.rulesPassed++;
      }
    }
    
    results.score = this.calculateScore(results);
    return results;
  }
  
  calculateScore(results) {
    const passRate = results.rulesPassed / results.rulesChecked;
    const baseScore = passRate * 100;
    const violationPenalty = results.violations.length * 10;
    const warningPenalty = results.warnings.length * 2;
    
    return Math.max(0, Math.round(baseScore - violationPenalty - warningPenalty));
  }
}
```

### 4. Image Processing Service

**Responsibilities:**
- Background removal (rembg)
- Color extraction
- Image optimization
- Background generation (Stable Diffusion)

```python
# image-service.py
from fastapi import FastAPI, File, UploadFile
from rembg import remove
from PIL import Image

app = FastAPI()

@app.post("/process/remove-background")
async def remove_bg(file: UploadFile):
    # Load image
    input_data = await file.read()
    
    # Remove background
    output_data = remove(input_data)
    
    # Save and return
    output_image = Image.open(BytesIO(output_data))
    output_path = save_image(output_image)
    
    return {
        "success": True,
        "download_url": f"/download/{output_path}",
        "dimensions": {"width": output_image.width, "height": output_image.height}
    }
```

### 5. BERT Service

**Responsibilities:**
- Text classification
- Compliance detection
- Batch processing

```python
# bert-service.py
from transformers import BertTokenizer, BertForSequenceClassification

class ComplianceTextClassifier:
    LABELS = {
        0: 'allowed',
        1: 'tcs',
        2: 'competition',
        3: 'green_claim',
        4: 'charity',
        5: 'price_claim',
        6: 'guarantee'
    }
    
    def __init__(self):
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.model = BertForSequenceClassification.from_pretrained(
            'bert-base-uncased',
            num_labels=len(self.LABELS)
        )
    
    def classify_text(self, text, threshold=0.7):
        # Tokenize
        inputs = self.tokenizer(text, return_tensors='pt', truncation=True)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction].item()
        
        return {
            'label': self.LABELS[prediction],
            'confidence': confidence,
            'compliant': self.LABELS[prediction] == 'allowed' or confidence < threshold
        }
```

---

## Data Flow

### 1. Copy Generation Flow

```
User Request
    ↓
[API Gateway] POST /api/ai/generate-copy
    ↓
[AI Controller] validateRequest()
    ↓
[Orchestrator] processCreativeRequest()
    ↓
[Compliance Officer] generateCopy()
    ↓
[Cache Check] getCachedAIResponse()
    ↓ (cache miss)
[Claude API] messages.create()
    ↓
[Response Parser] extractJsonFromMarkdown()
    ↓
[Cache Save] cacheAIResponse()
    ↓
[AI Controller] return response
    ↓
User receives 3 copy variations
```

### 2. Compliance Validation Flow

```
User Request (with creative data)
    ↓
[API Gateway] POST /api/validate/creative
    ↓
[Validate Controller] validateCreative()
    ↓
[Rule Engine] validateAll()
    ↓
[Parallel Rule Execution]
    ├─> [BERTTextRule] → BERT Service (8001)
    ├─> [MinimumFontSizeRule] → Local validation
    ├─> [WCAGContrastRule] → Local validation
    ├─> [NoTCsRule] → Local validation
    └─> ... (23 more rules)
    ↓
[Result Aggregation]
    ↓
[Score Calculation]
    ↓
[Controller] return validation results
    ↓
User receives compliance report
```

### 3. Export Pipeline Flow

```
User initiates export
    ↓
[Frontend] Canvas → toDataURL() → Blob
    ↓
[API Gateway] POST /api/export (multipart/form-data)
    ↓
[Export Controller] processExport()
    ↓
[Sharp] Process original image
    ├─> creative.png (high quality)
    ├─> creative.jpg (compressed)
    └─> Resize for each format
        ├─> Instagram_Post.jpg (1080x1080)
        ├─> Facebook_Feed.jpg (1200x628)
        └─> Instagram_Story.jpg (1080x1920)
    ↓
[PDFKit] Generate compliance report
    ├─> Status box (green/red)
    ├─> Violations list
    ├─> Warnings list
    └─> Footer with metadata
    ↓
[Archiver] Create ZIP file
    ├─> Add all images
    ├─> Add PDF report
    └─> Add metadata.json
    ↓
[Stream to client] application/zip
    ↓
User downloads complete package
```

### 4. Image Background Removal Flow

```
User uploads image
    ↓
[Frontend] File → FormData
    ↓
[API Gateway] POST /api/image/remove-background
    ↓
[Image Controller] removeBackground()
    ↓
[HTTP Proxy] Forward to Image Service (8000)
    ↓
[Image Service] /process/remove-background
    ↓
[File System] Save uploaded file to temp/
    ↓
[Rembg] remove(input_data)
    ├─> Load U2-Net model (~176MB, cached)
    ├─> Process image
    └─> Generate alpha mask
    ↓
[PIL] Save as PNG with transparency
    ↓
[File System] Save to temp/processed/
    ↓
[Response] Return download URL
    ↓
[API Controller] Proxy download URL to frontend
    ↓
User receives background-removed image
```

---

## AI Engine Architecture

### Agent Coordination

```javascript
// Orchestrator decides which agents to invoke based on intent

┌─────────────────────────────────────────────────────────────┐
│                      User Input                              │
│  "Create modern layout with energetic copy for orange juice"│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  Orchestrator │
              │ analyzeIntent │
              └──────┬───────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
    needsLayout  needsCopy  needsValidation
         │           │           │
         ▼           ▼           ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Creative   │ │ Compliance │ │    Rule    │
│ Director   │ │  Officer   │ │   Engine   │
│            │ │            │ │            │
│ GPT-4o     │ │ Claude 4.5 │ │  30 Rules  │
│ Vision     │ │            │ │            │
└─────┬──────┘ └─────┬──────┘ └─────┬──────┘
      │              │              │
      │ 3 layouts    │ 3 copies     │ validation
      │              │              │ results
      └──────────────┴──────────────┘
                     │
                     ▼
              ┌──────────────┐
              │    Results   │
              │  + Recommend │
              └──────────────┘
```

### Agent Specialization

**Creative Director (GPT-4o Vision):**
- Input: Product image URL + category + style
- Processing: Visual analysis, composition suggestions
- Output: 3 layout options with element positioning
- Cache: 1 hour (layouts rarely change for same image)

**Compliance Officer (Claude Sonnet 4.5):**
- Input: Product info + style
- Processing: Creative copywriting with compliance awareness
- Output: 3 copy variations with rationale
- Cache: 1 hour (same product = same copy)

**Brand Manager (In-memory):**
- Input: User choices, brand preferences
- Processing: Learn color/font/layout preferences over time
- Output: Personalized recommendations
- Storage: PostgreSQL brand_profiles table

**Rule Engine (Synchronous):**
- Input: Creative data (canvas JSON)
- Processing: Run 30+ validation rules
- Output: Compliance report with violations/warnings
- Cache: None (validation must be real-time)

---

## Database Design

### Schema Overview

```sql
users (id, email, name, created_at)
    ↓ one-to-many
brand_profiles (id, user_id, brand_name, color_palette, preferences)
    ↓ one-to-many
creatives (id, user_id, brand_profile_id, canvas_data, status)
    ↓ one-to-many
    ├─> compliance_validations (id, creative_id, violations, score)
    ├─> exports (id, creative_id, format, file_url)
    └─> creative_history (id, creative_id, action_type, choices)
    
images (id, user_id, s3_url, metadata)
color_palettes (id, user_id, image_id, colors)
ai_logs (id, user_id, agent_type, request_data, response_data)
```

### Key Design Decisions

**1. JSONB for Flexibility**
- `canvas_data`: Store entire Fabric.js canvas as JSONB
- `violations`: Store dynamic rule results
- `color_palette`: Store extracted colors with metadata
- `metadata`: Store arbitrary image metadata

**Why JSONB:**
- Schema flexibility (canvas structure may evolve)
- Indexable (can query inside JSONB)
- Native PostgreSQL support
- Better than storing JSON strings

**2. Separate Tables for History**
- `compliance_validations`: Track validation history
- `creative_history`: Track user choices for learning
- `ai_logs`: Debug AI interactions

**Why Separate:**
- Audit trail
- Performance (don't bloat main tables)
- Easy to query/analyze patterns

**3. Foreign Keys with Cascades**
```sql
brand_profiles.user_id → users.id ON DELETE CASCADE
creatives.user_id → users.id ON DELETE CASCADE
compliance_validations.creative_id → creatives.id ON DELETE CASCADE
```

**Why Cascades:**
- Automatic cleanup when user/creative deleted
- Maintain referential integrity
- Prevent orphaned records

### Indexes

```sql
-- Query optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_creatives_user ON creatives(user_id);
CREATE INDEX idx_creatives_status ON creatives(status);
CREATE INDEX idx_validations_creative ON compliance_validations(creative_id);
CREATE INDEX idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_agent ON ai_logs(agent_type);
CREATE INDEX idx_palettes_user ON color_palettes(user_id);
```

**Impact:**
- 10x faster user queries
- Efficient filtering by status
- Fast AI log aggregation

---

## API Architecture

### RESTful Principles

**Resource-based URLs:**
```
✅ Good:
POST   /api/creatives          # Create creative
GET    /api/creatives/:id      # Get creative
PUT    /api/creatives/:id      # Update creative
DELETE /api/creatives/:id      # Delete creative

❌ Bad:
POST   /api/createCreative
GET    /api/getCreativeById
POST   /api/updateCreativeData
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Creative data validation failed",
    "details": { ... }
  }
}
```

### Versioning Strategy

```javascript
// Current: No versioning (pre-1.0)
app.use('/api', routes);

// Future: URL versioning
app.use('/api/v1', routesV1);
app.use('/api/v2', routesV2);

// Or: Header versioning
app.use((req, res, next) => {
  const version = req.header('API-Version') || '1.0';
  if (version === '2.0') {
    // Route to v2 handlers
  } else {
    // Route to v1 handlers
  }
  next();
});
```

---

## Security Architecture

### 1. Input Validation

```javascript
// Validate all user inputs
import { z } from 'zod';

const createCreativeSchema = z.object({
  title: z.string().min(1).max(255),
  canvasData: z.object({
    version: z.string(),
    objects: z.array(z.any())
  }),
  category: z.enum(['beverages', 'food', 'beauty', 'electronics'])
});

export async function createCreative(req, res) {
  try {
    const data = createCreativeSchema.parse(req.body);
    // ... process validated data
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details: error }
    });
  }
}
```

### 2. SQL Injection Prevention

```javascript
// ✅ Always use parameterized queries
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ Never concatenate user input
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${email}'` // VULNERABLE!
);
```

### 3. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    });
  }
});

app.use('/api/', limiter);
```

### 4. CORS Configuration

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://retailforge.ai',
      'https://www.retailforge.ai'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## Performance Optimization

### 1. Caching Strategy

**Multi-level cache:**

```
Request → [Redis Cache] → [Database]
            ↑ hit          ↑ miss
            │              │
         return         query + cache
```

**Implementation:**
```javascript
async function getCreative(id) {
  // L1: Redis cache (fast)
  const cached = await redis.get(`creative:${id}`);
  if (cached) return JSON.parse(cached);
  
  // L2: Database (slower)
  const creative = await db.getCreativeById(id);
  
  // Cache for 1 hour
  await redis.setex(`creative:${id}`, 3600, JSON.stringify(creative));
  
  return creative;
}
```

### 2. Database Query Optimization

**Index usage:**
```sql
-- Slow: Full table scan
SELECT * FROM creatives WHERE user_id = 123;

-- Fast: Index scan (with idx_creatives_user)
EXPLAIN SELECT * FROM creatives WHERE user_id = 123;
```

**Connection pooling:**
```javascript
const pool = new Pool({
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000 // Connection timeout
});
```

### 3. Async Processing

**Background jobs for heavy tasks:**
```javascript
// Instead of:
await generateBackground(); // Blocks for 15 seconds

// Use:
const jobId = await queue.add('generate-background', { prompt });
res.json({ jobId, status: 'processing' });

// Client polls:
GET /api/jobs/:jobId → { status: 'completed', result: ... }
```

### 4. Response Compression

```javascript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9)
}));
```

---

## Technology Stack

### Backend Core
- **Node.js 18+** - JavaScript runtime
- **Express.js 4** - Web framework
- **PostgreSQL 14** - Primary database
- **Redis 7** - Caching & sessions

### AI Services
- **OpenAI GPT-4o** - Layout suggestions (vision)
- **Anthropic Claude Sonnet 4.5** - Copy generation
- **Stability AI SDXL** - Background generation
- **HuggingFace BERT** - Text classification

### Image Processing
- **Python 3.10** - Image service runtime
- **FastAPI** - Python web framework
- **Rembg** - Background removal
- **Pillow (PIL)** - Image manipulation
- **scikit-learn** - Color extraction

### Development Tools
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-reload in dev
- **PM2** - Process management (production)

### Testing
- **Custom test scripts** - Integration testing
- **Jest** (future) - Unit testing
- **Supertest** (future) - API testing

---

## Scalability Considerations

### Horizontal Scaling

**Stateless design enables scaling:**
- No session state in app servers
- All state in Redis/PostgreSQL
- Any server can handle any request

**Load balancer configuration:**
```nginx
upstream backend {
    least_conn; # Route to server with fewest connections
    server backend1:3000 weight=3;
    server backend2:3000 weight=3;
    server backend3:3000 weight=2; # Lower spec server
}
```

### Database Scaling

**Read replicas for GET requests:**
```javascript
// Write to primary
await primaryPool.query('INSERT INTO creatives ...');

// Read from replica
const creatives = await replicaPool.query('SELECT * FROM creatives ...');
```

### Microservices Evolution

**Current: Modular monolith**
```
Single deployment with separated concerns
```

**Future: Microservices**
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Gateway   │  │ AI Service  │  │  Validation │
│   Service   │  │   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Conclusion

Retail Forge AI backend is designed with:
- ✅ **Modularity** - Easy to extend and maintain
- ✅ **Scalability** - Ready to handle growth
- ✅ **Reliability** - Error handling and monitoring
- ✅ **Security** - Input validation and rate limiting
- ✅ **Performance** - Caching and optimization

The architecture balances simplicity (modular monolith) with future flexibility (microservices-ready).