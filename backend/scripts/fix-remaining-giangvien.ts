import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 FIX: Remaining GIANGVIEN roleType in Database');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Find giangvien role
    console.log('📋 Step 1: Finding giangvien role...');
    
    const giangvienRole = await prisma.role.findUnique({
      where: { name: 'giangvien' }
    });

    if (!giangvienRole) {
      console.log('   ⚠️  Giangvien role not found. Run seed first:');
      console.log('   $ bun run scripts/seed-rbac-standalone.ts');
      process.exit(1);
    }

    console.log(`   ✅ Found: ${giangvienRole.displayName}\n`);

    // Step 2: Direct SQL to find users with GIANGVIEN
    console.log('📋 Step 2: Finding users with GIANGVIEN roleType (using raw SQL)...');
    
    const giangvienUsers = await prisma.$queryRawUnsafe<Array<{
      id: string;
      email: string | null;
      username: string;
      roleType: string;
    }>>(
      'SELECT id, email, username, "roleType" FROM "User" WHERE "roleType" = $1',
      'GIANGVIEN'
    );

    console.log(`   📊 Found ${giangvienUsers.length} users with GIANGVIEN roleType\n`);

    if (giangvienUsers.length === 0) {
      console.log('   ✅ No users to fix. All clean!');
      return;
    }

    // Step 3: Show users
    console.log('📋 Step 3: Users to migrate:\n');
    giangvienUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email || user.username} (${user.id})`);
    });

    // Step 4: Assign giangvien role and update roleType
    console.log('\n📋 Step 4: Migrating users...\n');

    let migratedCount = 0;

    for (const user of giangvienUsers) {
      // Check if already has giangvien role
      const existingRole = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: giangvienRole.id
          }
        }
      });

      if (!existingRole) {
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
        console.log(`   ✅ ASSIGNED role: ${user.email || user.username}`);
      } else {
        console.log(`   ⏭️  SKIP (has role): ${user.email || user.username}`);
      }

      // Update roleType using raw SQL
      await prisma.$executeRawUnsafe(
        `UPDATE public."User" SET "roleType" = 'USER' WHERE id = $1`,
        user.id
      );
      
      console.log(`   ✅ UPDATED roleType: ${user.email || user.username} → USER`);
      migratedCount++;
    }

    // Step 5: Verify no more GIANGVIEN
    console.log('\n📋 Step 5: Verifying fix...');
    
    const remaining = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      'SELECT COUNT(*)::int as count FROM "User" WHERE "roleType" = $1',
      'GIANGVIEN'
    );

    const remainingCount = Number(remaining[0]?.count || 0);

    if (remainingCount === 0) {
      console.log('   ✅ SUCCESS: No more GIANGVIEN roleType in database!\n');
    } else {
      console.log(`   ⚠️  WARNING: Still ${remainingCount} users with GIANGVIEN\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('✅ FIX COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Users migrated: ${migratedCount}`);
    console.log(`   - Remaining GIANGVIEN: ${remainingCount}`);
    console.log('\n✨ All users updated to:');
    console.log('   - roleType: USER');
    console.log('   - Assigned Role: giangvien (with LMS permissions)\n');

  } catch (error) {
    console.error('\n❌ Fix failed:', error);
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
