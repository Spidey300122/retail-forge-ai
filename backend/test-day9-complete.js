// backend/test-day9-complete.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const IMAGE_SERVICE = 'http://localhost:8000';

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
  console.log('\n🧪 Day 9 Complete Test Suite\n');
  console.log('='.repeat(60));
  
  // Test 1: Health Check
  await test('Image service is running', async () => {
    const response = await axios.get(`${IMAGE_SERVICE}/health`);
    if (!response.data.status === 'healthy') {
      throw new Error('Service not healthy');
    }
  });
  
  // Test 2: Generate Professional Background
  await test('Generate professional background', async () => {
    console.log('   ⏳ Generating (this takes ~10-15 seconds)...');
    
    const formData = new FormData();
    formData.append('prompt', 'soft blue gradient background');
    formData.append('style', 'professional');
    formData.append('width', '1024');
    formData.append('height', '1024');
    
    const response = await axios.post(
      `${IMAGE_SERVICE}/process/generate-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000 // 60 second timeout
      }
    );
    
    if (!response.data.success) {
      throw new Error('Generation failed');
    }
    
    if (!response.data.download_url) {
      throw new Error('No download URL returned');
    }
    
    console.log(`   ✨ Generated in ${response.data.metadata.processing_time_seconds}s`);
    console.log(`   📦 File size: ${response.data.metadata.file_size_kb}KB`);
  });
  
  // Test 3: Generate Vibrant Background
  await test('Generate vibrant style background', async () => {
    console.log('   ⏳ Generating vibrant background...');
    
    const formData = new FormData();
    formData.append('prompt', 'colorful abstract patterns');
    formData.append('style', 'vibrant');
    formData.append('width', '1080');
    formData.append('height', '1080');
    
    const response = await axios.post(
      `${IMAGE_SERVICE}/process/generate-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000
      }
    );
    
    if (!response.data.success || !response.data.download_url) {
      throw new Error('Generation failed');
    }
    
    console.log(`   ✨ Generated in ${response.data.metadata.processing_time_seconds}s`);
  });
  
  // Test 4: File Size Check
  await test('Generated image is under 500KB', async () => {
    const formData = new FormData();
    formData.append('prompt', 'minimal white background');
    formData.append('style', 'minimal');
    
    const response = await axios.post(
      `${IMAGE_SERVICE}/process/generate-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000
      }
    );
    
    const sizeKB = response.data.metadata.file_size_kb;
    if (sizeKB > 500) {
      throw new Error(`File too large: ${sizeKB}KB (max 500KB)`);
    }
    
    console.log(`   📦 File size: ${sizeKB}KB ✓`);
  });
  
  // Test 5: Different Dimensions
  await test('Generate non-square dimensions', async () => {
    const formData = new FormData();
    formData.append('prompt', 'modern gradient');
    formData.append('style', 'modern');
    formData.append('width', '1920');
    formData.append('height', '1080');
    
    const response = await axios.post(
      `${IMAGE_SERVICE}/process/generate-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000
      }
    );
    
    if (!response.data.success) {
      throw new Error('Generation failed');
    }
    
    const dims = response.data.metadata.dimensions;
    if (dims.width !== 1920 || dims.height !== 1080) {
      throw new Error(`Wrong dimensions: ${dims.width}x${dims.height}`);
    }
  });
  
  // Test 6: Download Generated Image
  await test('Download generated background', async () => {
    const formData = new FormData();
    formData.append('prompt', 'test background');
    formData.append('style', 'professional');
    
    const genResponse = await axios.post(
      `${IMAGE_SERVICE}/process/generate-background`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000
      }
    );
    
    const downloadUrl = `${IMAGE_SERVICE}${genResponse.data.download_url}`;
    
    const downloadResponse = await axios.get(downloadUrl, {
      responseType: 'arraybuffer'
    });
    
    if (downloadResponse.data.length === 0) {
      throw new Error('Downloaded file is empty');
    }
    
    console.log(`   📥 Downloaded ${downloadResponse.data.length} bytes`);
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Day 9 complete!\n');
    console.log('✨ Background generation is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
    process.exit(1);
  }
}

// Run tests
console.log('⚠️  NOTE: These tests will take 1-2 minutes due to AI generation time');
console.log('⚠️  Make sure you have STABILITY_API_KEY in your .env file\n');

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});