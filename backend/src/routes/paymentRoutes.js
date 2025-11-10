import { Router } from 'express';
import { authRequired, roles } from '../utils/authMiddleware.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.post('/', authRequired, paymentController.createPayment);
router.get('/my', authRequired, paymentController.getMyPayments);
router.get('/:id', authRequired, paymentController.getPaymentInfo);
router.put('/:id/proof', authRequired, paymentController.uploadProof);
router.put('/:id/verify', authRequired, roles(['ADMIN']), paymentController.verifyPayment);

export default router;

