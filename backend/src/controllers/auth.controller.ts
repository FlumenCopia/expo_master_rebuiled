import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { getJwtSecret, AuthRequest } from '../middleware/auth';
import { AdminLoginSchema } from '../middleware/security';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = AdminLoginSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid login payload' });
        return;
      }

      const { email, password } = validation.data;
      const cleanEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      const token = jwt.sign(tokenPayload, getJwtSecret(), {
        expiresIn: '24h',
        issuer: 'expokerala-backend',
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  }

  static getMe(req: AuthRequest, res: Response): void {
    res.json({
      authenticated: true,
      user: req.user,
    });
  }
}
