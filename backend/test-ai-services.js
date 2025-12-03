import * as creativeDirector from './ai-engine/agents/creativeDirector.js';
import * as complianceOfficer from './ai-engine/agents/complianceOfficer.js';
import orchestrator from './ai-engine/orchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🤖 TESTING AI SERVICES\n');
console.log('='.repeat(60));

// UPDATED: A reliable, simple JPEG image from Pexels to avoid download errors
const SAFE_IMAGE_URL = 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=800';

async function testGPT4Vision() {
  console.log('\n🎨 Test 1: GPT-4 Vision (Layout Suggestions)');
  try {
    const result = await creativeDirector.suggestLayouts(
      SAFE_IMAGE_URL,
      'beverages',
      'modern'
    );

    if (result.layouts && result.layouts.length > 0) {
      console.log('✅ GPT-4 Vision working');
      console.log('   Layouts generated:', result.layouts.length);
      console.log('   First layout:', result.layouts[0].name);
      return true;
    } else {
      console.error('❌ No layouts generated');
      return false;
    }
  } catch (error) {
    console.error('❌ GPT-4 Vision failed:', error.message);
    return false;
  }
}

async function testClaudeCopy() {
  console.log('\n✍️  Test 2: Claude (Copy Generation)');
  try {
    const result = await complianceOfficer.generateCopy(
      {
        name: 'Test Orange Juice',
        category: 'beverages',
        features: ['100% natural', 'fresh'],
      },
      'energetic'
    );

    if (result && result.length === 3) {
      console.log('✅ Claude copy generation working');
      console.log('   Variations generated:', result.length);
      console.log('   Sample headline:', result[0].headline);
      return true;
    } else {
      console.error('❌ Wrong number of variations');
      return false;
    }
  } catch (error) {
    console.error('❌ Claude failed:', error.message);
    return false;
  }
}

async function testCopyValidation() {
  console.log('\n🔍 Test 3: Copy Validation');
  try {
    // Test with bad copy
    const badResult = await complianceOfficer.validateCopy('Win a prize! T&Cs apply');
    
    if (!badResult.isCompliant && badResult.violations.length > 0) {
      console.log('✅ Validation correctly detects violations');
      console.log('   Violations found:', badResult.violations.length);
    } else {
      console.error('❌ Should have detected violations');
      return false;
    }

    // Test with good copy
    // UPDATED: Using purely factual text to pass strict compliance checks
    const goodResult = await complianceOfficer.validateCopy('Available in 500ml bottles.');
    
    if (goodResult.isCompliant) {
      console.log('✅ Validation correctly passes clean copy');
      return true;
    } else {
      console.error('❌ Should have passed clean copy');
      if (goodResult.violations) {
        console.log('   Violations:', JSON.stringify(goodResult.violations, null, 2));
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

async function testOrchestrator() {
  console.log('\n🎭 Test 4: AI Orchestrator');
  try {
    const result = await orchestrator.processCreativeRequest({
      userInput: 'Create modern layout for orange juice',
      productImageUrl: SAFE_IMAGE_URL,
    });

    if (result.intent && result.recommendations) {
      console.log('✅ Orchestrator working');
      console.log('   Intent detected:', result.intent.needsLayout);
      console.log('   Recommendations:', result.recommendations.length);
      return true;
    } else {
      console.error('❌ Orchestrator failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Orchestrator failed:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  console.log('⚠️  This will use your AI API credits. Continue? (Ctrl+C to cancel)\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const gpt4Ok = await testGPT4Vision();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const claudeOk = await testClaudeCopy();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const validationOk = await testCopyValidation();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const orchestratorOk = await testOrchestrator();
  
  console.log('\n' + '='.repeat(60));
  if (gpt4Ok && claudeOk && validationOk && orchestratorOk) {
    console.log('✅ ALL AI SERVICES TESTS PASSED\n');
  } else {
    console.log('❌ SOME AI TESTS FAILED\n');
    console.log('\n💡 Common fixes:');
    console.log('   - Check API keys in .env file');
    console.log('   - Check API credit balance');
    console.log('   - Check internet connection\n');
    process.exit(1);
  }
  process.exit(0);
})();