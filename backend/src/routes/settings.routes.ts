import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/settings',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  SettingsController.getAdminSettings
);

router.post(
  '/admin/settings',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  SettingsController.updateAdminSettings
);

export default router;
