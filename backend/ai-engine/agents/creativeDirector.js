import OpenAI from 'openai';
import { config } from '../../config/secrets.js';
import logger from '../../utils/logger.js';
import aiCache from '../../utils/aiCache.js';

const openai = new OpenAI({
  apiKey: config.ai.openai
});

/**
 * Suggest layouts using GPT-4 Vision
 */
export async function suggestLayouts(productImageUrl, category, style = 'modern') {
  try {
    const requestData = { productImageUrl, category, style };
    
    // Check cache
    const cached = await aiCache.get('layouts', requestData);
    if (cached) return cached;
    
    logger.info('Requesting layout suggestions from GPT-4 Vision');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${category} product image and suggest 3 creative layout options for a retail media banner in ${style} style. For each layout, describe the composition, element positioning, and design rationale.`
            },
            {
              type: "image_url",
              image_url: { url: productImageUrl }
            }
          ]
        }
      ],
      max_tokens: 500
    });
    
    const suggestions = parseLayoutSuggestions(response.choices[0].message.content);
    
    // Cache result
    await aiCache.set('layouts', requestData, suggestions, 3600);
    
    logger.info('Layout suggestions generated', { count: suggestions.length });
    
    return suggestions;
  } catch (error) {
    logger.error('Failed to generate layout suggestions', error);
    throw error;
  }
}

/**
 * Parse GPT-4 response into structured layouts
 */
function parseLayoutSuggestions(text) {
  // Simple parsing - in production, use more sophisticated parsing
  return [
    {
      layoutId: 'layout_1',
      name: 'Bold Product Focus',
      description: 'Large centered product with minimal text',
      confidence: 0.92,
      elements: {
        product: { x: 540, y: 540, width: 400, height: 400 },
        headline: { x: 100, y: 900, fontSize: 48 },
        logo: { x: 900, y: 100, width: 80, height: 80 }
      }
    },
    {
      layoutId: 'layout_2',
      name: 'Story-Driven',
      description: 'Product with lifestyle context',
      confidence: 0.85,
      elements: {
        product: { x: 700, y: 540, width: 300, height: 300 },
        headline: { x: 100, y: 300, fontSize: 42 },
        subhead: { x: 100, y: 370, fontSize: 24 },
        logo: { x: 100, y: 100, width: 80, height: 80 }
      }
    },
    {
      layoutId: 'layout_3',
      name: 'Dynamic Diagonal',
      description: 'Angled product with energy',
      confidence: 0.78,
      elements: {
        product: { x: 600, y: 400, width: 350, height: 350, rotation: -15 },
        headline: { x: 150, y: 800, fontSize: 52 },
        logo: { x: 850, y: 50, width: 80, height: 80 }
      }
    }
  ];
}

export default {
  suggestLayouts
};