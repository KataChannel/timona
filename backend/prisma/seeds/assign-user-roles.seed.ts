/**
 * User Role Assignment Script
 * Script để gán roles cho users
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RoleAssignment {
  userEmail: string;
  roleName: string;
}

// Danh sách user và role cần gán
// Thay đổi theo nhu cầu thực tế
const ASSIGNMENTS: RoleAssignment[] = [
  // Admin có tất cả quyền
  { userEmail: 'admin@example.com', roleName: 'content_manager' },
  
  // Nhân viên blog
  { userEmail: 'blog.editor@example.com', roleName: 'blog_editor' },
  { userEmail: 'blog.manager@example.com', roleName: 'blog_manager' },
  
  // Nhân viên sản phẩm
  { userEmail: 'product.manager@example.com', roleName: 'product_manager' },
  
  // Nhân viên đơn hàng
  { userEmail: 'order.manager@example.com', roleName: 'order_manager' },
  
  // Nhân viên page builder
  { userEmail: 'page.manager@example.com', roleName: 'page_builder_manager' },
  
  // Nhân viên e-commerce
  { userEmail: 'ecommerce.manager@example.com', roleName: 'ecommerce_manager' },
];

async function assignUserRoles() {
  console.log('🚀 Bắt đầu gán roles cho users...\n');

  try {
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const assignment of ASSIGNMENTS) {
      try {
        // Tìm user theo email
        const user = await prisma.user.findUnique({
          where: { email: assignment.userEmail },
        });

        if (!user) {
          console.log(`⚠️  User không tồn tại: ${assignment.userEmail}`);
          skipCount++;
          continue;
        }

        // Tìm role theo tên
        const role = await prisma.role.findUnique({
          where: { name: assignment.roleName },
        });

        if (!role) {
          console.log(`⚠️  Role không tồn tại: ${assignment.roleName}`);
          skipCount++;
          continue;
        }

        // Kiểm tra xem đã gán chưa
        const existing = await prisma.userRoleAssignment.findUnique({
          where: {
            userId_roleId: {
              userId: user.id,
              roleId: role.id,
            },
          },
        });

        if (existing) {
          console.log(`  ℹ️  Đã gán: ${user.email} → ${role.displayName}`);
          skipCount++;
          continue;
        }

        // Gán role cho user
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: role.id,
            effect: 'allow',
            assignedAt: new Date(),
          },
        });

        console.log(`  ✅ Gán thành công: ${user.email} → ${role.displayName}`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Lỗi khi gán ${assignment.userEmail}:`, error instanceof Error ? error.message : error);
        errorCount++;
      }
    }

    console.log('\n📊 Tổng kết:');
    console.log(`   - Thành công: ${successCount}`);
    console.log(`   - Bỏ qua: ${skipCount}`);
    console.log(`   - Lỗi: ${errorCount}`);
    console.log(`   - Tổng: ${ASSIGNMENTS.length}`);

    if (successCount > 0) {
      console.log('\n✨ Đã gán roles cho users thành công!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

// Run
assignUserRoles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
