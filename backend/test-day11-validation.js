// backend/test-day11-validation.js
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/validate';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n🧪 Day 11 Validation Engine Tests\n');
  console.log('='.repeat(60));

  // Test 1: Get All Rules
  await test('Get all rules', async () => {
    const response = await axios.get(`${API_BASE}/rules`);
    if (!response.data.success) throw new Error('Failed to get rules');
    if (response.data.data.totalRules < 15) {
      throw new Error(`Expected 15+ rules, got ${response.data.data.totalRules}`);
    }
    console.log(`   Found ${response.data.data.totalRules} rules`);
  });

  // Test 2: Compliant Creative
  await test('Validate compliant creative', async () => {
    const creativeData = {
      format: 'instagram_post',
      backgroundColor: '#ffffff',
      elements: [
        {
          type: 'text',
          content: 'Fresh and delicious',
          fontSize: 32,
          fill: '#000000',
          left: 100,
          top: 100,
        },
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    if (!response.data.success) throw new Error('Validation failed');
    if (!response.data.data.isCompliant) {
      throw new Error('Should be compliant');
    }
    console.log(`   Score: ${response.data.data.score}/100`);
  });

  // Test 3: Detect T&Cs Violation
  await test('Detect T&Cs violation', async () => {
    const creativeData = {
      format: 'instagram_post',
      text: 'Great offer! T&Cs apply.',
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    if (response.data.data.isCompliant) {
      throw new Error('Should detect T&Cs violation');
    }
    if (response.data.data.violations.length === 0) {
      throw new Error('Should have violations');
    }
    console.log(`   Detected: ${response.data.data.violations[0].message}`);
  });

  // Test 4: Detect Font Size Violation
  await test('Detect minimum font size violation', async () => {
    const creativeData = {
      format: 'instagram_post',
      elements: [
        { type: 'text', fontSize: 12 },
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    if (response.data.data.isCompliant) {
      throw new Error('Should detect font size violation');
    }
  });

  // Test 5: Detect Competition Language
  await test('Detect competition language', async () => {
    const creativeData = {
      headline: 'Win amazing prizes!',
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    if (response.data.data.isCompliant) {
      throw new Error('Should detect competition language');
    }
  });

  // Test 6: Get Rules by Category
  await test('Get rules by category', async () => {
    const response = await axios.get(`${API_BASE}/rules/content`);
    if (!response.data.success) throw new Error('Failed to get content rules');
    console.log(`   Content rules: ${response.data.data.rules.length}`);
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All validation tests passed! Day 11 complete!\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});