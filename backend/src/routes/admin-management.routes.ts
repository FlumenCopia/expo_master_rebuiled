import { Router } from 'express';
import { GateController } from '../controllers/gate.controller';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Gates Management API
router.get('/admin/gates', authenticateJWT, GateController.getGates);
router.post(
  '/admin/gates',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  GateController.createGate
);
router.delete(
  '/admin/gates/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  GateController.deleteGate
);

// Gatekeeper & Admin Users Management API
router.get(
  '/admin/users',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  UserController.getUsers
);
router.post(
  '/admin/users',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  UserController.createUser
);
router.delete(
  '/admin/users/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  UserController.deleteUser
);

export default router;
