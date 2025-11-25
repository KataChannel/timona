"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ComprehensiveSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprehensiveSeederService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const client_1 = require("@prisma/client");
let ComprehensiveSeederService = ComprehensiveSeederService_1 = class ComprehensiveSeederService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ComprehensiveSeederService_1.name);
    }
    async seedAll() {
        try {
            this.logger.log('🌱 Starting comprehensive database seeding...');
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
        }
        catch (error) {
            this.logger.error(`❌ Seeding failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async seedAdminUser() {
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
                roleType: client_1.UserRoleType.ADMIN,
                isActive: true,
                isVerified: true,
            },
        });
        this.logger.log(`✅ Admin user created: ${email}`);
    }
    async seedRBAC() {
        this.logger.log('🔐 Seeding RBAC data...');
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
    async seedContent() {
        this.logger.log('📝 Seeding content data...');
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
                    status: i <= 7 ? client_1.PostStatus.PUBLISHED : client_1.PostStatus.DRAFT,
                    publishedAt: i <= 7 ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null,
                    authorId: this.adminUser.id,
                },
            });
            posts.push(post);
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
    async seedTasks() {
        this.logger.log('✅ Seeding tasks...');
        const categories = [client_1.TaskCategory.WORK, client_1.TaskCategory.PERSONAL, client_1.TaskCategory.SHOPPING, client_1.TaskCategory.OTHER];
        const priorities = [client_1.TaskPriority.LOW, client_1.TaskPriority.MEDIUM, client_1.TaskPriority.HIGH, client_1.TaskPriority.URGENT];
        const statuses = [client_1.TaskStatus.PENDING, client_1.TaskStatus.IN_PROGRESS, client_1.TaskStatus.COMPLETED, client_1.TaskStatus.CANCELLED];
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
                    completedAt: status === client_1.TaskStatus.COMPLETED ? new Date() : null,
                },
            });
            tasks.push(task);
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
    async seedMenus() {
        this.logger.log('📋 Seeding menu structure...');
        await this.prisma.menu.upsert({
            where: { slug: 'dashboard' },
            update: {},
            create: {
                title: 'Dashboard',
                slug: 'dashboard',
                type: client_1.MenuType.SIDEBAR,
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
                type: client_1.MenuType.SIDEBAR,
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
                type: client_1.MenuType.SIDEBAR,
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
                type: client_1.MenuType.SIDEBAR,
                route: '/admin/tasks',
                icon: 'CheckSquare',
                order: 3,
                isActive: true,
                isVisible: true,
                createdBy: this.adminUser.id,
            },
        });
        await this.prisma.menu.upsert({
            where: { slug: 'home' },
            update: {},
            create: {
                title: 'Home',
                slug: 'home',
                type: client_1.MenuType.HEADER,
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
                type: client_1.MenuType.HEADER,
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
    async seedPages() {
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
                type: client_1.BlockType.HERO,
                content: { heading: 'Welcome to rausachcore', subheading: 'Built with Next.js, NestJS, and Prisma' },
                order: 1,
            },
        });
        await this.prisma.pageBlock.create({
            data: {
                pageId: homePage.id,
                type: client_1.BlockType.TEXT,
                content: { title: 'Features', items: ['GraphQL API', 'Authentication', 'RBAC', 'Real-time', 'Cloud Storage'] },
                order: 2,
            },
        });
        this.logger.log('✅ Created pages and blocks');
    }
    async seedAIData() {
        this.logger.log('🤖 Seeding AI/Chatbot data...');
        const chatbot = await this.prisma.chatbotModel.create({
            data: {
                name: 'KataBot',
                description: 'Official rausachcore chatbot assistant',
                status: client_1.ChatbotStatus.ACTIVE,
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
                type: client_1.TrainingDataType.TEXT,
                status: client_1.TrainingStatus.COMPLETED,
            },
        });
        this.logger.log('✅ Created chatbot model and training data');
    }
    async seedAffiliateSystem() {
        this.logger.log('💰 Seeding affiliate system...');
        const affUser = await this.prisma.affUser.create({
            data: {
                userId: this.adminUser.id,
                role: client_1.AffUserRole.AFFILIATE,
            },
        });
        const campaign = await this.prisma.affCampaign.create({
            data: {
                name: 'Demo Campaign 2024',
                description: 'Demo affiliate campaign for testing',
                productName: 'rausachcore Pro',
                productUrl: 'https://rausachcore.dev/pro',
                commissionRate: 10.0,
                commissionType: 'percentage',
                status: client_1.AffCampaignStatus.ACTIVE,
                startDate: new Date(),
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                creatorId: affUser.id,
            },
        });
        await this.prisma.affCampaignAffiliate.create({
            data: {
                campaignId: campaign.id,
                affiliateId: affUser.id,
                status: 'approved',
                approvedAt: new Date(),
            },
        });
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
    async seedSecuritySettings() {
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
    async seedNotifications() {
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
    getRandomPostTitle(index) {
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
    getRandomPostContent(index) {
        return `
# Introduction

This is demo post ${index} created by the comprehensive seeder.

## Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Conclusion

This post demonstrates the seeding functionality of rausachcore.
    `.trim();
    }
    getRandomTaskTitle(index) {
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
    getRandomTaskDescription(index) {
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
};
exports.ComprehensiveSeederService = ComprehensiveSeederService;
exports.ComprehensiveSeederService = ComprehensiveSeederService = ComprehensiveSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComprehensiveSeederService);
//# sourceMappingURL=comprehensive-seeder.service.js.map