import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/secrets.js';
import logger from '../../utils/logger.js';

const anthropic = new Anthropic({
  apiKey: config.ai.anthropic
});

// Helper function to extract JSON from a potential Markdown response
function extractJsonFromMarkdown(text) {
  // Use regex to find and extract content between ```json and ```
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    // Return only the raw JSON content
    return match[1];
  }
  // If no markdown wrapper is found, assume the whole text is JSON
  return text;
}

/**
 * Generate compliant copy alternatives
 */
export async function generateCopy(productInfo, style = 'energetic') {
  try {
    logger.info('Generating copy with Claude using prompt guidance');
    
    const message = await anthropic.messages.create({
      // Use the model alias that currently works without the response_format parameter
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Generate 3 creative headline options for a ${productInfo.category} product named "${productInfo.name}". Style: ${style}. Each headline should be 3-7 words, engaging but compliant with advertising guidelines (no T&Cs, competitions, or unsubstantiated claims). Also provide a subheadline and rationale for each.

IMPORTANT: Return your response ONLY as a raw JSON array. DO NOT include any introductory text or markdown wrappers (like \`\`\`json\`).

Format:
[
  {"headline": "...", "subhead": "...", "rationale": "..."},
  {"headline": "...", "subhead": "...", "rationale": "..."},
  {"headline": "...", "subhead": "...", "rationale": "..."}
]`
        }
      ]
    });
    
    const contentText = message.content[0].text;
    
    // Use the robust parsing function to handle potential markdown formatting
    const rawJson = extractJsonFromMarkdown(contentText);
    const suggestions = JSON.parse(rawJson);
    
    logger.info('Copy suggestions generated and parsed successfully', { count: suggestions.length });
    
    return suggestions;
  } catch (error) {
    logger.error('Failed to generate copy or parse JSON response', error);
    throw error;
  }
}

export default {
  generateCopy
};
