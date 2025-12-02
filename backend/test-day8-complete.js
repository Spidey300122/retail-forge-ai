import * as complianceOfficer from './ai-engine/agents/complianceOfficer.js';
import * as aiController from './api/controllers/aiController.js';
import dotenv from 'dotenv';

dotenv.config();

let passed = 0;
let failed = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      console.log(`✅ ${name}`);
      passed++;
    })
    .catch(error => {
      console.error(`❌ ${name}`);
      console.error(`   Error: ${error.message}`);
      failed++;
    });
}

async function runAllTests() {
  console.log('\n🧪 Day 8 Complete Test Suite\n');
  console.log('='.repeat(60));
  
  // Test 1: Basic copy generation
  await test('Copy generation returns 3 suggestions', async () => {
    const result = await complianceOfficer.generateCopy({
      name: 'Test Product',
      category: 'beverages',
      features: ['natural', 'refreshing']
    }, 'energetic');
    
    if (result.length !== 3) {
      throw new Error(`Expected 3 suggestions, got ${result.length}`);
    }
  });
  
  // Test 2: Headlines under 50 chars
  await test('Headlines are under 50 characters', async () => {
    const result = await complianceOfficer.generateCopy({
      name: 'Fresh Juice',
      category: 'beverages'
    }, 'minimal');
    
    result.forEach((s, i) => {
      if (s.headline.length > 50) {
        throw new Error(`Headline ${i + 1} is ${s.headline.length} chars (max 50)`);
      }
    });
  });
  
  // Test 3: All styles work
  await test('All 5 styles generate copy', async () => {
    const styles = ['energetic', 'elegant', 'minimal', 'playful', 'professional'];
    
    for (const style of styles) {
      const result = await complianceOfficer.generateCopy({
        name: 'Test',
        category: 'food'
      }, style);
      
      if (!result || result.length === 0) {
        throw new Error(`Style "${style}" failed`);
      }
    }
  });
  
  // Test 4: Prohibited content detection
  await test('Validates and rejects T&Cs text', async () => {
    const result = await complianceOfficer.validateCopy('Great offer! T&Cs apply.');
    
    if (result.isCompliant) {
      throw new Error('Should have detected T&Cs violation');
    }
  });
  
  // Test 5: Compliant text passes
  await test('Validates and accepts compliant text', async () => {
    const result = await complianceOfficer.validateCopy('Fresh and delicious every day');
    
    if (!result.isCompliant) {
      throw new Error('Should have passed compliant text');
    }
  });
  
  // Test 6: Response structure
  await test('Response has all required fields', async () => {
    const result = await complianceOfficer.generateCopy({
      name: 'Product',
      category: 'beauty'
    }, 'elegant');
    
    result.forEach((s, i) => {
      if (!s.headline || !s.subhead || !s.rationale || !s.complianceNotes) {
        throw new Error(`Suggestion ${i + 1} missing required fields`);
      }
    });
  });
  
  // Test 7: Empty product name handling
  await test('Handles missing product info gracefully', async () => {
    try {
      await complianceOfficer.generateCopy({
        name: '',
        category: 'food'
      });
      // If it doesn't throw, that's okay - just check result
    } catch (error) {
      // Expected behavior - empty name might cause error
      if (!error.message.includes('name') && !error.message.includes('product')) {
        throw error;
      }
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

runAllTests();