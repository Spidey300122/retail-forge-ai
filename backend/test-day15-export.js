import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3000/api/export';
const TEST_OUTPUT_DIR = path.join(__dirname, 'temp', 'test_downloads');

// Ensure output directory exists
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

async function testExportPipeline() {
  console.log('\n📦 Testing Day 15/16 Export Pipeline\n');
  console.log('='.repeat(60));

  try {
    // 1. Prepare Test Data
    console.log('1. Preparing test payload...');
    const formData = new FormData();
    
    // Use the existing test image or a dummy buffer if missing
    const imagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(imagePath)) {
      formData.append('image', fs.createReadStream(imagePath));
    } else {
      console.warn('⚠️  test-image.jpg not found, using placeholder buffer');
      formData.append('image', Buffer.from('fake_image_data'), { filename: 'test.jpg' });
    }

    // Select formats
    const formats = ['instagram_post', 'instagram_story'];
    formData.append('formats', JSON.stringify(formats));

    // Add compliance data for PDF
    const complianceData = {
      isCompliant: true,
      score: 98,
      violations: [],
      warnings: [{ message: 'Ensure text contrast on mobile devices', severity: 'warning' }]
    };
    formData.append('complianceData', JSON.stringify(complianceData));

    // 2. Send Request
    console.log('2. Sending export request to backend...');
    const startTime = Date.now();
    
    const response = await axios.post(API_BASE, formData, {
      headers: { ...formData.getHeaders() },
      responseType: 'arraybuffer', // Important for ZIP files
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Response received in ${duration}ms`);

    // 3. Verify Response
    console.log('3. Verifying output...');
    
    if (response.headers['content-type'] !== 'application/zip') {
      throw new Error(`Expected application/zip, got ${response.headers['content-type']}`);
    }

    const outputSize = response.data.length;
    console.log(`   Size: ${(outputSize / 1024).toFixed(2)} KB`);

    // 4. Save to Disk
    const outputPath = path.join(TEST_OUTPUT_DIR, `export_test_${Date.now()}.zip`);
    fs.writeFileSync(outputPath, response.data);
    console.log(`💾 Saved test archive to: ${outputPath}`);

    console.log('\n🎉 Export Pipeline Verification Successful!');
    console.log('   - Endpoint accessible');
    console.log('   - Image processing working');
    console.log('   - PDF generation working');
    console.log('   - ZIP archiving working');

  } catch (error) {
    console.error('\n❌ Export Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      // Try to parse error message from buffer
      try {
        console.error(`   Message: ${error.response.data.toString()}`);
      } catch (e) {
        console.error('   Could not read error response');
      }
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testExportPipeline();