import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class QuizController {
  static async getAdminQuizzes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizzes = await prisma.quiz.findMany({
        include: { questions: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, quizzes });
    } catch (error) {
      next(error);
    }
  }

  static async createQuiz(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description } = req.body;
      const quiz = await prisma.quiz.create({
        data: { title, description: description || '' },
      });
      res.json({ success: true, message: 'Quiz created', quiz });
    } catch (error) {
      next(error);
    }
  }
}
