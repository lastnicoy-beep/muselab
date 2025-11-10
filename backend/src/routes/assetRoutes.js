import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../utils/authMiddleware.js';
import * as assetController from '../controllers/assetController.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authRequired, upload.single('file'), assetController.uploadAsset);
router.get('/studio/:studioId', authRequired, assetController.listAssetsByStudio);
router.delete('/:id', authRequired, assetController.deleteAsset);

export default router;


