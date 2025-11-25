import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  UserRoleType,
  PostStatus,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  MenuType,
  BlockType,
  ChatbotStatus,
  TrainingDataType,
  TrainingStatus,
  AffUserRole,
  AffCampaignStatus,
} from '@prisma/client';

/**
 * Comprehensive Data Seeder Service
 * Seeds demo data for ALL models in schema.prisma
 * Uses admin user: katachanneloffical@gmail.com
 * 
 * NOTE: This seeder is DISABLED to prevent automatic seed data creation.
 * Only RBAC seeder (rbac-seeder.service.ts) should run automatically.
 */
@Injectable()
export class ComprehensiveSeederService {
  private readonly logger = new Logger(ComprehensiveSeederService.name);
  private adminUser: any;

  constructor(private readonly prisma: PrismaService) {}

  // DISABLED: Removed OnModuleInit to prevent automatic seeding
  // If you need to run this seeder, call seedAll() manually
  
  /**
   * Main seeding function - call manually if needed
   * WARNING: This will create demo/sample data
   */
  async seedAll() {
    try {
      this.logger.log('🌱 Starting comprehensive database seeding...');
      
      // Seed in order to respect dependencies
      await this.seedAdminUser();
      await this.seedRBAC();
      await this.seedContent();
      await this.seedTasks();
      await this.seedMenus();
      await this.seedPages();
      await this.seedAIData();
      await this.seedAffiliateSystem();
      await this.seedSecuritySettings();
      await this.seedNotifications();

      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error(`❌ Seeding failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 1. Seed Admin User
   */
  private async seedAdminUser() {
    this.logger.log('👤 Seeding admin user...');

    const email = 'katachanneloffical@gmail.com';
    const password = 'Admin@2024';
    const hashedPassword = await bcrypt.hash(password, 12);

    this.adminUser = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username: 'admin',
        password: hashedPassword,
        firstName: 'Kata',
        lastName: 'Admin',
        roleType: UserRoleType.ADMIN,
        isActive: true,
        isVerified: true,
      },
    });

    this.logger.log(`✅ Admin user created: ${email}`);
  }

  /**
   * 2. Seed RBAC (Roles, Permissions, Assignments)
   */
  private async seedRBAC() {
    this.logger.log('🔐 Seeding RBAC data...');

    // Create Roles
    const superAdminRole = await this.prisma.role.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access',
        isSystemRole: true,
        isActive: true,
        priority: 1,
        createdBy: this.adminUser.id,
      },
    });

    const adminRole = await this.prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access',
        parentId: superAdminRole.id,
        isSystemRole: true,
        isActive: true,
        priority: 2,
        createdBy: this.adminUser.id,
      },
    });

    const editorRole = await this.prisma.role.upsert({
      where: { name: 'editor' },
      update: {},
      create: {
        name: 'editor',
        displayName: 'Editor',
        description: 'Content editing access',
        isSystemRole: true,
        isActive: true,
        priority: 3,
        createdBy: this.adminUser.id,
      },
    });

    const userRole = await this.prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: {
        name: 'user',
        displayName: 'User',
        description: 'Standard user access',
        isSystemRole: true,
        isActive: true,
        priority: 4,
        createdBy: this.adminUser.id,
      },
    });

    // Create Permissions
    const permissions = [
      { name: 'user.read', displayName: 'Read Users', description: 'View user data', resource: 'USER', action: 'READ', scope: 'ALL' },
      { name: 'user.write', displayName: 'Write Users', description: 'Create/update users', resource: 'USER', action: 'WRITE', scope: 'ALL' },
      { name: 'user.delete', displayName: 'Delete Users', description: 'Delete users', resource: 'USER', action: 'DELETE', scope: 'ALL' },
      { name: 'post.read', displayName: 'Read Posts', description: 'View posts', resource: 'POST', action: 'READ', scope: 'ALL' },
      { name: 'post.write', displayName: 'Write Posts', description: 'Create/update posts', resource: 'POST', action: 'WRITE', scope: 'ALL' },
      { name: 'post.delete', displayName: 'Delete Posts', description: 'Delete posts', resource: 'POST', action: 'DELETE', scope: 'ALL' },
      { name: 'task.read', displayName: 'Read Tasks', description: 'View tasks', resource: 'TASK', action: 'READ', scope: 'ALL' },
      { name: 'task.write', displayName: 'Write Tasks', description: 'Create/update tasks', resource: 'TASK', action: 'WRITE', scope: 'ALL' },
      { name: 'task.delete', displayName: 'Delete Tasks', description: 'Delete tasks', resource: 'TASK', action: 'DELETE', scope: 'ALL' },
    ];

    for (const perm of permissions) {
      await this.prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: {
          ...perm,
          isSystemPerm: true,
          isActive: true,
          createdBy: this.adminUser.id,
        },
      });
    }

    // Grant all permissions to Super Admin role
    for (const perm of permissions) {
      const permission = await this.prisma.permission.findUnique({ where: { name: perm.name } });
      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
          grantedBy: this.adminUser.id,
        },
      });
    }

    // Assign Super Admin role to admin user
    await this.prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: this.adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: this.adminUser.id,
        roleId: superAdminRole.id,
        assignedBy: this.adminUser.id,
      },
    });

    this.logger.log('✅ Created 4 roles, 9 permissions, and assignments');
  }

  /**
   * 3. Seed Content (Posts, Tags, Comments, Likes)
   */
  private async seedContent() {
    this.logger.log('📝 Seeding content data...');

    // Create Tags
    const techTag = await this.prisma.tag.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        color: '#3b82f6',
        createdBy: this.adminUser.id,
      },
    });

    const programmingTag = await this.prisma.tag.upsert({
      where: { slug: 'programming' },
      update: {},
      create: {
        name: 'Programming',
        slug: 'programming',
        color: '#8b5cf6',
        createdBy: this.adminUser.id,
      },
    });

    const webdevTag = await this.prisma.tag.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        color: '#10b981',
        createdBy: this.adminUser.id,
      },
    });

    const fullstackTag = await this.prisma.tag.upsert({
      where: { slug: 'fullstack' },
      update: {},
      create: {
        name: 'Fullstack',
        slug: 'fullstack',
        color: '#f59e0b',
        createdBy: this.adminUser.id,
      },
    });

    const tags = [techTag, programmingTag, webdevTag, fullstackTag];

    // Create Posts
    const posts = [];
    for (let i = 1; i <= 10; i++) {
      const post = await this.prisma.post.upsert({
        where: { slug: `demo-post-${i}` },
        update: {},
        create: {
          title: `Demo Post ${i}: ${this.getRandomPostTitle(i)}`,
          content: this.getRandomPostContent(i),
          excerpt: `This is a demo post excerpt for post ${i}.`,
          slug: `demo-post-${i}`,
          featuredImage: `https://placehold.co/800x600/6366f1/ffffff?text=Post+${i}`,
          status: i <= 7 ? PostStatus.PUBLISHED : PostStatus.DRAFT,
          publishedAt: i <= 7 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null,
          authorId: this.adminUser.id,
        },
      });
      posts.push(post);

