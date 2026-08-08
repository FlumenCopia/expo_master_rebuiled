import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

// Gatekeeper & Admin Users Management API

// List users — Admin + Event Manager
router.get(
  '/admin/users',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  UserController.getUsers
);

// Create user — Admin + Event Manager
router.post(
  '/admin/users',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  UserController.createUser
);

// Update user (name, role, password) — Super Admin only
router.put(
  '/admin/users/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  UserController.updateUser
);

// Delete user — Super Admin only
router.delete(
  '/admin/users/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  UserController.deleteUser
);

export default router;
