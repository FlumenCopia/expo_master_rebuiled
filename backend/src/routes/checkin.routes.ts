import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import { gateLimiter } from '../middleware/rate-limit';

const router = Router();

router.post(
  '/checkin/verify',
  gateLimiter,
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'GATE_OFFICER', 'EVENT_MANAGER'),
  CheckInController.verifyCheckIn
);

export default router;
