import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignDefaultRoleToExistingUsers() {
  try {
    console.log('🔍 Checking for users without roles...\n');

    // Find users without any roles
    const usersWithoutRoles = await prisma.user.findMany({
      where: {
        userRoles: {
          none: {}
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      }
    });

    if (usersWithoutRoles.length === 0) {
      console.log('✅ All users already have roles assigned!\n');
      return;
    }

    console.log(`📊 Found ${usersWithoutRoles.length} users without roles:\n`);
    usersWithoutRoles.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username})`);
    });

    // Find default 'user' role
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'user' }
    });

    if (!defaultRole) {
      console.error('\n❌ Error: Default "user" role not found!');
      console.log('💡 Please run RBAC seeder first:');
      console.log('   cd backend && bun run seed:rbac\n');
      process.exit(1);
    }

    console.log(`\n🎯 Assigning role: "${defaultRole.displayName}" (${defaultRole.name})\n`);

    // Assign default role to each user
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutRoles) {
      try {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: defaultRole.id,
            assignedBy: 'system-migration',
          }
        });
        console.log(`✅ Assigned role to: ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to assign role to ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${successCount} users`);
    console.log(`❌ Failed:  ${errorCount} users`);
    console.log(`📦 Total:   ${usersWithoutRoles.length} users`);
    console.log('='.repeat(60) + '\n');

    // Verify results
    console.log('🔍 Verification: Checking users without roles...\n');
    const remainingUsersWithoutRoles = await prisma.user.count({
      where: {
        userRoles: {
          none: {}
        }
      }
    });

    if (remainingUsersWithoutRoles === 0) {
      console.log('✅ SUCCESS: All users now have roles assigned!\n');
    } else {
      console.log(`⚠️  WARNING: ${remainingUsersWithoutRoles} users still without roles\n`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
console.log('\n' + '='.repeat(60));
console.log('🔄 DEFAULT ROLE MIGRATION FOR EXISTING USERS');
console.log('='.repeat(60) + '\n');

assignDefaultRoleToExistingUsers()
  .then(() => {
    console.log('✅ Migration completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
