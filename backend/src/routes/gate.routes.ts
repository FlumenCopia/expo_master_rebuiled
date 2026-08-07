import { Router } from 'express';
import { GateController } from '../controllers/gate.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/gates',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER', 'GATE_OFFICER'),
  GateController.getGates
);

router.post(
  '/admin/gates',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  GateController.createGate
);

router.put(
  '/admin/gates/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  GateController.updateGate
);

router.delete(
  '/admin/gates/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  GateController.deleteGate
);

export default router;
