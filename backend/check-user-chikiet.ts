#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserDetails() {
  try {
    console.log('🔍 Checking user chikiet88@gmail.com details...\n');

    // Find user with all related data
    const user = await prisma.user.findUnique({
      where: {
        email: 'chikiet88@gmail.com'
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
        },
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Username: ${user.username}`);
    console.log(`   🆔 Name: ${user.firstName} ${user.lastName}`);
    console.log(`   ✅ Active: ${user.isActive}`);
    console.log(`   ✅ Verified: ${user.isVerified}`);
    console.log(`   🔐 Role Type: ${user.roleType}`);
    console.log(`   📅 Created: ${user.createdAt}`);

    console.log('\n🔐 Assigned Roles:');
    if (user.userRoles.length === 0) {
      console.log('   ❌ No roles assigned!');
    } else {
      for (const userRole of user.userRoles) {
        console.log(`\n   ✅ Role: ${userRole.role.name}`);
        console.log(`      📝 Display Name: ${userRole.role.displayName}`);
        console.log(`      📄 Description: ${userRole.role.description}`);
        console.log(`      ⚡ Effect: ${userRole.effect}`);
        console.log(`      🛡️  Permissions Count: ${userRole.role.permissions.length}`);
        
        // Show all permissions
        console.log(`      📋 Permissions:`);
        for (const rp of userRole.role.permissions) {
          console.log(`         • ${rp.permission.name} (${rp.permission.resource}:${rp.permission.action})`);
          console.log(`           ${rp.permission.displayName}`);
        }
      }
    }

    console.log('\n🎯 Direct Permissions:');
    if (user.userPermissions.length === 0) {
      console.log('   ❌ No direct permissions assigned!');
    } else {
      for (const up of user.userPermissions) {
        console.log(`   ✅ ${up.permission.name} - ${up.permission.displayName}`);
        console.log(`      Resource: ${up.permission.resource}, Action: ${up.permission.action}`);
        console.log(`      Effect: ${up.effect}`);
      }
    }

    // Check if user should have admin access based on rbac-utils.ts logic
    console.log('\n🔍 Admin Access Check:');
    console.log(`   System roleType: ${user.roleType}`);
    
    const adminRoles = [
      'admin',
      'super_admin',
      'content_manager',
      'content_editor',
      'product_manager',
      'order_manager',
      'user_manager'
    ];
    
    const hasAdminRole = user.userRoles.some(ur => 
      adminRoles.includes(ur.role.name.toLowerCase())
    );
    
    console.log(`   Has admin role: ${hasAdminRole}`);
    console.log(`   Should have admin access: ${user.roleType === 'ADMIN' || hasAdminRole}`);
    
    if (!hasAdminRole && user.roleType !== 'ADMIN') {
      console.log('\n⚠️  ISSUE FOUND:');
      console.log('   User has role "Quản lý Blog" but its internal name is not in the admin roles list.');
      console.log('   The role name should be one of:', adminRoles.join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserDetails();
