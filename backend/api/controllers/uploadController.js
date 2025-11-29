import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../temp/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const uploadMiddleware = upload.single('image');

export async function uploadImage(req, res) {
  try {
    const file = req.file;
    const { type = 'product', userId = 1 } = req.body;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }
    
    console.log('✅ File uploaded:', file.filename);
    
    res.json({
      success: true,
      data: {
        imageId: file.filename,
        url: `/uploads/${file.filename}`,
        filename: file.originalname,
        size: file.size,
        type: type
      }
    });
  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}