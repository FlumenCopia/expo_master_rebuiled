import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  EventController.getAdminEvents
);

router.post(
  '/admin/events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  EventController.createEvent
);

router.delete(
  '/admin/events/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  EventController.deleteEvent
);

export default router;
