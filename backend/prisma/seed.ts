import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Admin users...');

  const adminUsers = [
    { email: 'mastersassociationmedia@gmail.com', name: 'Kerala reexpo Founder', role: 'SUPER_ADMIN' },
    { email: 'mastersassociationmeadia@gmail.com', name: 'Kerala reexpo Founder', role: 'SUPER_ADMIN' },
    { email: 'admin@expokerala.com', name: 'System Admin', role: 'SUPER_ADMIN' },
  ];

  const hashedPassword = await bcrypt.hash('123456', 10);

  for (const user of adminUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: hashedPassword, role: user.role as any, name: user.name },
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role: user.role as any,
      },
    });
  }

  console.log(`✅ Admin users seeded: ${adminUsers.map((u) => u.email).join(', ')}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

