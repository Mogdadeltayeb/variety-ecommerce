import { Router } from 'express';
import { createPayment } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/confirm', createPayment); // أو المسار الذي تستخدمه

export default router;