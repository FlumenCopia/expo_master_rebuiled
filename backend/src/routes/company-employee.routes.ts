import { Router } from 'express';
import { CompanyEmployeeController } from '../controllers/company-employee.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/company-employees',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  CompanyEmployeeController.getAdminEmployees
);

router.post(
  '/admin/company-employees',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  CompanyEmployeeController.createEmployee
);

router.delete(
  '/admin/company-employees/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  CompanyEmployeeController.deleteEmployee
);

export default router;
