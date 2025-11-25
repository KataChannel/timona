import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      roleType: true
    }
  });

  console.log('📋 Users in database:');
  console.log(JSON.stringify(users, null, 2));
  
  console.log('\n🔍 Looking for specific emails:');
  const user1 = await prisma.user.findUnique({
    where: { email: 'foxmelanie77@gmail.com' }
  });
  console.log('foxmelanie77@gmail.com:', user1 ? '✅ Found' : '❌ Not found');
  
  const user2 = await prisma.user.findUnique({
    where: { email: 'phanngocdanthanh94@gmail.com' }
  });
  console.log('phanngocdanthanh94@gmail.com:', user2 ? '✅ Found' : '❌ Not found');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
