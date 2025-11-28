import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('🧪 Running integration tests...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Health check
  try {
    // Note: Health check is typically at the root, not /api/health
    await axios.get('http://localhost:3000/health');
    console.log('✅ Test 1: Health check passed');
    passed++;
  } catch (error) {
    console.log('❌ Test 1: Health check failed');
    failed++;
  }

  // Test 2: AI Copy Generation
  try {
    const response = await axios.post(`${API_BASE}/ai/generate-copy`, {
      productInfo: {
        name: 'Orange Juice',
        category: 'beverages'
      },
      style: 'energetic'
    });

    if (response.data.success && response.data.data.suggestions.length > 0) {
      console.log('✅ Test 2: AI copy generation passed');
      console.log(`   Generated: "${response.data.data.suggestions[0].headline}"`);
      passed++;
    } else {
      throw new Error('No suggestions returned');
    }
  } catch (error) {
    // FIX: Closing the catch block correctly
    console.log(`❌ Test 2: AI copy generation failed. Error: ${error.message}`);
    failed++;
  } // End of Test 2 try/catch block

  // Test 3: Database query
  try {
    // FIX: Using backticks for template literal
    await axios.get(`${API_BASE}/test`);
    console.log('✅ Test 3: Database connection passed');
    passed++;
  } catch (error) {
    // FIX: Correctly logging the error
    console.log(`❌ Test 3: Database connection failed. Error: ${error.message}`);
    failed++;
  } // End of Test 3 try/catch block

  // Summary
  // FIX: Using backticks for template literal
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed');
  }
}

runTests();