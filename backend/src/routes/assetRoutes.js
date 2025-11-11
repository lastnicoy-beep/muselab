import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../utils/authMiddleware.js';
import * as assetController from '../controllers/assetController.js';

const router = Router();

// Configure multer with file size limits
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Basic file type validation
    const allowedMimes = [
      'audio/', 'image/', 'text/plain', 'application/pdf', 'text/'
    ];
    if (allowedMimes.some(mime => file.mimetype.startsWith(mime))) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

router.post('/upload', authRequired, upload.single('file'), assetController.uploadAsset);
router.get('/studio/:studioId', authRequired, assetController.listAssetsByStudio);
router.delete('/:id', authRequired, assetController.deleteAsset);

export default router;