      // Attach tags to posts
      const randomTags = tags.slice(0, Math.floor(Math.random() * 3) + 1);
      for (const tag of randomTags) {
        await this.prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Create Comments
    let commentCount = 0;
    for (const post of posts.slice(0, 5)) {
      for (let j = 1; j <= 3; j++) {
        commentCount++;
        await this.prisma.comment.create({
          data: {
            content: `This is comment ${commentCount} on ${post.title}`,
            postId: post.id,
            userId: this.adminUser.id,
          },
        });
      }
    }

    // Create Likes
    for (const post of posts.slice(0, 7)) {
      await this.prisma.like.upsert({
        where: {
          postId_userId: {
            postId: post.id,
            userId: this.adminUser.id,
          },
        },
        update: {},
        create: {
          postId: post.id,
          userId: this.adminUser.id,
        },
      });
    }

    this.logger.log(`✅ Created ${posts.length} posts, 4 tags, ${commentCount} comments, 7 likes`);
  }

  /**
   * 4. Seed Tasks
   */
  private async seedTasks() {
    this.logger.log('✅ Seeding tasks...');

    const categories = [TaskCategory.WORK, TaskCategory.PERSONAL, TaskCategory.SHOPPING, TaskCategory.OTHER];
    const priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.URGENT];
    const statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED];

    const tasks = [];
    for (let i = 1; i <= 20; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const task = await this.prisma.task.create({
        data: {
          title: `Task ${i}: ${this.getRandomTaskTitle(i)}`,
          description: `Demo task description for task ${i}. ${this.getRandomTaskDescription(i)}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: status,
          userId: this.adminUser.id,
          dueDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)),
          completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
        },
      });
      tasks.push(task);

      // Add task comments
      if (i % 3 === 0) {
        await this.prisma.taskComment.create({
          data: {
            content: `Progress update for ${task.title}`,
            taskId: task.id,
            userId: this.adminUser.id,
          },
        });
      }
    }

    this.logger.log(`✅ Created ${tasks.length} tasks with subtasks and comments`);
  }

  /**
   * 5. Seed Menus
   */
  private async seedMenus() {
    this.logger.log('📋 Seeding menu structure...');

    // Admin Sidebar Menus
    await this.prisma.menu.upsert({
      where: { slug: 'dashboard' },
      update: {},
      create: {
        title: 'Dashboard',
        slug: 'dashboard',
        type: MenuType.SIDEBAR,
        route: '/admin/dashboard',
        icon: 'LayoutDashboard',
        order: 1,
        isActive: true,
        isVisible: true,
        createdBy: this.adminUser.id,
      },
    });

    const contentMenu = await this.prisma.menu.upsert({
      where: { slug: 'content' },
      update: {},
      create: {
        title: 'Content',
        slug: 'content',
        type: MenuType.SIDEBAR,
        icon: 'FileText',
        order: 2,
        isActive: true,
        isVisible: true,
        createdBy: this.adminUser.id,
      },
    });

    await this.prisma.menu.upsert({
      where: { slug: 'posts' },
      update: {},
      create: {
        title: 'Posts',
        slug: 'posts',
        type: MenuType.SIDEBAR,
        parentId: contentMenu.id,
        route: '/admin/posts',
        icon: 'FileText',
        order: 1,
        isActive: true,
        isVisible: true,
        createdBy: this.adminUser.id,
      },
    });

    await this.prisma.menu.upsert({
      where: { slug: 'tasks-menu' },
      update: {},
      create: {
        title: 'Tasks',
        slug: 'tasks-menu',
        type: MenuType.SIDEBAR,
        route: '/admin/tasks',
        icon: 'CheckSquare',
        order: 3,
        isActive: true,
        isVisible: true,
        createdBy: this.adminUser.id,
      },
    });

    // Header Menus
    await this.prisma.menu.upsert({
      where: { slug: 'home' },
      update: {},
      create: {
        title: 'Home',
        slug: 'home',
        type: MenuType.HEADER,
        route: '/',
        order: 1,
        isActive: true,
        isVisible: true,
        isPublic: true,
        createdBy: this.adminUser.id,
      },
    });

    await this.prisma.menu.upsert({
      where: { slug: 'about' },
      update: {},
      create: {
        title: 'About',
        slug: 'about',
        type: MenuType.HEADER,
        route: '/about',
        order: 2,
        isActive: true,
        isVisible: true,
        isPublic: true,
        createdBy: this.adminUser.id,
      },
    });

    this.logger.log('✅ Created menu structure');
  }

  /**
   * 6. Seed Pages
   */
  private async seedPages() {
    this.logger.log('📄 Seeding pages...');

    const homePage = await this.prisma.page.create({
      data: {
        title: 'Home Page',
        slug: 'home',
        description: 'Main landing page',
        publishedAt: new Date(),
        createdBy: this.adminUser.id,
      },
    });

    await this.prisma.pageBlock.create({
      data: {
        pageId: homePage.id,
        type: BlockType.HERO,
        content: { heading: 'Welcome to rausachcore', subheading: 'Built with Next.js, NestJS, and Prisma' },
        order: 1,
      },
    });

    await this.prisma.pageBlock.create({
      data: {
        pageId: homePage.id,
        type: BlockType.TEXT,
        content: { title: 'Features', items: ['GraphQL API', 'Authentication', 'RBAC', 'Real-time', 'Cloud Storage'] },
        order: 2,
      },
    });

    this.logger.log('✅ Created pages and blocks');
  }

  /**
   * 7. Seed AI/Chatbot Data
   */
  private async seedAIData() {
    this.logger.log('🤖 Seeding AI/Chatbot data...');

    const chatbot = await this.prisma.chatbotModel.create({
      data: {
        name: 'KataBot',
        description: 'Official rausachcore chatbot assistant',
        status: ChatbotStatus.ACTIVE,
        userId: this.adminUser.id,
        systemPrompt: 'You are a helpful assistant for rausachcore platform.',
      },
    });

    await this.prisma.trainingData.create({
      data: {
        chatbotId: chatbot.id,
        userId: this.adminUser.id,
        title: 'rausachcore Introduction',
        content: 'rausachcore is a modern fullstack starter kit.',
        type: TrainingDataType.TEXT,
        status: TrainingStatus.COMPLETED,
      },
    });

    this.logger.log('✅ Created chatbot model and training data');
  }

  /**
   * 8. Seed Affiliate System
   */
  private async seedAffiliateSystem() {
    this.logger.log('💰 Seeding affiliate system...');

    // Create affiliate user profile
    const affUser = await this.prisma.affUser.create({
      data: {
        userId: this.adminUser.id,
        role: AffUserRole.AFFILIATE,
      },
    });

    // Create affiliate campaign
    const campaign = await this.prisma.affCampaign.create({
      data: {
        name: 'Demo Campaign 2024',
        description: 'Demo affiliate campaign for testing',
        productName: 'rausachcore Pro',
        productUrl: 'https://rausachcore.dev/pro',
        commissionRate: 10.0,
        commissionType: 'percentage',
        status: AffCampaignStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        creatorId: affUser.id,
      },
    });

    // Join campaign
    await this.prisma.affCampaignAffiliate.create({
      data: {
        campaignId: campaign.id,
        affiliateId: affUser.id,
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    // Create affiliate link
    await this.prisma.affLink.create({
      data: {
        affiliateId: affUser.id,
        campaignId: campaign.id,
        trackingCode: 'KATA-DEMO-2024',
        originalUrl: 'https://rausachcore.dev',
        shortUrl: 'https://kata.link/demo',
        isActive: true,
      },
    });

    this.logger.log('✅ Created affiliate user, campaign, and link');
  }

  /**
   * 9. Seed Security Settings
   */
  private async seedSecuritySettings() {
    this.logger.log('🔒 Seeding security settings...');

    await this.prisma.userMfaSettings.upsert({
      where: { userId: this.adminUser.id },
      update: {},
      create: {
        userId: this.adminUser.id,
        totpEnabled: false,
        smsEnabled: false,
        emailEnabled: false,
        backupCodesGenerated: false,
      },
    });

    this.logger.log('✅ Created security settings for admin user');
  }

  /**
   * 10. Seed Notifications
   */
  private async seedNotifications() {
    this.logger.log('🔔 Seeding notifications...');

    await this.prisma.notification.create({
      data: {
        userId: this.adminUser.id,
        title: 'Welcome to rausachcore!',
        message: 'Your admin account has been set up successfully.',
        type: 'info',
        isRead: false,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: this.adminUser.id,
        title: 'Demo Data Created',
        message: 'All demo data has been seeded successfully.',
        type: 'success',
        isRead: false,
      },
    });

    this.logger.log('✅ Created 2 notifications');
  }

  // Helper functions for random content generation
  private getRandomPostTitle(index: number): string {
    const titles = [
      'Getting Started with NestJS',
      'Advanced GraphQL Techniques',
      'Building Scalable APIs',
      'React Best Practices 2024',
      'Database Optimization Tips',
      'Authentication Strategies',
      'Modern Frontend Architecture',
      'Microservices with Node.js',
      'Testing Strategies for Web Apps',
      'Cloud Deployment Guide',
    ];
    return titles[index % titles.length] || `Demo Post ${index}`;
  }

  private getRandomPostContent(index: number): string {
    return `
# Introduction

This is demo post ${index} created by the comprehensive seeder.

## Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Conclusion

This post demonstrates the seeding functionality of rausachcore.
    `.trim();
  }

  private getRandomTaskTitle(index: number): string {
    const titles = [
      'Update documentation',
      'Review pull requests',
      'Fix bugs in authentication',
      'Optimize database queries',
      'Design new landing page',
      'Implement user dashboard',
      'Write unit tests',
      'Deploy to production',
      'Update dependencies',
      'Create API documentation',
    ];
    return titles[index % titles.length] || `Task ${index}`;
  }

  private getRandomTaskDescription(index: number): string {
    const descriptions = [
      'Need to update project documentation to reflect recent changes.',
      'Review and merge pending pull requests from team members.',
      'Fix authentication issues reported by users.',
      'Optimize slow database queries for better performance.',
      'Create a modern, responsive landing page design.',
      'Implement user dashboard with analytics.',
      'Write comprehensive unit tests for new features.',
      'Deploy latest changes to production environment.',
      'Update project dependencies to latest versions.',
      'Create detailed API documentation for developers.',
    ];
    return descriptions[index % descriptions.length] || `Description for task ${index}`;
  }
}
