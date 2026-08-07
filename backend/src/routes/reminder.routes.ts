import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Endpoint to manually or automatically trigger visitor reminder emails
router.post('/trigger-visitors', authenticateJWT, requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'), ReminderController.triggerVisitorReminders);

// Endpoint to manually or automatically trigger exhibitor reminder emails
router.post('/trigger-exhibitors', authenticateJWT, requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'), ReminderController.triggerExhibitorReminders);

export default router;
