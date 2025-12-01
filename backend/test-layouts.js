import * as creativeDirector from './ai-engine/agents/creativeDirector.js';
import dotenv from 'dotenv';

dotenv.config();

async function testLayouts() {
  console.log('🧪 Testing GPT-4 Vision Layout Suggestions...\n');

  try {
    // Use a sample image URL (replace with your test image)
    const testImageUrl = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800';
    
    const result = await creativeDirector.suggestLayouts(
      testImageUrl,
      'beverages',
      'modern'
    );

    console.log('✅ Success! Generated', result.layouts.length, 'layouts\n');
    
    result.layouts.forEach((layout, index) => {
      console.log(`${index + 1}. ${layout.name}`);
      console.log(`   Description: ${layout.description}`);
      console.log(`   Rationale: ${layout.rationale}`);
      console.log('   Elements:', JSON.stringify(layout.elements, null, 2));
      console.log('');
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

testLayouts();