# Coding Standards

## General Principles
- Write clean, readable code
- Comment complex logic
- Use meaningful variable names
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself)

## JavaScript/React
```javascript
// ✅ Good
function validateCompliance(creativeData) {
  const violations = [];
  
  if (creativeData.fontSize < 20) {
    violations.push({
      rule: 'min_font_size',
      message: 'Font size must be at least 20px'
    });
  }
  
  return violations;
}

// ❌ Bad
function vC(d) {
  let v = [];
  if (d.fs < 20) v.push({r: 'mfs', m: 'Font too small'});
  return v;
}
```

## Python
```python
# ✅ Good
def extract_brand_colors(image_path: str) -> List[str]:
    """
    Extract dominant colors from brand logo.
    
    Args:
        image_path: Path to the logo image
        
    Returns:
        List of hex color codes
    """
    color_thief = ColorThief(image_path)
    palette = color_thief.get_palette(color_count=5)
    return [rgb_to_hex(color) for color in palette]

# ❌ Bad
def ebc(ip):
    ct = ColorThief(ip)
    p = ct.get_palette(color_count=5)
    return [rgb_to_hex(c) for c in p]
```

## Naming Conventions

**Variables**: camelCase
```javascript
const userName = "John";
const isValid = true;
```

**Constants**: UPPER_SNAKE_CASE
```javascript
const MAX_FILE_SIZE = 10485760; // 10MB
const API_BASE_URL = "https://api.example.com";
```

**Functions**: camelCase, verb-first
```javascript
function getUserData() {}
function validateInput() {}
function createCanvas() {}
```

**Components**: PascalCase
```javascript
function CanvasEditor() {}
function ValidationPanel() {}
```

**Files**: 
- Components: PascalCase (CanvasEditor.jsx)
- Utils: camelCase (validation.js)
- Constants: UPPER_SNAKE_CASE (API_KEYS.js)

## Git Commit Messages

Format: `type(scope): message`

**Types**:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

**Examples**:
```
feat(canvas): Add drag-and-drop functionality
fix(compliance): Resolve font size validation bug
docs(api): Update endpoint documentation
refactor(agents): Simplify AI orchestration logic
```

## Code Review Checklist
- [ ] Code follows style guide
- [ ] Functions are well-documented
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Tests written (if applicable)
- [ ] No hardcoded secrets/API keys