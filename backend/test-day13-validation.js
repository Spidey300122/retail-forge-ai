// backend/test-day13-validation.js
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
  console.log('\n🧪 Day 13 Complete Validation Engine Tests\n');
  console.log('='.repeat(60));

  // Test 1: Clubcard Date Format - Valid
  await test('Clubcard date format - valid DD/MM', async () => {
    const creativeData = {
      format: 'instagram_post',
      valueTile: { type: 'clubcard' },
      tag: { text: 'Clubcard/app required. Ends 25/12' },
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    if (!response.data.success) throw new Error('Validation failed');

    const dateViolation = response.data.data.violations.find(
      v => v.ruleId === 'clubcard_date_format'
    );

    if (dateViolation) {
      throw new Error('Should pass valid date format');
    }
  });

  // Test 2: Clubcard Date Format - Invalid Day
  await test('Clubcard date format - invalid day', async () => {
    const creativeData = {
      valueTile: { type: 'clubcard' },
      tag: { text: 'Clubcard required. Ends 35/06' },
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    const dateViolation = response.data.data.violations.find(
      v => v.ruleId === 'clubcard_date_format'
    );

    if (!dateViolation) {
      throw new Error('Should detect invalid day');
    }
  });

  // Test 3: Maximum Packshots
  await test('Maximum 3 packshots rule', async () => {
    const creativeData = {
      elements: [
        { type: 'packshot' },
        { type: 'packshot' },
        { type: 'packshot' },
        { type: 'packshot' }, // 4th packshot - should fail
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    const violation = response.data.data.violations.find(
      v => v.ruleId === 'max_packshots'
    );

    if (!violation) {
      throw new Error('Should detect too many packshots');
    }
  });

  // Test 4: Element Hierarchy
  await test('Element hierarchy - packshot closest to CTA', async () => {
    const creativeData = {
      format: 'instagram_post',
      cta: { x: 540, y: 950 },
      elements: [
        { type: 'packshot', left: 540, top: 700 }, // 250px from CTA
        { type: 'text', left: 540, top: 850 }, // 100px from CTA - violates hierarchy
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    const violation = response.data.data.violations.find(
      v => v.ruleId === 'element_hierarchy'
    );

    if (!violation) {
      throw new Error('Should detect hierarchy violation');
    }
  });

  // Test 5: CTA Position
  await test('CTA positioning rule', async () => {
    const creativeData = {
      format: 'instagram_post',
      cta: { x: 540, y: 950 }, // Correct position
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    const violation = response.data.data.violations.find(
      v => v.ruleId === 'cta_position'
    );

    if (violation) {
      throw new Error('Should pass correct CTA position');
    }
  });

  // Test 6: Background Color Validation
  await test('Background color validation', async () => {
    const creativeData = {
      backgroundColor: '#FFFFFF',
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    const warning = response.data.data.warnings.find(
      w => w.ruleId === 'background_color'
    );

    // White background should pass
    if (warning) {
      throw new Error('White background should pass');
    }
  });

  // Test 7: All Rules Count
  await test('All 15 rules loaded', async () => {
    const response = await axios.get(`${API_BASE}/rules`);
    if (!response.data.success) throw new Error('Failed to get rules');

    console.log(`   Total rules: ${response.data.data.totalRules}`);

    if (response.data.data.totalRules < 15) {
      throw new Error(`Expected 15+ rules, got ${response.data.data.totalRules}`);
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Day 13 complete!\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});