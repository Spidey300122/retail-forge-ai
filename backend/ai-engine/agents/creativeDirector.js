import OpenAI from 'openai';
import { config } from '../../config/secrets.js';
import logger from '../../utils/logger.js';
import aiCache from '../../utils/aiCache.js';

const openai = new OpenAI({
  apiKey: config.ai.openai
});

/**
 * Define the structure the AI should return.
 */
const JSON_FORMAT_INSTRUCTION = `
Return your response as a raw JSON array. DO NOT include any introductory text or markdown wrappers (\`\`\`json\`). The JSON structure must be:

[
  {
    "name": "string",
    "description": "string",
    "rationale": "string",
    "elements": {
      "product": {"x": number, "y": number, "width": number, "height": number},
      "headline": {"x": number, "y": number, "fontSize": number},
      "logo": {"x": number, "y": number, "width": number, "height": number}
      // other elements like subhead might be added as needed
    }
  }
]`;

/**
 * Suggest layouts using GPT-4 Vision
 */
export async function suggestLayouts(productImageUrl, category, style = 'modern') {
  try {
    const requestData = { productImageUrl, category, style };
    
    // Check cache
    const cached = await aiCache.get('layouts', requestData);
    if (cached) return cached;
    
    logger.info('Requesting layout suggestions from GPT-4o');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      // Enable JSON mode to ensure valid JSON output
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${category} product image and suggest 3 creative layout options for a retail media banner in ${style} style. For each layout, describe the composition, element positioning, and design rationale. ${JSON_FORMAT_INSTRUCTION}`
            },
            {
              type: "image_url",
              image_url: { url: productImageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000 // Increased max tokens to fit the JSON structure
    });
    
    // The response is now guaranteed to be a valid JSON string
    const rawJsonText = response.choices[0].message.content;
    const suggestions = JSON.parse(rawJsonText);
    
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
 * This function now just returns the parsed JSON array directly.
 */
function parseLayoutSuggestions(text) {
  // We don't need the hardcoded data anymore, as the API returns the actual data.
  // The JSON.parse is handled in the main function's try/catch block.
  return JSON.parse(text); 
}

export default {
  suggestLayouts
};
