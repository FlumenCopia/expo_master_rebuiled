import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function ensureDefaultAdminUser(): Promise<void> {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'mastersassociationmedia@gmail.com').trim().toLowerCase();
    const rawPassword = process.env.ADMIN_PASSWORD || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const targetEmails = Array.from(
      new Set([
        adminEmail,
        'mastersassociationmedia@gmail.com',
        'mastersassociationmeadia@gmail.com',
        'admin@expokerala.com',
      ])
    );

    for (const email of targetEmails) {
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
        console.log(`✅ [Security Seeder] Created Super Admin account: ${email}`);
      } else {
        console.log(`ℹ️ [Security Seeder] Super Admin active: ${email}`);
      }
    }

    // Fallback: If ZERO Super Admins exist in DB, force create one
    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    if (superAdminCount === 0) {
      await prisma.user.create({
        data: {
          email: 'admin@expokerala.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
        },
      });
      console.log(`✅ [Security Seeder] Force created emergency Super Admin: admin@expokerala.com`);
    }
  } catch (error) {
    console.error('⚠️ [Security Seeder] Error seeding admin user:', error);
  }
}
