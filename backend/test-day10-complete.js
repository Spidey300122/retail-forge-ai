import orchestrator from './ai-engine/orchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

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
  console.log('\n🧪 Day 10 Complete Test Suite\n');
  console.log('='.repeat(60));

  // Test 1: Intent Analysis
  await test('Intent analysis detects layout need', async () => {
    const intent = await orchestrator.analyzeIntent('Create a modern layout for my product');
    if (!intent.needsLayout) throw new Error('Should detect layout need');
    if (intent.style !== 'modern') throw new Error('Should detect modern style');
  });

  // Test 2: Intent Analysis - Copy
  await test('Intent analysis detects copy need', async () => {
    const intent = await orchestrator.analyzeIntent('Write energetic headline for juice');
    if (!intent.needsCopy) throw new Error('Should detect copy need');
    if (intent.category !== 'beverages') throw new Error('Should detect beverages category');
  });

  // Test 3: Category Detection
  await test('Category detection works', async () => {
    const beverageIntent = await orchestrator.analyzeIntent('orange juice product');
    if (beverageIntent.category !== 'beverages') throw new Error('Should detect beverages');

    const electronicsIntent = await orchestrator.analyzeIntent('new smartphone launch');
    if (electronicsIntent.category !== 'electronics') throw new Error('Should detect electronics');
  });

  // Test 4: Style Detection
  await test('Style detection works', async () => {
    const modernIntent = await orchestrator.analyzeIntent('modern sleek design');
    if (modernIntent.style !== 'modern') throw new Error('Should detect modern');

    const minimalIntent = await orchestrator.analyzeIntent('simple minimal layout');
    if (minimalIntent.style !== 'minimal') throw new Error('Should detect minimal');
  });

  // Test 5: Process Creative Request
  await test('Process creative request with layout', async () => {
    const result = await orchestrator.processCreativeRequest({
      userInput: 'Create a modern layout',
      productImageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    });

    if (!result.intent) throw new Error('Should have intent');
    if (!result.layouts) throw new Error('Should have layouts');
  });

  // Test 6: Process Creative Request with Copy
  await test('Process creative request with copy', async () => {
    const result = await orchestrator.processCreativeRequest({
      userInput: 'Write copy for orange juice',
      productInfo: {
        name: 'Fresh Orange Juice',
        category: 'beverages',
      },
    });

    if (!result.copy) throw new Error('Should have copy');
    if (result.copy.length !== 3) throw new Error('Should have 3 variations');
  });

  // Test 7: Compliance Validation
  await test('Compliance validation detects violations', async () => {
    const result = await orchestrator.validateCompliance({
      text: 'Win a prize! T&Cs apply',
      fontSize: 18,
    });

    if (result.isCompliant) throw new Error('Should detect violations');
    if (result.violations.length === 0) throw new Error('Should have violations');
  });

  // Test 8: Compliance Validation Passes Clean Content
  await test('Compliance validation passes clean content', async () => {
    const result = await orchestrator.validateCompliance({
      text: 'Fresh and delicious',
      fontSize: 24,
    });

    if (!result.isCompliant) throw new Error('Should pass clean content');
  });

  // Test 9: Suggest Improvements
  await test('Suggest improvements for low quality', async () => {
    const suggestions = await orchestrator.suggestImprovements({
      images: [{ width: 500, height: 500 }],
      elements: [{ type: 'text', fontSize: 18 }],
    });

    if (suggestions.suggestions.length === 0) {
      throw new Error('Should suggest improvements');
    }
  });

  // Test 10: Generate Complete Creative
  await test('Generate complete creative package', async () => {
    const result = await orchestrator.generateCompleteCreative({
      productImageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
      productInfo: {
        name: 'Orange Juice',
        category: 'beverages',
      },
      style: 'modern',
    });

    if (!result.layouts || result.layouts.length === 0) {
      throw new Error('Should have layouts');
    }
    if (!result.copy || result.copy.length === 0) {
      throw new Error('Should have copy');
    }
  });

  // Test 11: Contrast Calculation
  await test('Contrast calculation works', async () => {
    const contrast1 = orchestrator.calculateContrast('#000000', '#ffffff');
    if (contrast1 < 20) throw new Error('Black/white should have high contrast');

    const contrast2 = orchestrator.calculateContrast('#888888', '#999999');
    if (contrast2 > 2) throw new Error('Similar grays should have low contrast');
  });

  // Summary Output
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Day 10 complete!\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

runAllTests();
