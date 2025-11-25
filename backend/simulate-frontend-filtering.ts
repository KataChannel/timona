import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Simulate frontend menu filtering for user chikiet88@gmail.com
 * This mimics the logic in filterMenuByPermissions
 */

async function simulateFrontendMenuFiltering() {
  console.log('🔍 SIMULATING FRONTEND MENU FILTERING\n');

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: 'chikiet88@gmail.com' },
  });

  if (!user) {
    console.error('❌ User not found');
    return;
  }

  // Get user roles
  const roleAssignments = await prisma.$queryRaw<Array<{role_id: string, role_name: string}>>`
    SELECT r.id as role_id, r.name as role_name
    FROM "UserRoleAssignment" ur
    JOIN "Role" r ON r.id = ur."roleId"
    WHERE ur."userId" = ${user.id}
  `;

  console.log('👤 User:', user.email);
  console.log('📋 Role Type:', user.roleType);
  console.log('🎭 Assigned Roles:', roleAssignments.map((r: any) => r.role_name).join(', '));
  console.log('');

  // Get user role names (normalized to lowercase like frontend does)
  const userRoleNames = roleAssignments.map((r: any) => r.role_name.toLowerCase());
  
  // Add roleType to role names (frontend does this)
  if (user.roleType) {
    const normalizedRoleType = user.roleType.toLowerCase();
    if (!userRoleNames.includes(normalizedRoleType)) {
      userRoleNames.push(normalizedRoleType);
    }
  }

  console.log('✅ Computed Role Names (frontend logic):', userRoleNames.join(', '));
  console.log('');

  // Check if user is admin/super_admin
  const isAdmin = userRoleNames.includes('admin') || userRoleNames.includes('super_admin');
  console.log('🔑 Is Admin/Super Admin?', isAdmin ? 'YES ✅' : 'NO ❌');
  console.log('');

  // Get all SIDEBAR menus
  const allMenus = await prisma.menu.findMany({
    where: {
      type: 'SIDEBAR',
      isActive: true,
      isVisible: true,
    },
    select: {
      id: true,
      title: true,
      route: true,
      path: true,
      url: true,
      slug: true,
      requiredRoles: true,
      requiredPermissions: true,
      isPublic: true,
      level: true,
      parentId: true,
    },
    orderBy: [
      { level: 'asc' },
      { order: 'asc' },
    ],
  });

  console.log(`📋 Total SIDEBAR menus in database: ${allMenus.length}\n`);

  // Filter menus based on frontend logic
  const accessibleMenus: typeof allMenus = [];
  const blockedMenus: typeof allMenus = [];

  for (const menu of allMenus) {
    let canAccess = false;

    // Rule 1: Public menus
    if (menu.isPublic === true) {
      canAccess = true;
      console.log(`✅ ${menu.title} - PUBLIC (isPublic=true)`);
    }
    // Rule 2: Admin/Super Admin can access all
    else if (isAdmin) {
      canAccess = true;
      console.log(`✅ ${menu.title} - ADMIN ACCESS`);
    }
    // Rule 3: Check requiredRoles
    else {
      // Parse requiredRoles (could be array or JSON string)
      let requiredRoles: string[] = [];
      if (menu.requiredRoles) {
        if (Array.isArray(menu.requiredRoles)) {
          requiredRoles = menu.requiredRoles.map(r => r.toLowerCase());
        } else if (typeof menu.requiredRoles === 'string') {
          try {
            const parsed = JSON.parse(menu.requiredRoles);
            if (Array.isArray(parsed)) {
              requiredRoles = parsed.map((r: string) => r.toLowerCase());
            }
          } catch {
            // Not JSON, ignore
          }
        }
      }

      // Parse requiredPermissions
      let requiredPermissions: string[] = [];
      if (menu.requiredPermissions) {
        if (Array.isArray(menu.requiredPermissions)) {
          requiredPermissions = menu.requiredPermissions;
        } else if (typeof menu.requiredPermissions === 'string') {
          try {
            const parsed = JSON.parse(menu.requiredPermissions);
            if (Array.isArray(parsed)) {
              requiredPermissions = parsed;
            }
          } catch {
            // Not JSON, ignore
          }
        }
      }

      // If no requirements, allow access (THIS IS A BUG IN SOME SCENARIOS)
      if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
        canAccess = true;
        console.log(`✅ ${menu.title} - NO REQUIREMENTS (empty requiredRoles/Permissions)`);
      }
      // Check if user has required role
      else if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));
        if (hasRequiredRole) {
          canAccess = true;
          console.log(`✅ ${menu.title} - HAS ROLE (${requiredRoles.join(', ')})`);
        } else {
          console.log(`❌ ${menu.title} - MISSING ROLE (requires: ${requiredRoles.join(', ')})`);
        }
      }
    }

    if (canAccess) {
      accessibleMenus.push(menu);
    } else {
      blockedMenus.push(menu);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 FILTERING RESULT:`);
  console.log(`✅ Accessible menus: ${accessibleMenus.length}`);
  console.log(`❌ Blocked menus: ${blockedMenus.length}`);
  console.log('='.repeat(60));

  console.log('\n✅ USER WILL SEE THESE MENUS:');
  accessibleMenus.forEach((menu, index) => {
    const href = menu.route || menu.path || menu.url || `/${menu.slug}`;
    console.log(`  ${index + 1}. ${menu.title || menu.slug} (${href})`);
  });

  if (blockedMenus.length > 0) {
    console.log('\n❌ BLOCKED MENUS:');
    blockedMenus.forEach((menu, index) => {
      const href = menu.route || menu.path || menu.url || `/${menu.slug}`;
      console.log(`  ${index + 1}. ${menu.title || menu.slug} (${href})`);
    });
  }
}

simulateFrontendMenuFiltering()
  .then(() => {
    console.log('\n✅ Simulation complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
