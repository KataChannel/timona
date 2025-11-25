import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_USER_EMAIL = 'chikiet88@gmail.com';
const CONTENT_MANAGER_ROLE_NAME = 'content_manager'; // Role name in database

async function main() {
  console.log('🔍 Checking user and assigning Content Manager role...\n');

  // 1. Find the user
  const user = await prisma.user.findUnique({
    where: { email: TARGET_USER_EMAIL },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) {
    console.error(`❌ User with email ${TARGET_USER_EMAIL} not found!`);
    process.exit(1);
  }

  console.log('✅ User found:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Role Type: ${user.roleType}`);
  console.log(`   Current Roles: ${user.userRoles.length > 0 ? user.userRoles.map(ra => ra.role.name).join(', ') : 'None'}\n`);

  // 2. Find the "Quản lý Nội dung" role
  const contentManagerRole = await prisma.role.findFirst({
    where: { name: CONTENT_MANAGER_ROLE_NAME },
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });

  if (!contentManagerRole) {
    console.error(`❌ Role "${CONTENT_MANAGER_ROLE_NAME}" not found!`);
    console.log('\n📋 Available roles:');
    const allRoles = await prisma.role.findMany({
      select: { id: true, name: true, description: true }
    });
    allRoles.forEach(role => {
      console.log(`   - ${role.name} (${role.description || 'No description'})`);
    });
    process.exit(1);
  }

  console.log('✅ Content Manager role found:');
  console.log(`   ID: ${contentManagerRole.id}`);
  console.log(`   Name: ${contentManagerRole.name}`);
  console.log(`   Description: ${contentManagerRole.description || 'N/A'}`);
  console.log(`   Permissions: ${contentManagerRole.permissions.length}\n`);

  // 3. Check if user already has this role
  const existingAssignment = user.userRoles.find(
    ra => ra.roleId === contentManagerRole.id
  );

  if (existingAssignment) {
    console.log(`⚠️  User already has the "${CONTENT_MANAGER_ROLE_NAME}" role!`);
    console.log(`   Assigned at: ${existingAssignment.assignedAt}`);
    console.log(`   Assigned by: ${existingAssignment.assignedBy || 'System'}\n`);
    
    console.log('✨ No action needed. User already has this role.');
    return;
  }

  // 4. Assign the role to the user
  console.log(`🔄 Assigning "${CONTENT_MANAGER_ROLE_NAME}" role to ${TARGET_USER_EMAIL}...`);

  const roleAssignment = await prisma.userRoleAssignment.create({
    data: {
      userId: user.id,
      roleId: contentManagerRole.id,
      assignedBy: 'SYSTEM_SCRIPT'
    }
  });

  console.log('✅ Role assigned successfully!');
  console.log(`   Assignment ID: ${roleAssignment.id}`);
  console.log(`   Assigned at: ${roleAssignment.assignedAt}\n`);

  // 5. Verify the assignment
  const updatedUser = await prisma.user.findUnique({
    where: { email: TARGET_USER_EMAIL },
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

  console.log('✅ Verification - User now has these roles:');
  if (updatedUser && updatedUser.userRoles.length > 0) {
    updatedUser.userRoles.forEach(ra => {
      console.log(`   📌 ${ra.role.name}`);
      console.log(`      - Permissions: ${ra.role.permissions.length}`);
      if (ra.role.permissions.length > 0 && ra.role.permissions.length <= 10) {
        ra.role.permissions.forEach(rp => {
          console.log(`        • ${rp.permission.name} (${rp.permission.action}:${rp.permission.resource})`);
        });
      } else if (ra.role.permissions.length > 10) {
        console.log(`        • ... and ${ra.role.permissions.length - 5} more permissions`);
        ra.role.permissions.slice(0, 5).forEach(rp => {
          console.log(`        • ${rp.permission.name} (${rp.permission.action}:${rp.permission.resource})`);
        });
      }
    });
  } else {
    console.log('   (No roles assigned)');
  }

  console.log('\n✨ Done! User has been successfully assigned the Content Manager role.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
