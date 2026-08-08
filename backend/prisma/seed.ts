import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Admin users...');

  const isProd = process.env.NODE_ENV === 'production';
  const adminEmail = (process.env.ADMIN_EMAIL || 'mastersassociationmedia@gmail.com').trim().toLowerCase();
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (isProd && (!rawPassword || rawPassword === '123456')) {
    console.warn('⚠️ [SECURITY WARNING] Cannot run seed script in production without custom ADMIN_PASSWORD set.');
    return;
  }

  const passwordToUse = rawPassword || '123456';
  const hashedPassword = await bcrypt.hash(passwordToUse, 12);

  const adminUsers = [
    { email: adminEmail, name: 'Kerala EXPO Super Admin', role: 'SUPER_ADMIN' },
  ];

  if (!isProd) {
    adminUsers.push({ email: 'admin@expokerala.com', name: 'System Admin', role: 'SUPER_ADMIN' });
  }

  for (const user of adminUsers) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role as any,
        },
      });
      console.log(`✅ Admin user seeded: ${user.email}`);
    } else {
      console.log(`ℹ️ Admin user already exists: ${user.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

