import { Router } from 'express';
import { SubEventController } from '../controllers/sub-event.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Public route
router.get('/sub-events/public/:slug', SubEventController.getPublicBySlug);

// Admin routes
router.get(
  '/admin/sub-events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  SubEventController.getAdminSubEvents
);

router.post(
  '/admin/sub-events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  SubEventController.createSubEvent
);

router.delete(
  '/admin/sub-events/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  SubEventController.deleteSubEvent
);

export default router;
