#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMenusForRole() {
  try {
    const roleName = 'blog_manager';
    console.log(`🔍 Checking menus for role: ${roleName}\n`);

    // Find all menus that have this role in requiredRoles
    const menus = await prisma.menu.findMany({
      where: {
        requiredRoles: {
          has: roleName
        },
        isActive: true
      },
      select: {
        id: true,
        title: true,
        path: true,
        type: true,
        icon: true,
        requiredRoles: true,
        requiredPermissions: true,
        isActive: true
      }
    });

    console.log(`Found ${menus.length} menus:\n`);

    if (menus.length === 0) {
      console.log('❌ No menus found for this role.');
      console.log('\n💡 To assign menus to this role:');
      console.log('1. Go to Admin → Menu Management');
      console.log('2. Edit a menu item');
      console.log(`3. Add "${roleName}" to the "requiredRoles" array field`);
      console.log('4. Save the menu\n');
    } else {
      menus.forEach((menu, index) => {
        console.log(`${index + 1}. ${menu.title}`);
        console.log(`   Path: ${menu.path}`);
        console.log(`   Type: ${menu.type}`);
        console.log(`   Icon: ${menu.icon || 'none'}`);
        console.log(`   Required Roles: ${menu.requiredRoles.join(', ')}`);
        console.log(`   Required Permissions: ${menu.requiredPermissions.length} permissions`);
        console.log('');
      });
    }

    // Also check total active menus
    const totalMenus = await prisma.menu.count({
      where: { isActive: true }
    });
    
    console.log(`\nℹ️  Total active menus in system: ${totalMenus}`);
    console.log(`📊 Menus accessible by ${roleName}: ${menus.length} (${((menus.length / totalMenus) * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMenusForRole();
