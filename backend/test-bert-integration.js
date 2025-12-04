import axios from 'axios';

async function testBERTIntegration() {
  console.log('🧪 Testing BERT Integration\n');

  const tests = [
    'Fresh and delicious',
    'Win a prize now!',
    'Terms and conditions apply',
    'Eco-friendly product',
  ];

  for (const text of tests) {
    try {
      const response = await axios.post('http://localhost:8001/classify', {
        text,
        threshold: 0.7
      });

      console.log(`Text: "${text}"`);
      console.log(`  Result: ${response.data.label} (${(response.data.confidence * 100).toFixed(0)}%)`);
      console.log(`  Compliant: ${response.data.compliant}\n`);
    } catch (error) {
      console.error(`❌ Failed:`, error.message);
    }
  }
}

testBERTIntegration();