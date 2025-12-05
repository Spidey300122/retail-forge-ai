import OpenAI from 'openai';
import { config } from '../../config/secrets.js';
import logger from '../../utils/logger.js';
import aiCache from '../../utils/aiCache.js';

const openai = new OpenAI({
  apiKey: config.ai.openai
});

// Helper to strip markdown code blocks if present
function cleanJsonString(text) {
  if (!text) return null;
  // Remove ```json ... ``` wrappers
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1];
  }
  return text;
}

/**
 * Suggest layouts using GPT-4 Vision
 */
export async function suggestLayouts(productImageUrl, category, style = 'modern') {
  try {
    const requestData = { productImageUrl, category, style };
    
    // Check cache
    const cached = await aiCache.get('layouts', requestData);
    if (cached) {
      logger.info('Cache hit for layout suggestions');
      return cached;
    }
    
    logger.info('Requesting layout suggestions from GPT-4o Vision');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative director for retail media campaigns. STRICT COPYRIGHT COMPLIANCE: Do not suggest or generate designs that use existing brand logos (other than the user's own), trademarked characters (e.g., Marvel, Disney), or copyrighted artwork. All design elements must be generic or original. If the product image implies a specific brand, do not replicate its protected assets in your layout recommendations."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this ${category} product image and suggest 3 layout options for a 1080x1080px Instagram post in ${style} style.

For each layout, provide:
1. A descriptive name
2. Brief rationale (why it works for this product)
3. Element positioning (product, headline, logo, value tile if applicable)

IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting or introductory text. Use this exact structure:
{
  "layouts": [
    {
      "name": "Bold Product Focus",
      "description": "Large centered product with minimal text overlay",
      "rationale": "Works well for visually striking products",
      "elements": {
        "product": {"x": 540, "y": 540, "width": 600, "height": 600},
        "headline": {"x": 540, "y": 900, "fontSize": 48, "align": "center"},
        "logo": {"x": 100, "y": 100, "width": 120, "height": 120}
      }
    }
  ]
}

Position coordinates are from top-left corner. Canvas is 1080x1080px.`
            },
            {
              type: "image_url",
              image_url: { 
                url: productImageUrl,
                detail: "low" 
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    const choice = response.choices[0];
    
    if (choice.message.refusal) {
        logger.warn('AI refused request', { refusal: choice.message.refusal });
        throw new Error(`AI Refusal: ${choice.message.refusal}`);
    }

    let rawText = choice.message.content;
    const finishReason = choice.finish_reason;

    if (!rawText) {
        logger.warn('AI returned empty content', { finishReason });
        throw new Error(`AI returned empty response (Reason: ${finishReason})`);
    }

    if (rawText.includes("I'm sorry") || rawText.includes("I cannot assist")) {
       logger.warn('AI refused request in content', { rawText });
       throw new Error("AI refused to process this specific image.");
    }

    rawText = cleanJsonString(rawText);
    
    let suggestions;
    try {
      suggestions = JSON.parse(rawText);
    } catch (parseError) {
      logger.warn('Failed to parse GPT-4 response', { rawText });
      throw new Error('Invalid JSON response from AI');
    }
    
    if (!suggestions || !suggestions.layouts || !Array.isArray(suggestions.layouts)) {
      logger.warn('Invalid layout response structure', { parsed: suggestions });
      throw new Error('Invalid layout response structure');
    }
    
    // Cache result (1 hour)
    await aiCache.set('layouts', requestData, suggestions, 3600);
    
    logger.info('Layout suggestions generated', { count: suggestions.layouts.length });
    
    return suggestions;
  } catch (error) {
    logger.error('Failed to generate layout suggestions', error);
    throw error;
  }
}

export default {
  suggestLayouts
};