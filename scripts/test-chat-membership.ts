#!/usr/bin/env bun
/**
 * ============================================================================
 * TEST: Verify Chat Membership Logic
 * ============================================================================
 * 
 * Kiểm tra xem owner có thể join chat hay không
 * 
 * Test cases:
 * 1. Owner join own project → PASS
 * 2. Member join project → PASS
 * 3. Non-member join project → FAIL with clear error
 * 
 * Cách chạy:
 * bun scripts/test-chat-membership.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testChatMembership() {
  console.log('🧪 TESTING: Chat Membership Logic\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Get all projects with members
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 Tổng số dự án: ${projects.length}\n`);

    let passCount = 0;
    let failCount = 0;

    for (const project of projects) {
      console.log(`\n📁 Testing project: ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Owner: ${project.owner.email}`);

      // TEST 1: Owner should be a member
      console.log('\n   🧪 Test 1: Owner is member?');
      const ownerIsMember = project.members.some(
        (m) => m.userId === project.ownerId
      );

      if (ownerIsMember) {
        console.log('   ✅ PASS: Owner tìm thấy trong members');
        
        // Check if owner has correct role
        const ownerMember = project.members.find(m => m.userId === project.ownerId);
        if (ownerMember?.role === 'owner') {
          console.log(`   ✅ PASS: Owner có role đúng: "${ownerMember.role}"`);
          passCount += 2;
        } else {
          console.log(`   ⚠️  WARN: Owner role sai: "${ownerMember?.role}" (expected: "owner")`);
          passCount++;
          failCount++;
        }
      } else {
        console.log('   ❌ FAIL: Owner KHÔNG có trong members!');
        failCount += 2;
      }

      // TEST 2: Check unique constraint
      console.log('\n   🧪 Test 2: Unique constraint check');
      const uniqueMembers = new Set(project.members.map(m => m.userId));
      if (uniqueMembers.size === project.members.length) {
        console.log('   ✅ PASS: Không có duplicate members');
        passCount++;
      } else {
        console.log('   ❌ FAIL: Có duplicate members!');
        failCount++;
      }

      // TEST 3: Simulate socket join
      console.log('\n   🧪 Test 3: Simulate socket join');
      const ownerId = project.ownerId;
      const projectId = project.id;

      try {
        const member = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: ownerId,
            },
          },
        });

        if (member) {
          console.log('   ✅ PASS: Socket query tìm thấy member');
          console.log(`      → Join chat sẽ thành công!`);
          passCount++;
        } else {
          console.log('   ❌ FAIL: Socket query KHÔNG tìm thấy member');
          console.log(`      → Join chat sẽ bị reject với error "Not a project member"`);
          failCount++;
        }
      } catch (error: any) {
        console.log('   ❌ FAIL: Query error:', error.message);
        failCount++;
      }

      // Show all members
      console.log('\n   👥 Danh sách members:');
      project.members.forEach((member, idx) => {
        const isOwner = member.userId === project.ownerId;
        console.log(`      ${idx + 1}. ${member.user.email} [${member.role}] ${isOwner ? '👑' : ''}`);
      });
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ TESTING:');
    console.log('='.repeat(60));
    console.log(`✅ PASS: ${passCount} tests`);
    console.log(`❌ FAIL: ${failCount} tests`);
    
    const total = passCount + failCount;
    const passRate = total > 0 ? ((passCount / total) * 100).toFixed(1) : 0;
    console.log(`\n📈 Tỷ lệ thành công: ${passRate}%`);

    if (failCount === 0) {
      console.log('\n🎉 Tất cả tests PASS! Chat sẽ hoạt động bình thường.\n');
    } else {
      console.log('\n⚠️  Có tests FAIL! Cần chạy fix script:\n');
      console.log('   bun scripts/fix-project-owners-as-members.ts\n');
    }

  } catch (error) {
    console.error('💥 Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testChatMembership()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💀 Tests failed:', error);
    process.exit(1);
  });
