import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/stats',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  StatsController.getStats
);

export default router;
