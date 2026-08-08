import { Router } from 'express';
import { SubEventController } from '../controllers/sub-event.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Public route
router.get('/sub-events/public/:slug', SubEventController.getPublicBySlug);

// List sub-events — Admin + Event Manager
router.get(
  '/admin/sub-events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  SubEventController.getAdminSubEvents
);

// Create sub-event — Admin + Event Manager
router.post(
  '/admin/sub-events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  SubEventController.createSubEvent
);

// Update sub-event — Admin + Event Manager
router.put(
  '/admin/sub-events/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  SubEventController.updateSubEvent
);

// Delete sub-event — Super Admin only
router.delete(
  '/admin/sub-events/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  SubEventController.deleteSubEvent
);

export default router;
