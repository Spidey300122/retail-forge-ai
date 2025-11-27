import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/secrets.js';
import logger from '../../utils/logger.js';

const anthropic = new Anthropic({
  apiKey: config.ai.anthropic
});

/**
 * Generate compliant copy alternatives
 */
export async function generateCopy(productInfo, style = 'energetic') {
  try {
    logger.info('Generating copy with Claude');
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Generate 3 creative headline options for a ${productInfo.category} product named "${productInfo.name}". Style: ${style}. Each headline should be 3-7 words, engaging but compliant with advertising guidelines (no T&Cs, competitions, or unsubstantiated claims). Also provide a subheadline for each.

Return as JSON array with format:
[
  {"headline": "...", "subhead": "...", "rationale": "..."}
]`
        }
      ]
    });
    
    const content = message.content[0].text;
    const suggestions = JSON.parse(content);
    
    logger.info('Copy suggestions generated', { count: suggestions.length });
    
    return suggestions;
  } catch (error) {
    logger.error('Failed to generate copy', error);
    throw error;
  }
}

export default {
  generateCopy
};