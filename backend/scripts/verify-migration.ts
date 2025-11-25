import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICATION: Giangvien Role Migration');
  console.log('='.repeat(60) + '\n');

  // Check migrated users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'touyen.ceo@tazagroup.vn' },
        { email: 'wetdragon1996@gmail.com' }
      ]
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  console.log(`📊 Found ${users.length} migrated users:\n`);

  for (const user of users) {
    console.log(`👤 ${user.email || user.username}`);
    console.log(`   roleType: ${user.roleType}`);
    console.log(`   Assigned Roles: ${user.userRoles.length}`);
    
    for (const ur of user.userRoles) {
      console.log(`     - ${ur.role.displayName} (${ur.role.name})`);
      console.log(`       Permissions: ${ur.role.permissions.length}`);
      
      const hasLMSPermissions = ur.role.permissions.some(
        p => p.permission.name.startsWith('lms:')
      );
      console.log(`       Has LMS permissions: ${hasLMSPermissions ? '✅ YES' : '❌ NO'}`);
    }
    console.log('');
  }

  // Test redirect logic
  console.log('🧪 Testing redirect logic:\n');
  
  for (const user of users) {
    const hasGiangvienRole = user.userRoles.some(ur => ur.role.name === 'giangvien');
    const expectedRedirect = hasGiangvienRole ? '/lms/instructor' : `/dashboard (or based on roleType: ${user.roleType})`;
    console.log(`   ${user.email}:`);
    console.log(`     Has giangvien role: ${hasGiangvienRole ? '✅ YES' : '❌ NO'}`);
    console.log(`     Expected redirect: ${expectedRedirect}`);
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
