import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * FIX CRITICAL SECURITY ISSUE
 * 
 * Problem: Many admin menus are marked as PUBLIC or have no requiredRoles
 * Result: Users with limited roles can see all admin menus
 * 
 * Solution: Update all admin menus to:
 * 1. Set isPublic = false for admin paths
 * 2. Assign appropriate requiredRoles
 */

async function fixMenuSecurity() {
  console.log('🔒 FIXING MENU SECURITY VULNERABILITY\n');

  // Define role mappings for admin menus
  const menuRoleMappings = [
    {
      title: 'Dashboard',
      path: '/admin',
      roles: ['admin', 'super_admin'],
      isPublic: false,
    },
    {
      title: 'Quản Lý Đơn Hàng',
      path: '/admin/orders',
      roles: ['admin', 'super_admin', 'order_manager', 'ecommerce_manager'],
      isPublic: false,
    },
    {
      title: 'Bài Viết',
      path: '/admin/blog',
      roles: ['admin', 'super_admin', 'blog_manager', 'blog_editor', 'content_manager', 'content_editor'],
      isPublic: false,
    },
    {
      title: 'Danh Mục Bài Viết',
      path: '/admin/blog-categories',
      roles: ['admin', 'super_admin', 'blog_manager', 'blog_editor', 'content_manager'],
      isPublic: false,
    },
    {
      title: 'Danh Mục Sản Phẩm',
      path: '/admin/categories',
      roles: ['admin', 'super_admin', 'product_manager', 'ecommerce_manager', 'blog_manager'],
      isPublic: false,
    },
    {
      title: 'Sản Phẩm',
      path: '/admin/products',
      roles: ['admin', 'super_admin', 'product_manager', 'ecommerce_manager'],
      isPublic: false,
    },
    {
      title: 'Support Chat',
      path: '/admin/support-chat',
      roles: ['admin', 'super_admin', 'support_manager'],
      isPublic: false,
    },
    {
      title: 'Quản Lý Dự Án',
      path: '/projects',
      roles: ['admin', 'super_admin', 'project_manager'],
      isPublic: false,
    },
    {
      title: 'Quản Lý Sản Phẩm',
      path: '/quan-ly-san-pham',
      roles: ['admin', 'super_admin', 'product_manager', 'ecommerce_manager'],
      isPublic: false,
    },
    {
      title: 'Quản Lý Bài Viết',
      path: '/quan-ly-bai-viet',
      roles: ['admin', 'super_admin', 'blog_manager', 'blog_editor', 'content_manager', 'content_editor'],
      isPublic: false,
    },
    {
      title: 'Website',
      path: '/admin/settings/website',
      roles: ['admin', 'super_admin'],
      isPublic: false,
    },
    {
      title: 'Page Builder',
      path: '/admin/pagebuilder',
      roles: ['admin', 'super_admin', 'page_builder_manager', 'content_manager'],
      isPublic: false,
    },
    {
      title: 'Kế Toán',
      path: '/ketoan',
      roles: ['admin', 'super_admin', 'accounting_manager'],
      isPublic: false,
    },
    {
      title: 'File Manager',
      path: '/admin/filemanager',
      roles: ['admin', 'super_admin'],
      isPublic: false,
    },
    {
      title: 'Call Center',
      path: '/admin/callcenter',
      roles: ['admin', 'super_admin', 'call_center_manager'],
      isPublic: false,
    },
    {
      title: 'HR',
      path: '/admin/hr',
      roles: ['admin', 'super_admin', 'hr_manager'],
      isPublic: false,
    },
    {
      title: 'Affiliate',
      path: '/admin/affiliate',
      roles: ['admin', 'super_admin', 'affiliate_manager'],
      isPublic: false,
    },
    {
      title: 'LMS',
      path: '/lms',
      roles: ['admin', 'super_admin', 'lms_manager', 'instructor'],
      isPublic: false,
    },
    {
      title: 'Users',
      path: '/admin/users',
      roles: ['admin', 'super_admin', 'user_manager'],
      isPublic: false,
    },
    {
      title: 'Menus',
      path: '/admin/menu',
      roles: ['admin', 'super_admin'],
      isPublic: false,
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      roles: ['admin', 'super_admin'],
      isPublic: false,
    },
  ];

  console.log(`📝 Updating ${menuRoleMappings.length} admin menus...\n`);

  let updated = 0;
  let failed = 0;

  for (const mapping of menuRoleMappings) {
    try {
      // Find menu by title or path
      const menu = await prisma.menu.findFirst({
        where: {
          OR: [
            { title: mapping.title },
            { route: mapping.path },
            { path: mapping.path },
            { url: mapping.path },
          ],
        },
      });

      if (!menu) {
        console.log(`⚠️  Menu not found: ${mapping.title} (${mapping.path})`);
        failed++;
        continue;
      }

      // Update menu
      await prisma.menu.update({
        where: { id: menu.id },
        data: {
          requiredRoles: mapping.roles,
          isPublic: mapping.isPublic,
        },
      });

      console.log(`✅ Updated: ${menu.title || menu.slug}`);
      console.log(`   Path: ${menu.route || menu.path || menu.url}`);
      console.log(`   Roles: ${mapping.roles.join(', ')}`);
      console.log(`   Public: ${mapping.isPublic}\n`);

      updated++;
    } catch (error) {
      console.error(`❌ Failed to update ${mapping.title}:`, error);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total processed: ${menuRoleMappings.length}`);
}

fixMenuSecurity()
  .then(() => {
    console.log('\n✅ Menu security fix complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
