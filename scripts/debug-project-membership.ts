#!/usr/bin/env bun
/**
 * Debug: Check specific project membership
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugProjectMembership() {
  try {
    // Get user from localStorage simulation (replace with actual userId)
    console.log('🔍 Nhập userId và projectId để kiểm tra:\n');
    
    // For now, let's check all projects and their members
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`\n📊 Tổng số dự án: ${projects.length}\n`);

    projects.forEach((project, index) => {
      console.log(`${index + 1}. 📁 ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Owner: ${project.owner.email} (${project.ownerId})`);
      console.log(`   Members (${project.members.length}):`);
      
      if (project.members.length === 0) {
        console.log(`   ⚠️  KHÔNG CÓ THÀNH VIÊN NÀO!`);
      } else {
        project.members.forEach(member => {
          const isOwner = member.userId === project.ownerId;
          console.log(`      - ${member.user.email} [${member.role}] ${isOwner ? '👑 (Owner)' : ''}`);
        });
      }

      // Check if owner is in members
      const ownerIsMember = project.members.some(m => m.userId === project.ownerId);
      if (!ownerIsMember) {
        console.log(`   ❌ BUG: Owner không có trong members!`);
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProjectMembership();
