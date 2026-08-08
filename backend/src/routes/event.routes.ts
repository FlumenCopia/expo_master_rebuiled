import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// List events with pagination — Admin + Event Manager
router.get(
  '/admin/events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  EventController.getAdminEvents
);

// Create event — Admin + Event Manager
router.post(
  '/admin/events',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  EventController.createEvent
);

// Update event — Admin + Event Manager
router.put(
  '/admin/events/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  EventController.updateEvent
);

// Delete event — Super Admin only
router.delete(
  '/admin/events/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  EventController.deleteEvent
);

export default router;
