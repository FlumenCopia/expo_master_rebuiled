import { Router } from 'express';
import { MasterItemController } from '../controllers/master.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/masters',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  MasterItemController.getAdminMasters
);

router.post(
  '/admin/masters',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  MasterItemController.createMasterItem
);

export default router;
