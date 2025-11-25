#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignMenusToRole() {
  try {
    const roleName = 'blog_manager';
    console.log(`🔧 Assigning sample menus to role: ${roleName}\n`);

    // Find menus related to blog
    const blogMenus = await prisma.menu.findMany({
      where: {
        OR: [
          { title: { contains: 'Blog', mode: 'insensitive' } },
          { path: { contains: 'blog', mode: 'insensitive' } },
          { path: { contains: 'categories', mode: 'insensitive' } },
        ],
        isActive: true
      }
    });

    console.log(`Found ${blogMenus.length} blog-related menus\n`);

    if (blogMenus.length === 0) {
      console.log('❌ No blog-related menus found to assign.');
      return;
    }

    // Update each menu to include blog_manager in requiredRoles
    for (const menu of blogMenus) {
      const currentRoles = menu.requiredRoles || [];
      
      if (!currentRoles.includes(roleName)) {
        await prisma.menu.update({
          where: { id: menu.id },
          data: {
            requiredRoles: [...currentRoles, roleName]
          }
        });
        console.log(`✅ Added ${roleName} to menu: ${menu.title} (${menu.path})`);
      } else {
        console.log(`⏭️  Skip: ${menu.title} already has ${roleName}`);
      }
    }

    console.log(`\n✅ Done! ${blogMenus.length} menus updated.`);

    // Verify
    const updatedMenus = await prisma.menu.findMany({
      where: {
        requiredRoles: { has: roleName },
        isActive: true
      }
    });

    console.log(`\n📊 Total menus accessible by ${roleName}: ${updatedMenus.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignMenusToRole();
