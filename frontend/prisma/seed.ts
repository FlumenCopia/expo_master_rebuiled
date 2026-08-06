import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial test data...');

  // Create initial Admin User if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'mastersassociationmedia@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Masters Admin',
        password: '$2a$12$eImiTXuWVxfM37uY4JANjO2c713b14/8LqF0H5b5K5j6h7i8j9k1l', // Bcrypt 123456
        role: 'SUPER_ADMIN',
      },
    });
    console.log('Created Super Admin user:', adminEmail);
  }

  // Create test visitors
  const categories = ['VISITOR', 'DELEGATE', 'VIP', 'EXHIBITOR', 'PRESS'] as const;
  const cities = ['Trivandrum', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur'];

  const visitorsData = [];
  for (let i = 1; i <= 50; i++) {
    visitorsData.push({
      badgeCode: `EXPO26-TST${1000 + i}`,
      fullName: `Test Visitor ${i}`,
      email: `visitor${i}@example.com`,
      phone: `+91 98765${10000 + i}`,
      company: `Solar Energy Solutions ${i}`,
      designation: i % 2 === 0 ? 'Senior Engineer' : 'Managing Director',
      city: cities[i % cities.length],
      category: categories[i % categories.length],
      status: (i % 4 === 0 ? 'CHECKED_IN' : 'REGISTERED') as any,
      checkedInAt: i % 4 === 0 ? new Date() : null,
    });
  }

  for (const v of visitorsData) {
    await prisma.visitor.upsert({
      where: { badgeCode: v.badgeCode },
      update: {},
      create: v,
    });
  }

  console.log('Successfully seeded 50 test visitors!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
