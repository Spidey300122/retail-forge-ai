import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testAnthropic() {
  try {
    console.log('Testing Anthropic API...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      messages: [
        { role: "user", content: "Say 'Claude is working!'" }
      ]
    });
    
    console.log('✅ Anthropic API works!');
    console.log('Response:', message.content[0].text);
  } catch (error) {
    console.error('❌ Anthropic API error:', error.message);
  }
}

testAnthropic();