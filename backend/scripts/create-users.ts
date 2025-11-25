import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating users...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create user 1
  const user1 = await prisma.user.upsert({
    where: { email: 'foxmelanie77@gmail.com' },
    update: {},
    create: {
      email: 'foxmelanie77@gmail.com',
      username: 'foxmelanie77',
      password: hashedPassword,
      firstName: 'Melanie',
      lastName: 'Fox',
      roleType: 'USER',
      isActive: true,
      isVerified: true
    }
  });
  console.log(`✅ Created/Found user: ${user1.email}`);

  // Create user 2
  const user2 = await prisma.user.upsert({
    where: { email: 'phanngocdanthanh94@gmail.com' },
    update: {},
    create: {
      email: 'phanngocdanthanh94@gmail.com',
      username: 'phanngocdanthanh94',
      password: hashedPassword,
      firstName: 'Dan Thanh',
      lastName: 'Phan Ngoc',
      roleType: 'USER',
      isActive: true,
      isVerified: true
    }
  });
  console.log(`✅ Created/Found user: ${user2.email}`);

  console.log('\n✨ Users created successfully!');
  console.log('📝 Default password for both users: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
