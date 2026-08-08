import { Router } from 'express';
import { MasterItemController } from '../controllers/master.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// List masters with pagination, search, type filter
router.get(
  '/admin/masters',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  MasterItemController.getAdminMasters
);

// Create master item — Admin + Event Manager
router.post(
  '/admin/masters',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  MasterItemController.createMasterItem
);

// Update master item — Admin + Event Manager
router.put(
  '/admin/masters/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  MasterItemController.updateMasterItem
);

// Delete master item — Super Admin only
router.delete(
  '/admin/masters/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  MasterItemController.deleteMasterItem
);

export default router;
