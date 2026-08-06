import { Router } from 'express';
import { QuizController } from '../controllers/quiz.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth';

const router = Router();

router.get(
  '/admin/quiz',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  QuizController.getAdminQuizzes
);

router.post(
  '/admin/quiz',
  authenticateJWT,
  requireRoles('SUPER_ADMIN', 'EVENT_MANAGER'),
  QuizController.createQuiz
);

export default router;
