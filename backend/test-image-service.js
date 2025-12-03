import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_SERVICE = 'http://localhost:8000';

console.log('\n🖼️  TESTING IMAGE PROCESSING SERVICE\n');
console.log('='.repeat(60));

// Create a test image
function createTestImage() {
  const canvas = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="#FF5733"/>
  <circle cx="200" cy="200" r="100" fill="#3498DB"/>
</svg>
  `.trim();
  
  const path = 'temp/test-image.svg';
  fs.mkdirSync('temp', { recursive: true });
  fs.writeFileSync(path, canvas);
  return path;
}

async function testColorExtraction() {
  console.log('\n🎨 Test 1: Color Extraction');
  try {
    // Create test image
    const testImagePath = createTestImage();
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    formData.append('count', 3);

    const response = await axios.post(
      `${IMAGE_SERVICE}/process/extract-colors`,
      formData,
      { headers: formData.getHeaders(), timeout: 10000 }
    );

    if (response.data.success && response.data.colors.length > 0) {
      console.log('✅ Color extraction working');
      console.log('   Colors found:', response.data.colors.length);
      console.log('   Sample:', response.data.colors[0].hex);
      return true;
    } else {
      console.error('❌ No colors extracted');
      return false;
    }
  } catch (error) {
    console.error('❌ Color extraction failed:', error.message);
    return false;
  }
}

async function testImageOptimization() {
  console.log('\n🗜️  Test 2: Image Optimization');
  try {
    const testImagePath = createTestImage();
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));
    formData.append('target_size_kb', 100);
    formData.append('format', 'JPEG');

    const response = await axios.post(
      `${IMAGE_SERVICE}/process/optimize`,
      formData,
      { headers: formData.getHeaders(), timeout: 10000 }
    );

    if (response.data.success && response.data.size_kb) {
      console.log('✅ Image optimization working');
      console.log('   Output size:', response.data.size_kb, 'KB');
      return true;
    } else {
      console.error('❌ Optimization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Optimization failed:', error.message);
    return false;
  }
}

// Run tests
(async () => {
  const colorOk = await testColorExtraction();
  const optimizeOk = await testImageOptimization();
  
  // Cleanup
  try {
    fs.unlinkSync('temp/test-image.svg');
  } catch (e) {}
  
  console.log('\n' + '='.repeat(60));
  if (colorOk && optimizeOk) {
    console.log('✅ ALL IMAGE PROCESSING TESTS PASSED\n');
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
  process.exit(0);
})();
