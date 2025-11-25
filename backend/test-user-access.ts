#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulated hasAdminAccess function from frontend (UPDATED VERSION)
function hasAdminAccess(user: any): boolean {
  if (!user) return false;
  
  // Check system roleType
  if (user.roleType === 'ADMIN') {
    return true;
  }
  
  // Check RBAC roles
  if (user.roles && user.roles.length > 0) {
    const adminRoles = [
      'admin',
      'super_admin',
      'content_manager',
      'content_editor',
      'product_manager',
      'order_manager',
      'user_manager',
      'blog_manager'  // FIXED: Added blog_manager
    ];
    
    const hasAdminRole = user.roles.some((role: any) => 
      adminRoles.includes(role.name.toLowerCase())
    );
    
    if (hasAdminRole) {
      return true;
    }
  }
  
  return false;
}

async function testUserAccess() {
  try {
    console.log('🧪 Testing admin access for chikiet88@gmail.com...\n');

    const user = await prisma.user.findUnique({
      where: { email: 'chikiet88@gmail.com' },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    // Map to frontend user format
    const mappedUser = {
      id: user.id,
      email: user.email,
      roleType: user.roleType,
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName
      }))
    };

    console.log('👤 User Info:');
    console.log(`   Email: ${mappedUser.email}`);
    console.log(`   RoleType: ${mappedUser.roleType}`);
    console.log(`   Roles: ${mappedUser.roles.map(r => r.name).join(', ')}`);
    console.log('');

    const hasAccess = hasAdminAccess(mappedUser);

    console.log('🔐 Admin Access Test Result:');
    if (hasAccess) {
      console.log('   ✅ PASS - User CAN access admin area');
      console.log('   ✅ User will NOT be redirected to /request-access');
      console.log('   ✅ User can access /admin/blog-categories and other admin pages');
    } else {
      console.log('   ❌ FAIL - User CANNOT access admin area');
      console.log('   ❌ User will be redirected to /request-access');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserAccess();
