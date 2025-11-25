/**
 * RBAC Roles & Permissions Seed
 * Tạo các role và permission cho hệ thống quản lý content
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Định nghĩa các permissions theo module
const PERMISSIONS = {
  // Blog Posts Management
  BLOG: [
    { resource: 'blog', action: 'create', scope: 'own', displayName: 'Tạo bài viết', description: 'Tạo bài viết mới' },
    { resource: 'blog', action: 'read', scope: 'own', displayName: 'Xem bài viết của mình', description: 'Xem bài viết do mình tạo' },
    { resource: 'blog', action: 'read', scope: 'all', displayName: 'Xem tất cả bài viết', description: 'Xem tất cả bài viết trong hệ thống' },
    { resource: 'blog', action: 'update', scope: 'own', displayName: 'Sửa bài viết của mình', description: 'Chỉnh sửa bài viết do mình tạo' },
    { resource: 'blog', action: 'update', scope: 'all', displayName: 'Sửa tất cả bài viết', description: 'Chỉnh sửa bất kỳ bài viết nào' },
    { resource: 'blog', action: 'delete', scope: 'own', displayName: 'Xóa bài viết của mình', description: 'Xóa bài viết do mình tạo' },
    { resource: 'blog', action: 'delete', scope: 'all', displayName: 'Xóa tất cả bài viết', description: 'Xóa bất kỳ bài viết nào' },
    { resource: 'blog', action: 'publish', scope: 'own', displayName: 'Xuất bản bài viết', description: 'Xuất bản bài viết của mình' },
    { resource: 'blog', action: 'publish', scope: 'all', displayName: 'Xuất bản bất kỳ bài viết', description: 'Xuất bản bất kỳ bài viết nào' },
  ],

  // Blog Categories Management
  BLOG_CATEGORY: [
    { resource: 'blog_category', action: 'create', scope: 'all', displayName: 'Tạo danh mục bài viết', description: 'Tạo danh mục mới cho blog' },
    { resource: 'blog_category', action: 'read', scope: 'all', displayName: 'Xem danh mục bài viết', description: 'Xem tất cả danh mục blog' },
    { resource: 'blog_category', action: 'update', scope: 'all', displayName: 'Sửa danh mục bài viết', description: 'Chỉnh sửa danh mục blog' },
    { resource: 'blog_category', action: 'delete', scope: 'all', displayName: 'Xóa danh mục bài viết', description: 'Xóa danh mục blog' },
  ],

  // Products Management
  PRODUCT: [
    { resource: 'product', action: 'create', scope: 'all', displayName: 'Tạo sản phẩm', description: 'Thêm sản phẩm mới' },
    { resource: 'product', action: 'read', scope: 'all', displayName: 'Xem sản phẩm', description: 'Xem danh sách sản phẩm' },
    { resource: 'product', action: 'update', scope: 'all', displayName: 'Sửa sản phẩm', description: 'Chỉnh sửa thông tin sản phẩm' },
    { resource: 'product', action: 'delete', scope: 'all', displayName: 'Xóa sản phẩm', description: 'Xóa sản phẩm' },
    { resource: 'product', action: 'manage_inventory', scope: 'all', displayName: 'Quản lý tồn kho', description: 'Cập nhật số lượng tồn kho' },
    { resource: 'product', action: 'manage_pricing', scope: 'all', displayName: 'Quản lý giá', description: 'Cập nhật giá sản phẩm' },
  ],

  // Product Categories Management
  PRODUCT_CATEGORY: [
    { resource: 'product_category', action: 'create', scope: 'all', displayName: 'Tạo danh mục sản phẩm', description: 'Tạo danh mục mới' },
    { resource: 'product_category', action: 'read', scope: 'all', displayName: 'Xem danh mục sản phẩm', description: 'Xem tất cả danh mục' },
    { resource: 'product_category', action: 'update', scope: 'all', displayName: 'Sửa danh mục sản phẩm', description: 'Chỉnh sửa danh mục' },
    { resource: 'product_category', action: 'delete', scope: 'all', displayName: 'Xóa danh mục sản phẩm', description: 'Xóa danh mục' },
  ],

  // Orders Management
  ORDER: [
    { resource: 'order', action: 'read', scope: 'all', displayName: 'Xem đơn hàng', description: 'Xem tất cả đơn hàng' },
    { resource: 'order', action: 'update', scope: 'all', displayName: 'Cập nhật đơn hàng', description: 'Cập nhật trạng thái đơn hàng' },
    { resource: 'order', action: 'delete', scope: 'all', displayName: 'Xóa đơn hàng', description: 'Xóa đơn hàng' },
    { resource: 'order', action: 'manage_status', scope: 'all', displayName: 'Quản lý trạng thái', description: 'Thay đổi trạng thái đơn hàng' },
    { resource: 'order', action: 'manage_payment', scope: 'all', displayName: 'Quản lý thanh toán', description: 'Xử lý thanh toán đơn hàng' },
    { resource: 'order', action: 'cancel', scope: 'all', displayName: 'Hủy đơn hàng', description: 'Hủy đơn hàng' },
    { resource: 'order', action: 'refund', scope: 'all', displayName: 'Hoàn tiền', description: 'Xử lý hoàn tiền' },
  ],

  // Page Builder Management
  PAGE_BUILDER: [
    { resource: 'page', action: 'create', scope: 'all', displayName: 'Tạo trang', description: 'Tạo trang mới với Page Builder' },
    { resource: 'page', action: 'read', scope: 'all', displayName: 'Xem trang', description: 'Xem tất cả các trang' },
    { resource: 'page', action: 'update', scope: 'all', displayName: 'Sửa trang', description: 'Chỉnh sửa nội dung trang' },
    { resource: 'page', action: 'delete', scope: 'all', displayName: 'Xóa trang', description: 'Xóa trang' },
    { resource: 'page', action: 'publish', scope: 'all', displayName: 'Xuất bản trang', description: 'Xuất bản/Gỡ xuất bản trang' },
    { resource: 'template', action: 'create', scope: 'all', displayName: 'Tạo template', description: 'Tạo template cho Page Builder' },
    { resource: 'template', action: 'update', scope: 'all', displayName: 'Sửa template', description: 'Chỉnh sửa template' },
    { resource: 'template', action: 'delete', scope: 'all', displayName: 'Xóa template', description: 'Xóa template' },
  ],

  // File Manager (dùng chung cho tất cả modules)
  FILE_MANAGER: [
    { resource: 'file', action: 'upload', scope: 'all', displayName: 'Upload file', description: 'Upload file/hình ảnh' },
    { resource: 'file', action: 'read', scope: 'all', displayName: 'Xem file', description: 'Xem file manager' },
    { resource: 'file', action: 'delete', scope: 'all', displayName: 'Xóa file', description: 'Xóa file/hình ảnh' },
    { resource: 'file', action: 'organize', scope: 'all', displayName: 'Quản lý file', description: 'Tổ chức thư mục, di chuyển file' },
  ],
};

// Định nghĩa các roles
const ROLES = [
  {
    name: 'blog_manager',
    displayName: 'Quản lý Blog',
    description: 'Quản lý bài viết và danh mục blog',
    permissions: [
      ...PERMISSIONS.BLOG,
      ...PERMISSIONS.BLOG_CATEGORY,
      ...PERMISSIONS.FILE_MANAGER,
    ],
  },
  {
    name: 'blog_editor',
    displayName: 'Biên tập viên Blog',
    description: 'Tạo và chỉnh sửa bài viết của mình',
    permissions: [
      ...PERMISSIONS.BLOG.filter(p => p.scope === 'own' || (p.action === 'read' && p.scope === 'all')),
      { resource: 'blog_category', action: 'read', scope: 'all', displayName: 'Xem danh mục bài viết', description: 'Xem tất cả danh mục blog' },
      ...PERMISSIONS.FILE_MANAGER,
    ],
  },
  {
    name: 'product_manager',
    displayName: 'Quản lý Sản phẩm',
    description: 'Quản lý sản phẩm và danh mục sản phẩm',
    permissions: [
      ...PERMISSIONS.PRODUCT,
      ...PERMISSIONS.PRODUCT_CATEGORY,
      ...PERMISSIONS.FILE_MANAGER,
    ],
  },
  {
    name: 'order_manager',
    displayName: 'Quản lý Đơn hàng',
    description: 'Xử lý và quản lý đơn hàng',
    permissions: [
      ...PERMISSIONS.ORDER,
    ],
  },
  {
    name: 'page_builder_manager',
    displayName: 'Quản lý Page Builder',
    description: 'Tạo và quản lý các trang website',
    permissions: [
      ...PERMISSIONS.PAGE_BUILDER,
      ...PERMISSIONS.FILE_MANAGER,
    ],
  },
  {
    name: 'content_manager',
    displayName: 'Quản lý Nội dung',
    description: 'Quản lý tất cả nội dung (blog, sản phẩm, trang)',
    permissions: [
      ...PERMISSIONS.BLOG,
      ...PERMISSIONS.BLOG_CATEGORY,
      ...PERMISSIONS.PRODUCT,
      ...PERMISSIONS.PRODUCT_CATEGORY,
      ...PERMISSIONS.PAGE_BUILDER,
      ...PERMISSIONS.FILE_MANAGER,
    ],
  },
  {
    name: 'ecommerce_manager',
    displayName: 'Quản lý E-commerce',
    description: 'Quản lý sản phẩm và đơn hàng',
    permissions: [
      ...PERMISSIONS.PRODUCT,
      ...PERMISSIONS.PRODUCT_CATEGORY,
      ...PERMISSIONS.ORDER,
      ...PERMISSIONS.FILE_MANAGER,
    ],
  },
];

async function seedRBACRolesPermissions() {
  console.log('🚀 Bắt đầu seed RBAC Roles & Permissions...');

  try {
    // 1. Tạo tất cả permissions
    console.log('📝 Tạo permissions...');
    const allPermissions = Object.values(PERMISSIONS).flat();
    const createdPermissions = new Map();

    for (const perm of allPermissions) {
      const permission = await prisma.permission.upsert({
        where: {
          resource_action_scope: {
            resource: perm.resource,
            action: perm.action,
            scope: perm.scope || null,
          },
        },
        update: {
          displayName: perm.displayName,
          description: perm.description,
        },
        create: {
          name: `${perm.resource}:${perm.action}${perm.scope ? ':' + perm.scope : ''}`,
          displayName: perm.displayName,
          description: perm.description,
          resource: perm.resource,
          action: perm.action,
          scope: perm.scope,
          isSystemPerm: true,
          category: perm.resource.includes('blog') ? 'blog' : 
                    perm.resource.includes('product') ? 'ecommerce' :
                    perm.resource.includes('order') ? 'ecommerce' :
                    perm.resource.includes('page') || perm.resource.includes('template') ? 'page_builder' :
                    perm.resource.includes('file') ? 'file_management' : 'general',
        },
      });

      const key = `${perm.resource}:${perm.action}:${perm.scope || 'null'}`;
      createdPermissions.set(key, permission);
    }

    console.log(`✅ Đã tạo ${createdPermissions.size} permissions`);

    // 2. Tạo roles và gán permissions
    console.log('👥 Tạo roles...');
    for (const roleData of ROLES) {
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {
          displayName: roleData.displayName,
          description: roleData.description,
        },
        create: {
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
          isSystemRole: true,
          isActive: true,
          priority: 10,
        },
      });

      console.log(`  📌 Role: ${role.displayName}`);

      // Gán permissions cho role
      for (const perm of roleData.permissions) {
        const key = `${perm.resource}:${perm.action}:${perm.scope || 'null'}`;
        const permission = createdPermissions.get(key);

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
              effect: 'allow',
            },
          });
        }
      }

      const permCount = roleData.permissions.length;
      console.log(`    ✓ Đã gán ${permCount} permissions`);
    }

    console.log('\n✨ Hoàn thành seed RBAC Roles & Permissions!');
    console.log(`\n📊 Tổng kết:`);
    console.log(`   - ${createdPermissions.size} permissions`);
    console.log(`   - ${ROLES.length} roles`);
    console.log(`\n🔑 Các roles đã tạo:`);
    ROLES.forEach(role => {
      console.log(`   - ${role.displayName} (${role.name}): ${role.permissions.length} permissions`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi seed RBAC:', error);
    throw error;
  }
}

// Run seed
seedRBACRolesPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
