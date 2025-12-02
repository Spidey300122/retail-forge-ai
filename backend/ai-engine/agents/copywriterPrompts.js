export const COPY_STYLES = {
  energetic: {
    tone: 'exciting, dynamic, high-energy',
    examples: ['Burst into freshness!', 'Unleash the flavor!', 'Feel the rush!']
  },
  elegant: {
    tone: 'sophisticated, refined, premium',
    examples: ['Refined taste, perfected.', 'Elegance in every sip.']
  },
  minimal: {
    tone: 'simple, clean, direct',
    examples: ['Simply better.', 'Pure. Simple. Perfect.']
  },
  playful: {
    tone: 'fun, lighthearted, casual',
    examples: ['Snack happy!', 'Get your crunch on!']
  },
  professional: {
    tone: 'confident, trustworthy, authoritative',
    examples: ['Trusted quality since 1985.', 'Performance you can rely on.']
  }
};

export const CATEGORY_GUIDELINES = {
  beverages: {
    focus: 'taste, refreshment, experience',
    avoid: 'health claims without proof, excessive sweetness mentions'
  },
  food: {
    focus: 'flavor, quality, freshness',
    avoid: 'unverified nutritional claims, misleading ingredients'
  },
  beauty: {
    focus: 'results, feeling, transformation',
    avoid: 'medical claims, anti-aging promises'
  },
  electronics: {
    focus: 'features, innovation, reliability',
    avoid: 'comparison with competitors, unproven tech claims'
  }
};

export function buildCopyPrompt(productInfo, style) {
  const styleGuide = COPY_STYLES[style] || COPY_STYLES.energetic;
  const categoryGuide = CATEGORY_GUIDELINES[productInfo.category] || {};
  
  return `You are an expert retail copywriter creating compliant advertising copy.

PRODUCT DETAILS:
- Name: ${productInfo.name}
- Category: ${productInfo.category}
- Features: ${productInfo.features?.join(', ') || 'N/A'}
- Target Audience: ${productInfo.audience || 'general consumers'}

STYLE: ${style.toUpperCase()}
- Tone: ${styleGuide.tone}
- Examples: ${styleGuide.examples.join(' | ')}

CATEGORY FOCUS:
- Focus on: ${categoryGuide.focus || 'benefits and appeal'}
- Avoid: ${categoryGuide.avoid || 'unsubstantiated claims'}

COMPLIANCE RULES (CRITICAL):
1. NO terms and conditions text (no "T&Cs apply", "conditions apply")
2. NO competition language (no "win", "enter", "prize")
3. NO unsubstantiated claims (no "best", "only", "guaranteed" unless proven)
4. NO green/environmental claims unless certified
5. NO charity partnership mentions
6. Keep headlines under 50 characters for optimal display
7. Make copy actionable and benefit-focused

TASK:
Generate 3 creative headline variations with supporting subheadlines.

OUTPUT FORMAT (JSON only, no markdown):
[
  {
    "headline": "5-7 word attention-grabbing headline",
    "subhead": "10-15 word benefit-focused subheadline",
    "rationale": "Why this works for the product and audience",
    "complianceNotes": "Why this is compliant"
  }
]

Focus on emotional connection, clear benefits, and retail-appropriate language.`;
}