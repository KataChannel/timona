import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Listing users with their roles...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      roleType: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found');
    return;
  }

  console.log(`📊 Total users: ${users.length}\n`);

  // Group by role
  const roleGroups: Record<string, typeof users> = {
    ADMIN: [],
    USER: [],
    GUEST: []
  };

  users.forEach(user => {
    if (roleGroups[user.roleType]) {
      roleGroups[user.roleType].push(user);
    }
  });

  // Display by role
  if (roleGroups.ADMIN.length > 0) {
    console.log('🔴 ADMIN:');
    roleGroups.ADMIN.forEach(user => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
      console.log(`   ✓ ${user.email} - ${name}`);
    });
    console.log('');
  }

  if (roleGroups.USER.length > 0) {
    console.log('👤 USER:');
    roleGroups.USER.forEach(user => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
      console.log(`   ✓ ${user.email} - ${name}`);
    });
    console.log('');
  }

  if (roleGroups.GUEST.length > 0) {
    console.log('👻 GUEST:');
    roleGroups.GUEST.forEach(user => {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
      console.log(`   ✓ ${user.email} - ${name}`);
    });
    console.log('');
  }

  console.log('📝 Summary:');
  console.log(`   ADMIN: ${roleGroups.ADMIN.length}`);
  console.log(`   USER: ${roleGroups.USER.length}`);
  console.log(`   GUEST: ${roleGroups.GUEST.length}`);
  console.log(`   Total: ${users.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
