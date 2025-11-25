import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('❌ Usage: npm run user:roles -- <user-email>');
    console.log('\nExample:');
    console.log('  npm run user:roles -- chikiet88@gmail.com');
    console.log('\n💡 Or list all users:');
    console.log('  npm run user:roles -- --all');
    process.exit(1);
  }

  const [targetEmail] = args;

  if (targetEmail === '--all') {
    // List all users with their roles
    console.log('👥 Listing all users with their roles...\n');
    
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
                displayName: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        email: 'asc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }

    console.log(`📊 Total users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email || 'No email'}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   System Role: ${user.roleType}`);
      console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      
      if (user.userRoles.length > 0) {
        console.log(`   Assigned Roles:`);
        user.userRoles.forEach(ra => {
          console.log(`      📌 ${ra.role.name} (${ra.role.displayName})`);
          if (ra.role.description) {
            console.log(`         ${ra.role.description}`);
          }
        });
      } else {
        console.log(`   Assigned Roles: None`);
      }
      console.log('');
    });

    return;
  }

  // Show specific user
  console.log(`🔍 Looking up user: ${targetEmail}\n`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: {
                    select: {
                      name: true,
                      action: true,
                      resource: true,
                      scope: true,
                      description: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      },
      userPermissions: {
        include: {
          permission: {
            select: {
              name: true,
              action: true,
              resource: true,
              scope: true,
              description: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.error(`❌ User with email "${targetEmail}" not found!`);
    process.exit(1);
  }

  console.log('✅ User Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Username: ${user.username}`);
  console.log(`   Name: ${[user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A'}`);
  console.log(`   System Role: ${user.roleType}`);
  console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
  console.log(`   Verified: ${user.isVerified ? '✅ Yes' : '❌ No'}`);
  console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
  console.log(`   Last Login: ${user.lastLoginAt ? user.lastLoginAt.toLocaleString() : 'Never'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Show assigned roles
  if (user.userRoles.length > 0) {
    console.log(`📌 Assigned Roles (${user.userRoles.length}):\n`);
    
    user.userRoles.forEach((ra, index) => {
      console.log(`${index + 1}. ${ra.role.name}`);
      console.log(`   Display Name: ${ra.role.displayName}`);
      console.log(`   Description: ${ra.role.description || 'N/A'}`);
      console.log(`   Assigned At: ${ra.assignedAt.toLocaleString()}`);
      console.log(`   Assigned By: ${ra.assignedBy || 'System'}`);
      console.log(`   Effect: ${ra.effect}`);
      console.log(`   Scope: ${ra.scope || 'All'}`);
      console.log(`   Permissions: ${ra.role.permissions.length}`);
      
      if (ra.role.permissions.length > 0 && ra.role.permissions.length <= 15) {
        console.log(`   Permission List:`);
        ra.role.permissions.forEach(rp => {
          console.log(`      • ${rp.permission.name} (${rp.permission.action}:${rp.permission.resource})`);
          if (rp.permission.scope) {
            console.log(`        Scope: ${rp.permission.scope}`);
          }
        });
      } else if (ra.role.permissions.length > 15) {
        console.log(`   First 10 permissions:`);
        ra.role.permissions.slice(0, 10).forEach(rp => {
          console.log(`      • ${rp.permission.name} (${rp.permission.action}:${rp.permission.resource})`);
        });
        console.log(`      ... and ${ra.role.permissions.length - 10} more permissions`);
      }
      console.log('');
    });
  } else {
    console.log('📌 Assigned Roles: None\n');
  }

  // Show direct permissions
  if (user.userPermissions.length > 0) {
    console.log(`🔑 Direct Permissions (${user.userPermissions.length}):\n`);
    
    user.userPermissions.forEach((up, index) => {
      console.log(`${index + 1}. ${up.permission.name}`);
      console.log(`   Action: ${up.permission.action}`);
      console.log(`   Resource: ${up.permission.resource}`);
      console.log(`   Scope: ${up.permission.scope || 'All'}`);
      console.log(`   Effect: ${up.effect}`);
      console.log(`   Created At: ${up.createdAt.toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('🔑 Direct Permissions: None\n');
  }

  // Summary
  const totalPermissions = user.userRoles.reduce((sum, ra) => sum + ra.role.permissions.length, 0) + user.userPermissions.length;
  
  console.log('📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   System Role Type: ${user.roleType}`);
  console.log(`   Assigned Roles: ${user.userRoles.length}`);
  console.log(`   Direct Permissions: ${user.userPermissions.length}`);
  console.log(`   Total Permissions (via roles): ${totalPermissions}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
