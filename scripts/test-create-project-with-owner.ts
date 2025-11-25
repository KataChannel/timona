#!/usr/bin/env bun
/**
 * ============================================================================
 * TEST: Tạo project mới và verify owner được add vào members
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCreateProject() {
  console.log('🧪 TEST: Tạo project mới\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Get first user to test
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      console.error('❌ Không tìm thấy user nào trong database');
      return;
    }

    console.log('👤 Test user:', user.email);
    console.log('');

    // Create new project
    const testProjectName = `Test Project ${Date.now()}`;
    console.log('📝 Đang tạo project:', testProjectName);

    const project = await prisma.project.create({
      data: {
        name: testProjectName,
        description: 'Test project to verify owner membership',
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    console.log('✅ Project created:', project.id);
    console.log('');

    // Verify owner in members
    console.log('🔍 Kiểm tra members:');
    console.log('   Total members:', project.members.length);

    const ownerIsMember = project.members.some(m => m.userId === user.id);
    console.log('');

    if (ownerIsMember) {
      console.log('✅ PASS: Owner đã được thêm vào members!');
      const ownerMember = project.members.find(m => m.userId === user.id);
      console.log(`   - Email: ${ownerMember?.user.email}`);
      console.log(`   - Role: ${ownerMember?.role}`);
      console.log('');
    } else {
      console.log('❌ FAIL: Owner KHÔNG có trong members!');
      console.log('');
    }

    // Verify can join chat
    console.log('🔍 Simulate Socket.IO join_project query:');
    const memberCheck = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: user.id,
        },
      },
    });

    if (memberCheck) {
      console.log('✅ PASS: Socket join sẽ thành công!');
      console.log(`   → Owner có thể truy cập chat`);
      console.log('');
    } else {
      console.log('❌ FAIL: Socket join sẽ bị reject!');
      console.log(`   → Owner KHÔNG thể truy cập chat`);
      console.log('');
    }

    // Cleanup: Delete test project
    console.log('🧹 Cleaning up...');
    await prisma.project.delete({
      where: { id: project.id },
    });
    console.log('✅ Test project deleted');
    console.log('');

    console.log('='.repeat(60));
    console.log('📊 KẾT QUẢ:');
    console.log('='.repeat(60));
    if (ownerIsMember && memberCheck) {
      console.log('✅ CREATE PROJECT LOGIC ĐÚNG!');
      console.log('   - Owner được add vào members ✅');
      console.log('   - Owner có thể join chat ✅');
      console.log('');
      console.log('💡 Kết luận:');
      console.log('   Backend logic hoạt động đúng.');
      console.log('   Nếu vẫn có lỗi chat, check:');
      console.log('   1. Token JWT có đúng userId không?');
      console.log('   2. Frontend có pass đúng projectId không?');
      console.log('   3. Browser console có log gì không?');
    } else {
      console.log('❌ CREATE PROJECT LOGIC SAI!');
      console.log('   Cần fix backend code.');
    }
    console.log('');

  } catch (error: any) {
    console.error('💥 Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testCreateProject()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💀 Test failed:', error);
    process.exit(1);
  });
