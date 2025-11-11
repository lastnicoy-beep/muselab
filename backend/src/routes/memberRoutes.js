import { Router } from 'express';
import { authRequired } from '../utils/authMiddleware.js';
import * as memberController from '../controllers/memberController.js';

const router = Router();

router.get('/studio/:studioId', authRequired, memberController.listMembers);
router.post('/studio/:studioId', authRequired, memberController.addMember);
router.patch('/:memberId/studio/:studioId', authRequired, memberController.updateMember);
router.delete('/:memberId/studio/:studioId', authRequired, memberController.removeMember);

export default router;

