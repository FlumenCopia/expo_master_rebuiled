import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { TelemetryController } from '../controllers/telemetry.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/stats',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  StatsController.getStats
);

router.get(
  '/stats/telemetry',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  TelemetryController.getTelemetry
);

export default router;
