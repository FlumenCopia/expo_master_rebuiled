import { Router } from 'express';
import { ExhibitorController } from '../controllers/exhibitor.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import { registrationLimiter } from '../middleware/rate-limit';

const router = Router();

// Public route
router.post('/register/exhibitor', registrationLimiter, ExhibitorController.register);

// Admin routes
router.get(
  '/admin/exhibitors',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  ExhibitorController.getAdminExhibitors
);

router.patch(
  '/admin/exhibitors/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  ExhibitorController.updateExhibitorStatus
);

export default router;
