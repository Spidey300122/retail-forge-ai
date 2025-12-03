import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_SERVICE = 'http://localhost:8000';

console.log('\n🖼️  TESTING IMAGE PROCESSING SERVICE\n');
console.log('='.repeat(60));

// Use existing test-image.jpg or create a minimal PNG
function getTestImage() {
  const preferredPath = join(__dirname, 'test-image.jpg');
  
  if (fs.existsSync(preferredPath)) {
    return preferredPath;
  }

  console.log('⚠️ test-image.jpg not found, creating temp PNG...');
  
  // Create a minimal 1x1 Red PNG
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const tempPath = join(__dirname, 'temp', 'test-image.png');
  
  if (!fs.existsSync(join(__dirname, 'temp'))) {
    fs.mkdirSync(join(__dirname, 'temp'));
  }
  
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

async function testColorExtraction() {
  console.log('\n🎨 Test 1: Color Extraction');
  try {
    const testImagePath = getTestImage();
    
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
    console.error('❌ Color extraction failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testImageOptimization() {
  console.log('\n🗜️  Test 2: Image Optimization');
  try {
    const testImagePath = getTestImage();
    
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
    console.error('❌ Optimization failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run tests
(async () => {
  const colorOk = await testColorExtraction();
  const optimizeOk = await testImageOptimization();
  
  // Cleanup temp file if created
  try {
    const tempPath = join(__dirname, 'temp', 'test-image.png');
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  } catch (e) {}
  
  console.log('\n' + '='.repeat(60));
  if (colorOk && optimizeOk) {
    console.log('✅ ALL IMAGE PROCESSING TESTS PASSED\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED\n');
    process.exit(1);
  }
})();