#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user details...\n');

    // Find admin user
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'katachanneloffical@gmail.com'
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

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   📱 Phone: ${adminUser.phone}`);
    console.log(`   👤 Username: ${adminUser.username}`);
    console.log(`   🆔 First Name: ${adminUser.firstName}`);
    console.log(`   🆔 Last Name: ${adminUser.lastName}`);
    console.log(`   ✅ Active: ${adminUser.isActive}`);
    console.log(`   ✅ Verified: ${adminUser.isVerified}`);
    console.log(`   🔐 Role Type: ${adminUser.roleType}`);
    console.log(`   📅 Created: ${adminUser.createdAt}`);

    console.log('\n🔐 Assigned Roles:');
    if (adminUser.userRoles.length === 0) {
      console.log('   ❌ No roles assigned!');
    } else {
      for (const userRole of adminUser.userRoles) {
        console.log(`   ✅ ${userRole.role.name} (${userRole.role.displayName})`);
        console.log(`      📝 ${userRole.role.description}`);
        console.log(`      🛡️  Permissions: ${userRole.role.permissions.length}`);
        
        // Show first few permissions
        const permissions = userRole.role.permissions.slice(0, 5);
        permissions.forEach(rp => {
          console.log(`         • ${rp.permission.name} - ${rp.permission.displayName}`);
        });
        
        if (userRole.role.permissions.length > 5) {
          console.log(`         ... and ${userRole.role.permissions.length - 5} more permissions`);
        }
      }
    }

    // Check if user has super_admin role
    const hasSuperAdmin = adminUser.userRoles.some(ur => ur.role.name === 'super_admin');
    console.log(`\n🔥 Has Super Admin Role: ${hasSuperAdmin ? '✅ YES' : '❌ NO'}`);

    if (!hasSuperAdmin) {
      console.log('\n⚠️  User does not have super_admin role. Attempting to assign...');
      
      const superAdminRole = await prisma.role.findUnique({
        where: { name: 'super_admin' }
      });

      if (superAdminRole) {
        const existingAssignment = await prisma.userRoleAssignment.findUnique({
          where: {
            userId_roleId: {
              userId: adminUser.id,
              roleId: superAdminRole.id
            }
          }
        });

        if (!existingAssignment) {
          await prisma.userRoleAssignment.create({
            data: {
              userId: adminUser.id,
              roleId: superAdminRole.id,
              assignedBy: 'system'
            }
          });
          console.log('✅ Super admin role assigned successfully!');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();