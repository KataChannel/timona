#!/usr/bin/env bun
/**
 * ============================================================================
 * FIX: Tự động thêm owner vào project_members
 * ============================================================================
 * 
 * Vấn đề: 
 * - Dự án cũ được tạo trước khi có logic auto-add owner
 * - Owner không có quyền truy cập chat/tasks của chính dự án mình tạo
 * 
 * Giải pháp:
 * - Tìm tất cả projects mà owner chưa có trong members
 * - Tự động thêm owner vào members với role 'owner'
 * 
 * Cách chạy:
 * cd /chikiet/kataoffical/shoprausach
 * bun scripts/fix-project-owners-as-members.ts
 * 
 * @author Senior Full-Stack Engineer
 * @date 2025-11-10
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProjectWithMembers {
  id: string;
  name: string;
  ownerId: string;
  members: Array<{
    userId: string;
    role: string;
  }>;
}

async function fixProjectOwnersAsMembers() {
  console.log('🔍 Đang tìm các dự án thiếu owner trong members...\n');

  try {
    // Lấy tất cả projects với members
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    }) as ProjectWithMembers[];

    console.log(`📊 Tổng số dự án: ${projects.length}`);

    // Lọc ra các dự án mà owner không có trong members
    const projectsNeedFix = projects.filter(project => {
      const ownerIsMember = project.members.some(
        member => member.userId === project.ownerId
      );
      return !ownerIsMember;
    });

    console.log(`❌ Dự án thiếu owner: ${projectsNeedFix.length}\n`);

    if (projectsNeedFix.length === 0) {
      console.log('✅ Tất cả dự án đã OK! Không cần fix.\n');
      return;
    }

    // Hiển thị danh sách dự án cần fix
    console.log('📋 Danh sách dự án cần fix:');
    projectsNeedFix.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (ID: ${project.id})`);
    });
    console.log('');

    // Fix từng dự án
    let successCount = 0;
    let errorCount = 0;

    for (const project of projectsNeedFix) {
      try {
        console.log(`🔧 Đang fix: "${project.name}"...`);
        
        await prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: project.ownerId,
            role: 'owner',
          },
        });

        console.log(`   ✅ Đã thêm owner vào members`);
        successCount++;
      } catch (error: any) {
        console.error(`   ❌ Lỗi: ${error.message}`);
        errorCount++;
      }
    }

    // Tổng kết
    console.log('\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ:');
    console.log(`   ✅ Thành công: ${successCount} dự án`);
    console.log(`   ❌ Lỗi: ${errorCount} dự án`);
    console.log('='.repeat(60) + '\n');

    if (successCount > 0) {
      console.log('✨ Hoàn thành! Owner đã được thêm vào members.\n');
      console.log('💡 Các owner giờ có thể:');
      console.log('   - Truy cập chat của dự án');
      console.log('   - Xem và quản lý tasks');
      console.log('   - Mời thành viên mới');
      console.log('');
    }

  } catch (error) {
    console.error('💥 Lỗi nghiêm trọng:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixProjectOwnersAsMembers()
  .then(() => {
    console.log('🎉 Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💀 Script thất bại:', error);
    process.exit(1);
  });
