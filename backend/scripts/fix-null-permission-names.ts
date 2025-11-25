/**
 * Fix Null Permission Names Script
 * 
 * This script fixes the GraphQL error:
 * "Cannot return null for non-nullable field Permission.name"
 * 
 * Uses raw SQL to handle edge cases where Prisma schema doesn't allow null.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixNullPermissionNames() {
  console.log('🔍 Checking for permissions with null or empty names...\n');

  try {
    // Use raw SQL to find permissions with null or empty names
    const nullNamePermissions: any[] = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p."displayName",
        p.description,
        p.resource,
        p.action,
        (SELECT COUNT(*) FROM "RolePermission" WHERE "permissionId" = p.id) as role_count,
        (SELECT COUNT(*) FROM "UserPermission" WHERE "permissionId" = p.id) as user_count
      FROM "Permission" p
      WHERE p.name IS NULL 
         OR p.name = '' 
         OR p."displayName" IS NULL 
         OR p."displayName" = ''
    `;

    if (nullNamePermissions.length === 0) {
      console.log('✅ No permissions with null/empty names found. Database is clean!\n');
      return;
    }

    console.log(`⚠️  Found ${nullNamePermissions.length} permission(s) with null/empty name:\n`);
    
    nullNamePermissions.forEach((perm, index) => {
      console.log(`${index + 1}. Permission ID: ${perm.id}`);
      console.log(`   - Name: ${perm.name || 'NULL/EMPTY'}`);
      console.log(`   - Display Name: ${perm.displayName || 'NULL/EMPTY'}`);
      console.log(`   - Description: ${perm.description || 'N/A'}`);
      console.log(`   - Resource: ${perm.resource || 'N/A'}`);
      console.log(`   - Action: ${perm.action || 'N/A'}`);
      console.log(`   - Used in ${perm.role_count} role(s)`);
      console.log(`   - Used in ${perm.user_count} user permission(s)`);
      console.log('');
    });

    console.log('🔧 Fixing permissions...\n');

    let fixed = 0;
    let deleted = 0;

    for (const perm of nullNamePermissions) {
      try {
        const roleCount = Number(perm.role_count) || 0;
        const userCount = Number(perm.user_count) || 0;

        // If both resource and action exist, generate name from them
        if (perm.resource && perm.action) {
          const generatedName = `${perm.action}:${perm.resource}`.toLowerCase().trim();
          const generatedDisplayName = `${perm.action.charAt(0).toUpperCase() + perm.action.slice(1)} ${perm.resource}`.trim();

          await prisma.$executeRaw`
            UPDATE "Permission"
            SET 
              name = COALESCE(NULLIF(name, ''), ${generatedName}),
              "displayName" = COALESCE(NULLIF("displayName", ''), ${generatedDisplayName})
            WHERE id = ${perm.id}
          `;

          console.log(`✅ Fixed permission ${perm.id}: Generated name "${generatedName}"`);
          fixed++;
        } 
        // If permission is not used anywhere, delete it
        else if (roleCount === 0 && userCount === 0) {
          await prisma.$executeRaw`
            DELETE FROM "Permission" WHERE id = ${perm.id}
          `;

          console.log(`🗑️  Deleted unused permission ${perm.id}`);
          deleted++;
        }
        // Otherwise, set a placeholder name
        else {
          const idShort = perm.id.substring(0, 8);
          const placeholderName = `unknown_permission_${idShort}`;
          const placeholderDisplayName = `Unknown Permission (${idShort})`;
          const placeholderDesc = 'Permission with missing name - needs manual review';

          await prisma.$executeRaw`
            UPDATE "Permission"
            SET 
              name = COALESCE(NULLIF(name, ''), ${placeholderName}),
              "displayName" = COALESCE(NULLIF("displayName", ''), ${placeholderDisplayName}),
              description = COALESCE(description, ${placeholderDesc})
            WHERE id = ${perm.id}
          `;

          console.log(`⚠️  Set placeholder for permission ${perm.id}: "${placeholderName}"`);
          console.log(`   → This permission is in use (${roleCount} roles, ${userCount} users) - needs review!`);
          fixed++;
        }
      } catch (error: any) {
        console.error(`❌ Error processing permission ${perm.id}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   - Fixed: ${fixed}`);
    console.log(`   - Deleted: ${deleted}`);
    console.log(`   - Total processed: ${nullNamePermissions.length}`);
    console.log('\n✅ Database cleanup complete!\n');

    // Verify the fix
    const remainingNullNames: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "Permission"
      WHERE name IS NULL 
         OR name = '' 
         OR "displayName" IS NULL 
         OR "displayName" = ''
    `;

    const remainingCount = Number(remainingNullNames[0]?.count) || 0;

    if (remainingCount > 0) {
      console.log(`⚠️  Warning: Still ${remainingCount} permission(s) with null/empty names.`);
      console.log('   Manual intervention may be required.\n');
    } else {
      console.log('✨ All permissions now have valid names!\n');
    }

  } catch (error: any) {
    console.error('❌ Error during cleanup:', error.message || error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixNullPermissionNames()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
