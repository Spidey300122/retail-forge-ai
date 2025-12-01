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
      // REMOVED: response_format: { type: "json_object" } 
      // strict mode often causes empty responses with Vision inputs
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a creative director for retail media campaigns. Analyze this ${category} product image and suggest 3 layout options for a 1080x1080px Instagram post in ${style} style.

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
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });
    
    const choice = response.choices[0];
    
    // Check for safety refusals
    if (choice.message.refusal) {
        logger.warn('AI refused request', { refusal: choice.message.refusal });
        throw new Error(`AI Refusal: ${choice.message.refusal}`);
    }

    let rawText = choice.message.content;
    const finishReason = choice.finish_reason;

    if (!rawText) {
        // Use warn for data logging to avoid logger.error schema issues
        logger.warn('AI returned empty content', { finishReason });
        throw new Error(`AI returned empty response (Reason: ${finishReason})`);
    }

    // Clean potential markdown wrappers
    rawText = cleanJsonString(rawText);
    
    let suggestions;
    try {
      suggestions = JSON.parse(rawText);
    } catch (parseError) {
      logger.warn('Failed to parse GPT-4 response', { rawText });
      throw new Error('Invalid JSON response from AI');
    }
    
    // Robust validation
    if (!suggestions || !suggestions.layouts || !Array.isArray(suggestions.layouts)) {
      logger.warn('Invalid layout response structure', { parsed: suggestions });
      throw new Error('Invalid layout response structure');
    }
    
    // Cache result (1 hour)
    await aiCache.set('layouts', requestData, suggestions, 3600);
    
    logger.info('Layout suggestions generated', { count: suggestions.layouts.length });
    
    return suggestions;
  } catch (error) {
    // Pass error object correctly to logger.error
    logger.error('Failed to generate layout suggestions', error);
    throw error;
  }
}

export default {
  suggestLayouts
};