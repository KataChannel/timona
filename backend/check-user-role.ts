// Script to check and update user role to ADMIN
// Run this in the backend directory: npx ts-node check-user-role.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndUpdateUserRole() {
  try {
    console.log('🔍 Checking users and their roles...');
    
    // List all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        roleType: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('\n📋 Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username}) - Role: ${user.roleType} - Active: ${user.isActive}`);
    });

    // Check if there's any admin user
    const adminUsers = users.filter(user => user.roleType === 'ADMIN');
    console.log(`\n👑 Admin users: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('\n⚠️ No admin users found!');
      
      if (users.length > 0) {
        // Promote the first user to admin
        const firstUser = users[0];
        console.log(`\n🔧 Promoting user "${firstUser.email}" to ADMIN...`);
        
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { roleType: 'ADMIN' }
        });
        
        console.log('✅ User promoted to ADMIN successfully!');
        
        // Verify the update
        const updatedUser = await prisma.user.findUnique({
          where: { id: firstUser.id },
          select: { email: true, roleType: true }
        });
        
        console.log(`✅ Verified: ${updatedUser?.email} is now ${updatedUser?.roleType}`);
      } else {
        console.log('\n❌ No users found in database!');
      }
    } else {
      console.log('\n✅ Admin users already exist:');
      adminUsers.forEach(admin => {
        console.log(`  - ${admin.email} (${admin.username})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkAndUpdateUserRole();