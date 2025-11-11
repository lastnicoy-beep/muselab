import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/oauth', authController.oauth);
router.get('/github/callback', authController.githubCallback);

// Minimal Google OAuth callback route
router.get('/google/callback', (req, res) => {
  if (!req.query.code) {
    return res.status(400).json({ error: 'Missing code' });
  }
  return res.json({ ok: true, code: req.query.code });
});

export default router;


