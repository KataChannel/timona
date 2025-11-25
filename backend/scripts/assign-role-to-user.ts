import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get arguments from command line
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Usage: npm run assign:role -- <user-email> <role-name>');
    console.log('\nExample:');
    console.log('  npm run assign:role -- chikiet88@gmail.com content_manager');
    console.log('\n📋 Available roles:');
    
    const roles = await prisma.role.findMany({
      select: { 
        name: true, 
        displayName: true,
        description: true,
        permissions: {
          select: {
            permission: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    roles.forEach(role => {
      console.log(`\n  📌 ${role.name}`);
      console.log(`     Display: ${role.displayName}`);
      console.log(`     Description: ${role.description || 'N/A'}`);
      console.log(`     Permissions: ${role.permissions.length}`);
    });
    
    process.exit(1);
  }

  const [targetEmail, roleName] = args;
  
  console.log(`🔍 Assigning role "${roleName}" to user "${targetEmail}"...\n`);

  // 1. Find the user
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) {
    console.error(`❌ User with email "${targetEmail}" not found!`);
    console.log('\n💡 Tip: Check if the email is correct or create the user first.');
    process.exit(1);
  }

  console.log('✅ User found:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Role Type: ${user.roleType}`);
  console.log(`   Current Roles: ${user.userRoles.length > 0 ? user.userRoles.map(ra => ra.role.name).join(', ') : 'None'}\n`);

  // 2. Find the role
  const role = await prisma.role.findFirst({
    where: { name: roleName },
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  });

  if (!role) {
    console.error(`❌ Role "${roleName}" not found!`);
    console.log('\n📋 Available roles:');
    const allRoles = await prisma.role.findMany({
      select: { name: true, displayName: true, description: true }
    });
    allRoles.forEach(r => {
      console.log(`   - ${r.name} (${r.displayName || r.description || 'No description'})`);
    });
    process.exit(1);
  }

  console.log('✅ Role found:');
  console.log(`   ID: ${role.id}`);
  console.log(`   Name: ${role.name}`);
  console.log(`   Display Name: ${role.displayName}`);
  console.log(`   Description: ${role.description || 'N/A'}`);
  console.log(`   Permissions: ${role.permissions.length}\n`);

  // 3. Check if user already has this role
  const existingAssignment = user.userRoles.find(
    ra => ra.roleId === role.id
  );

  if (existingAssignment) {
    console.log(`⚠️  User already has the "${roleName}" role!`);
    console.log(`   Assigned at: ${existingAssignment.assignedAt}`);
    console.log(`   Assigned by: ${existingAssignment.assignedBy || 'System'}\n`);
    
    console.log('✨ No action needed. User already has this role.');
    
    // Show current roles
    console.log('\n📋 Current user roles:');
    user.userRoles.forEach(ra => {
      console.log(`   ✓ ${ra.role.name} (${ra.role.displayName})`);
    });
    
    return;
  }

  // 4. Assign the role to the user
  console.log(`🔄 Assigning "${roleName}" role to ${targetEmail}...`);

  const roleAssignment = await prisma.userRoleAssignment.create({
    data: {
      userId: user.id,
      roleId: role.id,
      assignedBy: 'SYSTEM_SCRIPT'
    }
  });

  console.log('✅ Role assigned successfully!');
  console.log(`   Assignment ID: ${roleAssignment.id}`);
  console.log(`   Assigned at: ${roleAssignment.assignedAt}\n`);

  // 5. Verify the assignment
  const updatedUser = await prisma.user.findUnique({
    where: { email: targetEmail },
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
      console.log(`\n   📌 ${ra.role.name} (${ra.role.displayName})`);
      console.log(`      Description: ${ra.role.description || 'N/A'}`);
      console.log(`      Permissions: ${ra.role.permissions.length}`);
      
      if (ra.role.permissions.length > 0 && ra.role.permissions.length <= 10) {
        ra.role.permissions.forEach(rp => {
          console.log(`        • ${rp.permission.name}`);
        });
      } else if (ra.role.permissions.length > 10) {
        console.log(`      First 5 permissions:`);
        ra.role.permissions.slice(0, 5).forEach(rp => {
          console.log(`        • ${rp.permission.name}`);
        });
        console.log(`        ... and ${ra.role.permissions.length - 5} more`);
      }
    });
  } else {
    console.log('   (No roles assigned)');
  }

  console.log('\n✨ Done! Role assignment completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
