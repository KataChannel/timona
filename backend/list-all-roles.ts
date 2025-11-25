#!/usr/bin/env bun

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllRoles() {
  try {
    console.log('🔍 Listing all roles in the system...\n');

    const roles = await prisma.role.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Found ${roles.length} roles:\n`);

    const currentAdminRoles = [
      'admin',
      'super_admin',
      'content_manager',
      'content_editor',
      'product_manager',
      'order_manager',
      'user_manager',
      'blog_manager'
    ];

    for (const role of roles) {
      const isInList = currentAdminRoles.includes(role.name.toLowerCase());
      const status = isInList ? '✅' : '⚠️ ';
      console.log(`${status} ${role.name}`);
      console.log(`   📝 ${role.displayName}`);
      console.log(`   📄 ${role.description}`);
      if (!isInList) {
        console.log(`   ⚠️  NOT in admin roles list - users with this role CANNOT access admin area`);
      }
      console.log('');
    }

    const notInList = roles.filter(r => !currentAdminRoles.includes(r.name.toLowerCase()));
    if (notInList.length > 0) {
      console.log('\n⚠️  Roles NOT in admin access list:');
      notInList.forEach(r => {
        console.log(`   • ${r.name} (${r.displayName})`);
      });
      console.log('\nConsider adding these to adminRoles array in rbac-utils.ts if they should have admin access.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllRoles();
