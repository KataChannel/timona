import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 MIGRATION: Convert GIANGVIEN roleType to Role Permission');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Find giangvien role (create if doesn't exist)
    console.log('📋 Step 1: Finding or creating giangvien role...');
    
    let giangvienRole = await prisma.role.findUnique({
      where: { name: 'giangvien' }
    });

    if (!giangvienRole) {
      console.log('   ⚠️  Giangvien role not found. Please run RBAC seed first:');
      console.log('   $ bun run src/scripts/seed-rbac.ts');
      process.exit(1);
    }

    console.log(`   ✅ Found giangvien role: ${giangvienRole.displayName} (ID: ${giangvienRole.id})`);

    // Step 2: Find all users with GIANGVIEN roleType
    console.log('\n📋 Step 2: Finding users with GIANGVIEN roleType...');
    
    const giangvienUsers = await prisma.user.findMany({
      where: {
        roleType: 'GIANGVIEN' as any // Cast as any since we're about to migrate
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log(`   📊 Found ${giangvienUsers.length} users with GIANGVIEN roleType\n`);

    if (giangvienUsers.length === 0) {
      console.log('   ℹ️  No users to migrate. All done!');
      return;
    }

    // Step 3: Assign giangvien role to each user
    console.log('📋 Step 3: Assigning giangvien role to users...\n');
    
    let assignedCount = 0;
    let skippedCount = 0;

    for (const user of giangvienUsers) {
      // Check if user already has giangvien role
      const hasGiangvienRole = user.userRoles.some(
        ur => ur.roleId === giangvienRole!.id
      );

      if (hasGiangvienRole) {
        console.log(`   ⏭️  SKIP: ${user.email} (already has giangvien role)`);
        skippedCount++;
        continue;
      }

      // Assign giangvien role
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: giangvienRole.id,
          effect: 'allow',
          assignedBy: 'system',
          assignedAt: new Date(),
        }
      });

      console.log(`   ✅ ASSIGNED: ${user.email || user.username} → giangvien role`);
      assignedCount++;
    }

    // Step 4: Update users' roleType to USER (keeping them active)
    console.log('\n📋 Step 4: Updating roleType from GIANGVIEN to USER...');
    
    await prisma.user.updateMany({
      where: {
        roleType: 'GIANGVIEN' as any
      },
      data: {
        roleType: 'USER'
      }
    });

    console.log(`   ✅ Updated ${giangvienUsers.length} users to roleType=USER`);

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total users found: ${giangvienUsers.length}`);
    console.log(`   - New role assignments: ${assignedCount}`);
    console.log(`   - Already had role: ${skippedCount}`);
    console.log(`   - Users updated to roleType=USER: ${giangvienUsers.length}`);
    console.log('\n✨ All users with GIANGVIEN roleType now have:');
    console.log('   - roleType: USER (for basic system access)');
    console.log('   - Assigned Role: giangvien (for LMS permissions)');
    console.log('\n📝 Next steps:');
    console.log('   1. Run Prisma migrate to remove GIANGVIEN from enum');
    console.log('   2. Test login with migrated users');
    console.log('   3. Verify redirect to /lms/instructor\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
