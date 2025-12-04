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
  console.log('\n🧪 Day 14 Validation UI Tests\n');
  console.log('='.repeat(60));

  // Test 1: Compliant creative
  await test('Validate fully compliant creative', async () => {
    const creativeData = {
      format: 'instagram_post',
      backgroundColor: '#ffffff',
      elements: [
        {
          type: 'text',
          content: 'Fresh and delicious',
          fontSize: 32,
          fill: '#000000',
          left: 540,
          top: 540,
          width: 300,
          height: 40,
        },
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    
    if (!response.data.success) throw new Error('Validation failed');
    if (!response.data.data.isCompliant) throw new Error('Should be compliant');
    if (response.data.data.score < 90) throw new Error(`Score too low: ${response.data.data.score}`);
    
    console.log(`   Score: ${response.data.data.score}/100`);
  });

  // Test 2: Font size violation
  await test('Detect font size violation', async () => {
    const creativeData = {
      format: 'instagram_post',
      elements: [
        { type: 'text', fontSize: 12, content: 'Too small' }
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    
    if (response.data.data.isCompliant) {
      throw new Error('Should detect font size violation');
    }
    
    const violation = response.data.data.violations.find(v => v.ruleId === 'min_font_size');
    if (!violation) throw new Error('Font size violation not found');
    
    console.log(`   Detected: ${violation.message}`);
  });

  // Test 3: WCAG contrast violation
  await test('Detect WCAG contrast violation', async () => {
    const creativeData = {
      format: 'instagram_post',
      backgroundColor: '#ffffff',
      elements: [
        { type: 'text', fill: '#eeeeee', fontSize: 24, content: 'Low contrast' }
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    
    const violation = response.data.data.violations.find(v => v.ruleId === 'wcag_contrast');
    if (!violation) throw new Error('Contrast violation not detected');
    
    console.log(`   Detected: ${violation.message}`);
  });

  // Test 4: Multiple violations
  await test('Handle multiple violations', async () => {
    const creativeData = {
      format: 'instagram_post',
      text: 'Win a prize! T&Cs apply.',
      backgroundColor: '#ffffff',
      elements: [
        { type: 'text', fontSize: 12, fill: '#cccccc', content: 'Bad text' }
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    
    if (response.data.data.violations.length < 2) {
      throw new Error('Should detect multiple violations');
    }
    
    console.log(`   Violations: ${response.data.data.violations.length}`);
  });

  // Test 5: Social safe zone
  await test('Detect social safe zone violation', async () => {
    const creativeData = {
      format: 'instagram_story',
      elements: [
        { type: 'text', top: 50, height: 50, content: 'Too close to top' }
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    
    const violation = response.data.data.violations.find(v => v.ruleId === 'social_safe_zone');
    if (!violation) throw new Error('Safe zone violation not detected');
    
    console.log(`   Detected: ${violation.message}`);
  });

  // Test 6: Get all rules
  await test('Get all rules endpoint', async () => {
    const response = await axios.get(`${API_BASE}/rules`);
    
    if (!response.data.success) throw new Error('Failed to get rules');
    if (response.data.data.totalRules < 15) {
      throw new Error(`Expected 15+ rules, got ${response.data.data.totalRules}`);
    }
    
    console.log(`   Total rules: ${response.data.data.totalRules}`);
  });

  // Test 7: Suggestions provided
  await test('Violations include suggestions', async () => {
    const creativeData = {
      format: 'instagram_post',
      elements: [
        { type: 'text', fontSize: 12, content: 'Small text' }
      ],
    };

    const response = await axios.post(`${API_BASE}/creative`, { creativeData });
    
    const violation = response.data.data.violations[0];
    if (!violation.suggestion) {
      throw new Error('Violation should include suggestion');
    }
    
    console.log(`   Suggestion: ${violation.suggestion}`);
  });

  // Test 8: Processing time reasonable
  await test('Validation completes in under 1 second', async () => {
    const start = Date.now();
    
    const creativeData = {
      format: 'instagram_post',
      elements: [
        { type: 'text', fontSize: 24, content: 'Test' }
      ],
    };

    await axios.post(`${API_BASE}/creative`, { creativeData });
    
    const duration = Date.now() - start;
    if (duration > 1000) {
      throw new Error(`Took ${duration}ms (should be < 1000ms)`);
    }
    
    console.log(`   Duration: ${duration}ms`);
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Day 14 complete!\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});