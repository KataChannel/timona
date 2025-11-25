import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSearchRolesQuery() {
  console.log('🔍 Testing SEARCH_ROLES Query Data Structure\n');

  // Simulate what the GraphQL query does
  const roles = await prisma.role.findMany({
    where: {
      isActive: true,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
    take: 5,
  });

  console.log(`Found ${roles.length} roles\n`);

  roles.forEach((role) => {
    console.log(`\n📋 Role: ${role.displayName} (${role.name})`);
    console.log(`   ID: ${role.id}`);
    console.log(`   Permissions: ${role.permissions.length} items`);
    
    if (role.permissions.length > 0) {
      console.log('\n   Permission Structure:');
      const firstPerm = role.permissions[0];
      console.log('   {');
      console.log(`     id: "${firstPerm.id}",`);
      console.log(`     effect: "${firstPerm.effect}",`);
      console.log(`     roleId: "${firstPerm.roleId}",`);
      console.log(`     permissionId: "${firstPerm.permissionId}",`);
      console.log('     permission: {');
      console.log(`       id: "${firstPerm.permission.id}",`);
      console.log(`       name: "${firstPerm.permission.name}",`);
      console.log(`       displayName: "${firstPerm.permission.displayName}",`);
      console.log('       ...');
      console.log('     }');
      console.log('   }');
      
      console.log(`\n   ✅ Total permissions for ${role.name}: ${role.permissions.length}`);
    } else {
      console.log('   ⚠️  No permissions assigned');
    }
    
    console.log('\n' + '='.repeat(60));
  });

  // Show what frontend expects vs what DB provides
  console.log('\n\n📊 ANALYSIS:');
  console.log('Frontend SEARCH_ROLES query expects:');
  console.log('  permissions { id, name, displayName, resource, action, scope, ... }');
  console.log('\nDatabase provides (via Prisma include):');
  console.log('  permissions { id, effect, roleId, permissionId, permission: { id, name, ... } }');
  console.log('\n❌ MISMATCH: The GraphQL query structure does not match the database relationship!');
  console.log('\n✅ Solution: Update SEARCH_ROLES query to match GET_ROLE_BY_ID structure:');
  console.log('  permissions { id, effect, permission { id, name, displayName, ... } }');
}

testSearchRolesQuery()
  .then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
