import { Router } from 'express';
import { VisitorController } from '../controllers/visitor.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';
import { registrationLimiter, createRateLimiter } from '../middleware/rate-limit';

const router = Router();

// Public routes — no auth required
router.get('/visitors/lookup', createRateLimiter(60, 60000), VisitorController.lookupByPhone);
router.post('/register/visitor', registrationLimiter, VisitorController.register);
router.get('/badge/:code', createRateLimiter(20, 60000), VisitorController.getBadgeByCode);

// Admin: List visitors with pagination — Admin + Event Manager
router.get(
  '/admin/visitors',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  VisitorController.getAdminVisitors
);

// Admin: Update visitor record — Admin + Event Manager
router.put(
  '/admin/visitors/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  VisitorController.updateVisitor
);

// Admin: Delete visitor — Super Admin only
router.delete(
  '/admin/visitors/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  VisitorController.deleteVisitor
);

export default router;
