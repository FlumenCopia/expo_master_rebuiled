import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function ensureDefaultAdminUser(): Promise<void> {
  try {
    const emails = [
      'mastersassociationmeadia@gmail.com',
      'mastersassociationmedia@gmail.com',
    ];
    const rawPassword = process.env.ADMIN_PASSWORD || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    for (const email of emails) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            email,
            name: 'Kerala reexpo Founder',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
          },
        });
        console.log(`✅ [Security Seeder] Admin user active: ${email}`);
      }
    }
  } catch (error) {
    console.error('⚠️ [Security Seeder] Error seeding admin user:', error);
  }
}
