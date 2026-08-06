import { Router } from 'express';
import { FoodItemController } from '../controllers/food-item.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/food-items',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  FoodItemController.getAdminFoodItems
);

router.post(
  '/admin/food-items',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  FoodItemController.createFoodItem
);

router.delete(
  '/admin/food-items/:id',
  authenticateJWT,
  requireRoles('SUPER_ADMIN'),
  FoodItemController.deleteFoodItem
);

export default router;
