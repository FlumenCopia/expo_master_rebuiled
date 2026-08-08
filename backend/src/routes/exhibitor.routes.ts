import { Router } from 'express';
import { ExhibitorController } from '../controllers/exhibitor.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import { registrationLimiter } from '../middleware/rate-limit';

const router = Router();

// Public route — no auth
router.post('/register/exhibitor', registrationLimiter, ExhibitorController.register);

// List exhibitors with pagination — Admin + Event Manager
router.get(
  '/admin/exhibitors',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  ExhibitorController.getAdminExhibitors
);

// Update exhibitor status/stall — Admin + Event Manager (both need to approve/assign)
router.patch(
  '/admin/exhibitors/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  ExhibitorController.updateExhibitorStatus
);

// Delete exhibitor — Super Admin only
router.delete(
  '/admin/exhibitors/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  ExhibitorController.deleteExhibitor
);

export default router;
