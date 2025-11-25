#!/usr/bin/env bun
/**
 * ============================================================================
 * AUDIT: Kiểm tra tất cả projects trong database
 * ============================================================================
 * 
 * Tìm projects có vấn đề về membership
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditAllProjects() {
  console.log('🔍 AUDIT: Kiểm tra tất cả projects\n');
  console.log('='.repeat(60) + '\n');

  try {
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
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            chatMessages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Tổng số projects: ${projects.length}\n`);

    let healthyProjects = 0;
    let projectsWithIssues = 0;
    const issues: string[] = [];

    projects.forEach((project, index) => {
      const isArchived = project.isArchived ? '🗂️' : '';
      console.log(`${index + 1}. ${isArchived} ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Owner: ${project.owner.email}`);
      console.log(`   Created: ${project.createdAt.toLocaleDateString('vi-VN')}`);
      console.log(`   Members: ${project.members.length}`);
      console.log(`   Tasks: ${project._count.tasks} | Messages: ${project._count.chatMessages}`);

      // Check 1: Owner in members?
      const ownerIsMember = project.members.some(m => m.userId === project.ownerId);
      
      if (!ownerIsMember) {
        console.log(`   ❌ ISSUE: Owner KHÔNG có trong members!`);
        projectsWithIssues++;
        issues.push(`Project "${project.name}" (${project.id}): Owner missing from members`);
      } else {
        const ownerMember = project.members.find(m => m.userId === project.ownerId);
        if (ownerMember?.role !== 'owner') {
          console.log(`   ⚠️  WARNING: Owner role sai: "${ownerMember?.role}" (expected "owner")`);
          projectsWithIssues++;
          issues.push(`Project "${project.name}" (${project.id}): Owner has wrong role "${ownerMember?.role}"`);
        } else {
          console.log(`   ✅ OK: Owner in members with correct role`);
          healthyProjects++;
        }
      }

      // List members
      if (project.members.length > 0) {
        console.log(`   👥 Members:`);
        project.members.forEach((member, idx) => {
          const isOwner = member.userId === project.ownerId;
          console.log(`      ${idx + 1}. ${member.user.email} [${member.role}] ${isOwner ? '👑' : ''}`);
        });
      } else {
        console.log(`   ⚠️  No members!`);
      }

      console.log('');
    });

    // Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`Total projects:         ${projects.length}`);
    console.log(`✅ Healthy projects:    ${healthyProjects}`);
    console.log(`❌ Projects with issues: ${projectsWithIssues}`);
    console.log('');

    if (projectsWithIssues > 0) {
      console.log('❌ ISSUES FOUND:');
      issues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`);
      });
      console.log('');
      console.log('🔧 FIX:');
      console.log('   Run: bun scripts/fix-project-owners-as-members.ts');
      console.log('');
    } else {
      console.log('✅ Tất cả projects OK!');
      console.log('');
      console.log('💡 Nếu vẫn có lỗi chat "Not a project member":');
      console.log('   1. Check JWT token trong browser console');
      console.log('   2. Verify userId trong token matches project owner');
      console.log('   3. Check Socket.IO connection logs');
      console.log('   4. Run: bun scripts/debug-jwt-token.ts <your-token>');
      console.log('');
    }

  } catch (error: any) {
    console.error('💥 Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

auditAllProjects()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💀 Audit failed:', error);
    process.exit(1);
  });
