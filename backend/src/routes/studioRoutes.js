import { Router } from 'express';
import { authRequired, roles } from '../utils/authMiddleware.js';
import * as studioController from '../controllers/studioController.js';

const router = Router();

router.get('/', authRequired, studioController.listStudios);
router.get('/public', studioController.listPublicStudios);
router.get('/insights/summary', authRequired, studioController.getStudioInsights);
router.post('/', authRequired, roles(['ADMIN', 'EDITOR']), studioController.createStudio);
router.get('/:id', authRequired, studioController.getStudio);
router.patch('/:id', authRequired, roles(['ADMIN']), studioController.updateStudio);
router.delete('/:id', authRequired, roles(['ADMIN']), studioController.deleteStudio);

export default router;


