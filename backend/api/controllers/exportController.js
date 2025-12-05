import sharp from 'sharp';
import archiver from 'archiver';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import logger from '../../utils/logger.js';

const FORMATS = {
  instagram_post: { width: 1080, height: 1080, name: 'Instagram_Post' },
  facebook_feed: { width: 1200, height: 628, name: 'Facebook_Feed' },
  instagram_story: { width: 1080, height: 1920, name: 'Instagram_Story' },
  instore_display: { width: 1920, height: 1080, name: 'InStore_Display' },
};

/**
 * Helper: Optimize image buffer to target size
 */
async function optimizeToSize(buffer, width, height, targetKB = 500) {
  let quality = 90;
  let outputBuffer = null;
  let sizeKB = Infinity;

  // Initial resize
  let pipeline = sharp(buffer).resize(width, height, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  });

  // Iterative compression
  while (sizeKB > targetKB && quality > 10) {
    outputBuffer = await pipeline
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    
    sizeKB = outputBuffer.length / 1024;
    
    if (sizeKB > targetKB) {
      quality -= 10;
    }
  }

  return { buffer: outputBuffer, sizeKB, quality };
}

/**
 * Helper: Generate Compliance PDF Report
 */
function generateReport(complianceData) {
  const doc = new PDFDocument();
  const stream = new PassThrough();
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('Retail Forge AI - Compliance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
  doc.moveDown();

  // Status
  const score = complianceData.score || 0;
  const status = complianceData.isCompliant ? 'PASS' : 'FAIL';
  const color = complianceData.isCompliant ? 'green' : 'red';

  doc.text('Status: ', { continued: true }).fillColor(color).text(status);
  doc.fillColor('black').text(`Compliance Score: ${score}/100`);
  doc.moveDown();

  // Rules Table
  doc.fontSize(14).text('Validation Details', { underline: true });
  doc.moveDown();

  if (complianceData.violations && complianceData.violations.length > 0) {
    doc.fillColor('red').fontSize(12).text('Violations Found:');
    complianceData.violations.forEach((v, i) => {
      doc.fillColor('black').fontSize(10).text(`${i + 1}. ${v.message} (${v.severity})`);
    });
    doc.moveDown();
  } else {
    doc.fillColor('green').text('No violations found. Creative is compliant.');
    doc.moveDown();
  }

  if (complianceData.warnings && complianceData.warnings.length > 0) {
    doc.fillColor('orange').fontSize(12).text('Warnings:');
    complianceData.warnings.forEach((w, i) => {
      doc.fillColor('black').fontSize(10).text(`${i + 1}. ${w.message}`);
    });
  }

  doc.end();
  return stream;
}

/**
 * Process Export Request
 */
export async function processExport(req, res) {
  try {
    const file = req.file; // Master image from canvas
    const { formats, complianceData } = req.body;
    
    if (!file) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    const selectedFormats = JSON.parse(formats || '[]');
    const compliance = JSON.parse(complianceData || '{}');

    logger.info('Processing export', { formats: selectedFormats.length });

    // Set headers for ZIP download
    res.attachment('campaign_assets.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // 1. Process Images
    for (const formatKey of selectedFormats) {
      const formatSpec = FORMATS[formatKey];
      if (!formatSpec) continue;

      const { buffer } = await optimizeToSize(
        file.buffer, 
        formatSpec.width, 
        formatSpec.height
      );

      archive.append(buffer, { name: `${formatSpec.name}.jpg` });
    }

    // 2. Generate Report
    const reportStream = generateReport(compliance);
    archive.append(reportStream, { name: 'compliance_report.pdf' });

    // Finalize
    await archive.finalize();

  } catch (error) {
    logger.error('Export failed', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}