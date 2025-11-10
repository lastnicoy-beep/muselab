import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/oauth', authController.oauth);
router.get('/github/callback', authController.githubCallback);

export default router;


