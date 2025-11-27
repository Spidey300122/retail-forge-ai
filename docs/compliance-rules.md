# Tesco Retail Media Compliance Rules

## Content Rules (8 rules)

### 1. No Terms & Conditions
**Severity**: Hard Fail
**Description**: No T&Cs text allowed in creatives
**Detection**: BERT text classifier
**Examples**:
- ❌ "Terms and conditions apply"
- ❌ "T&Cs apply"
- ✅ No T&C text

### 2. No Competition Messaging
**Severity**: Hard Fail
**Description**: No contest or competition language
**Detection**: BERT text classifier
**Examples**:
- ❌ "Enter to win"
- ❌ "Competition ends 31/12"
- ✅ "Available now"

### 3. No Green Claims
**Severity**: Hard Fail
**Description**: No unsubstantiated environmental claims
**Detection**: BERT text classifier
**Examples**:
- ❌ "Eco-friendly"
- ❌ "100% sustainable"
- ✅ No green claims

### 4. Drinkaware for Alcohol
**Severity**: Hard Fail
**Description**: Drinkaware logo required for alcohol products
**Detection**: Category check + visual detection
**Requirements**:
- Minimum 20px height (12px for SAYS)
- Black or white only
- Sufficient contrast

## Design Rules (12 rules)

### 5. Minimum Font Size
**Severity**: Hard Fail
**Description**: All text must be minimum 20px (10px for checkout single density, 12px for SAYS)
**Detection**: Canvas element analysis
**Suggestion**: Increase font to 20px

### 6. WCAG Contrast
**Severity**: Hard Fail
**Description**: Text must meet WCAG AA contrast standards
**Detection**: Color contrast algorithm
**Minimum Ratio**: 4.5:1 for normal text, 3:1 for large text

### 7. Value Tile Position
**Severity**: Hard Fail
**Description**: Value tiles must be in predefined positions
**Types**: New, White, Clubcard
**Rules**:
- Cannot be moved by user
- Nothing can overlap value tile
- Clubcard tile must include end date in DD/MM format

## Tag Rules (5 rules)

### 8. Approved Tags Only
**Severity**: Hard Fail
**Description**: Only specific tag text allowed
**Allowed Tags**:
- "Only at Tesco"
- "Available at Tesco"
- "Selected stores. While stocks last."
- "Available in selected stores. Clubcard/app required. Ends DD/MM" (if Clubcard Price)

## Layout Rules (7 rules)

### 9. Packshot Spacing
**Severity**: Hard Fail
**Description**: Minimum 24px gap between packshot and CTA (12px for checkout single density)
**Detection**: Position analysis
**Suggestion**: Increase spacing to 24px

### 10. Social Safe Zones
**Severity**: Hard Fail
**Description**: For 9:16 format (Stories), keep 200px from top and 250px from bottom free
**Applies To**: Instagram Stories, Facebook Stories
**Detection**: Element position check

## Implementation Priority

**Phase 1 (Must Have - Day 11-13):**
1. No T&Cs
2. No competitions
3. Minimum font size
4. Drinkaware for alcohol
5. Approved tags only
6. Value tile position
7. Packshot spacing
8. WCAG contrast

**Phase 2 (Important - Day 14):**
9. Social safe zones
10. No green claims
11. CTA positioning
12. Maximum 3 packshots

**Phase 3 (Good to Have - If Time):**
13. Element hierarchy
14. Background validation
15. Advanced layout rules