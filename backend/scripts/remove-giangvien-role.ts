import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🗑️  REMOVE GIANGVIEN ROLE MIGRATION');
  console.log('='.repeat(60) + '\n');

  try {
    // Check if there are any users with GIANGVIEN role
    console.log('🔍 Checking for users with GIANGVIEN role...\n');
    
    const giangvienUsers = await prisma.$queryRaw<any[]>`
      SELECT id, email, "firstName", "lastName", "roleType"
      FROM "User"
      WHERE "roleType" = 'GIANGVIEN'
    `;

    if (giangvienUsers.length === 0) {
      console.log('✅ No users with GIANGVIEN role found\n');
    } else {
      console.log(`⚠️  Found ${giangvienUsers.length} users with GIANGVIEN role:\n`);
      
      giangvienUsers.forEach((user, index) => {
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
        console.log(`${index + 1}. ${user.email} - ${name}`);
      });

      console.log('\n🔄 Converting GIANGVIEN users to USER role...\n');

      // Update all GIANGVIEN users to USER role
      const result = await prisma.$executeRaw`
        UPDATE "User"
        SET "roleType" = 'USER'
        WHERE "roleType" = 'GIANGVIEN'
      `;

      console.log(`✅ Updated ${result} users from GIANGVIEN to USER\n`);
    }

    // Now drop the GIANGVIEN value from enum
    console.log('🗑️  Removing GIANGVIEN from UserRoleType enum...\n');
    console.log('⚠️  Note: PostgreSQL does not support removing enum values directly.');
    console.log('💡 Solution: Run Prisma migration after schema change.\n');
    
    console.log('📋 Steps to complete:');
    console.log('   1. ✅ Schema updated (GIANGVIEN removed from UserRoleType)');
    console.log('   2. ✅ All GIANGVIEN users converted to USER');
    console.log('   3. ⏳ Run: cd backend && bun prisma migrate dev --name remove_giangvien_role');
    console.log('   4. ⏳ The migration will recreate the enum without GIANGVIEN\n');

    console.log('✅ Migration preparation completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Migration failed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
