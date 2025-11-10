import { Router } from 'express';
import { authRequired } from '../utils/authMiddleware.js';
import * as commentController from '../controllers/commentController.js';

const router = Router();

router.get('/studio/:studioId', authRequired, commentController.listCommentsByStudio);
router.post('/', authRequired, commentController.createComment);
router.delete('/:id', authRequired, commentController.deleteComment);

export default router;


