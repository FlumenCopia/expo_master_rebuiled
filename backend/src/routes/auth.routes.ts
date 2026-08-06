import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth';
import { authLimiter } from '../middleware/rate-limit';

const router = Router();

router.post('/admin/login', authLimiter, AuthController.login);
router.get('/admin/me', authenticateJWT, AuthController.getMe);

export default router;
