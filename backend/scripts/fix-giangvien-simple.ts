import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 FIX: Update all GIANGVIEN to USER via SQL');
  console.log('='.repeat(60) + '\n');

  try {
    console.log('📋 Step 1: Finding giangvien role...');
    
    const giangvienRole = await prisma.role.findUnique({
      where: { name: 'giangvien' }
    });

    if (!giangvienRole) {
      console.log('   ⚠️  Giangvien role not found. Run seed first:');
      console.log('   $ bun run scripts/seed-rbac-standalone.ts\n');
      process.exit(1);
    }

    console.log(`   ✅ Found: ${giangvienRole.displayName}\n`);

    // Step 2: Update all GIANGVIEN to USER using raw SQL
    console.log('📋 Step 2: Updating all GIANGVIEN roleType to USER...');
    
    const updateResult = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "roleType" = 'USER' WHERE "roleType" = 'GIANGVIEN' RETURNING id, email, username`
    );

    console.log(`   ✅ Updated ${updateResult} users\n`);

    // Step 3: Get all users that should have giangvien role
    console.log('📋 Step 3: Finding users that need giangvien role...');
    
    // Since we can't query by GIANGVIEN anymore, let's look for specific known users
    // or users who have courses as instructor
    const instructors = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: ['touyen.ceo@tazagroup.vn', 'wetdragon1996@gmail.com', 'instructor@lms.com'] } },
          { coursesInstructed: { some: {} } } // Has courses as instructor
        ]
      },
      include: {
        userRoles: {
          where: {
            roleId: giangvienRole.id
          }
        },
        coursesInstructed: {
          select: { id: true, title: true },
          take: 1
        }
      }
    });

    console.log(`   📊 Found ${instructors.length} instructor users\n`);

    // Step 4: Assign giangvien role to instructors without it
    console.log('📋 Step 4: Assigning giangvien role...\n');
    
    let assignedCount = 0;
    let skippedCount = 0;

    for (const user of instructors) {
      if (user.userRoles.length > 0) {
        console.log(`   ⏭️  SKIP: ${user.email || user.username} (already has role)`);
        skippedCount++;
        continue;
      }

      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: giangvienRole.id,
          effect: 'allow',
          assignedBy: 'system',
        }
      });

      console.log(`   ✅ ASSIGNED: ${user.email || user.username}`);
      if (user.coursesInstructed.length > 0) {
        console.log(`      → Has ${user.coursesInstructed.length}+ courses`);
      }
      assignedCount++;
    }

    // Step 5: Regenerate Prisma Client
    console.log('\n📋 Step 5: Regenerating Prisma Client...');
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('bunx prisma generate');
      console.log('   ✅ Prisma Client regenerated\n');
    } catch (error: any) {
      console.log(`   ⚠️  Warning: ${error.message}\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('✅ FIX COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Users updated to USER: ${updateResult}`);
    console.log(`   - Giangvien role assigned: ${assignedCount}`);
    console.log(`   - Already had role: ${skippedCount}`);
    console.log('\n✨ Next steps:');
    console.log('   1. Restart backend server');
    console.log('   2. Test login with instructor users');
    console.log('   3. Verify no more GIANGVIEN enum errors\n');

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
