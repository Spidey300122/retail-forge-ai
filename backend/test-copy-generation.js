import * as complianceOfficer from './ai-engine/agents/complianceOfficer.js';
import dotenv from 'dotenv';

dotenv.config();

async function testCopyGeneration() {
  console.log('🧪 Testing Copy Generation\n');
  
  const testProducts = [
    {
      name: 'Fresh Orange Juice',
      category: 'beverages',
      features: ['100% pure', 'No sugar added', 'Fresh squeezed'],
      audience: 'health-conscious families'
    },
    {
      name: 'Luxury Hand Cream',
      category: 'beauty',
      features: ['Shea butter enriched', 'Fast absorbing', 'Long-lasting moisture'],
      audience: 'women 30-50'
    },
    {
      name: 'Wireless Earbuds Pro',
      category: 'electronics',
      features: ['Active noise cancellation', '30hr battery', 'Premium sound'],
      audience: 'tech enthusiasts'
    }
  ];
  
  const styles = ['energetic', 'elegant', 'minimal'];
  
  for (const product of testProducts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Product: ${product.name} (${product.category})`);
    console.log(`${'='.repeat(60)}\n`);
    
    for (const style of styles) {
      try {
        console.log(`\n🎨 Style: ${style.toUpperCase()}\n`);
        
        const suggestions = await complianceOfficer.generateCopy(product, style);
        
        suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. Headline: "${suggestion.headline}"`);
          console.log(`   Subhead: "${suggestion.subhead}"`);
          console.log(`   Rationale: ${suggestion.rationale}`);
          console.log(`   Compliance: ${suggestion.complianceNotes}\n`);
        });
        
        // Test validation on first headline
        console.log(`\n🔍 Validating first headline...\n`);
        const validation = await complianceOfficer.validateCopy(suggestions[0].headline);
        console.log(`   ✓ Compliant: ${validation.isCompliant}`);
        console.log(`   ✓ Score: ${validation.score}/100`);
        if (validation.violations?.length > 0) {
          console.log(`   ⚠️  Violations:`, validation.violations);
        }
        
      } catch (error) {
        console.error(`❌ Error for ${style}:`, error.message);
      }
    }
  }
  
  // Test prohibited content
  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`⚠️  Testing Prohibited Content Detection`);
  console.log(`${'='.repeat(60)}\n`);
  
  const prohibitedExamples = [
    "Win a £1000 prize! T&Cs apply.",
    "The best juice you'll ever taste, guaranteed!",
    "100% eco-friendly and saves the planet",
    "Support our charity partner with every purchase"
  ];
  
  for (const text of prohibitedExamples) {
    console.log(`\nTesting: "${text}"`);
    try {
      const validation = await complianceOfficer.validateCopy(text);
      console.log(`  Compliant: ${validation.isCompliant}`);
      console.log(`  Violations: ${validation.violations?.length || 0}`);
      if (validation.violations?.length > 0) {
        validation.violations.forEach(v => {
          console.log(`    - ${v.type}: ${v.message}`);
        });
      }
    } catch (error) {
      console.error(`  Error:`, error.message);
    }
  }
  
  console.log('\n\n✅ Copy generation tests complete!\n');
}

testCopyGeneration();