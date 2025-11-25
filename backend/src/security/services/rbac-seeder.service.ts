import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RbacSeederService implements OnModuleInit {
  private readonly logger = new Logger(RbacSeederService.name);

  constructor(
    private rbacService: RbacService,
    private prisma: PrismaService
  ) {}

  async onModuleInit() {
    // await this.seedDefaultRolesAndPermissions();
  }

  async seedDefaultRolesAndPermissions() {
    try {
      this.logger.log('Starting RBAC seeding...');

      // Create default permissions
      await this.createDefaultPermissions();

      // Create default roles
      await this.createDefaultRoles();

      // Create default admin user
      await this.seedDefaultAdminUser();

      // Create default menus
      await this.seedDefaultMenus();

      this.logger.log('RBAC seeding completed successfully');
    } catch (error) {
      this.logger.error(`RBAC seeding failed: ${error.message}`);
    }
  }

  private async createDefaultPermissions() {
    const permissions = [
      // User Management
      { name: 'users:create', displayName: 'Create Users', resource: 'user', action: 'create', category: 'user_management' },
      { name: 'users:read', displayName: 'Read Users', resource: 'user', action: 'read', category: 'user_management' },
      { name: 'users:update', displayName: 'Update Users', resource: 'user', action: 'update', category: 'user_management' },
      { name: 'users:delete', displayName: 'Delete Users', resource: 'user', action: 'delete', category: 'user_management' },
      
      // Role Management
      { name: 'roles:create', displayName: 'Create Roles', resource: 'role', action: 'create', category: 'role_management' },
      { name: 'roles:read', displayName: 'Read Roles', resource: 'role', action: 'read', category: 'role_management' },
      { name: 'roles:update', displayName: 'Update Roles', resource: 'role', action: 'update', category: 'role_management' },
      { name: 'roles:delete', displayName: 'Delete Roles', resource: 'role', action: 'delete', category: 'role_management' },
      
      // Permission Management
      { name: 'permissions:create', displayName: 'Create Permissions', resource: 'permission', action: 'create', category: 'permission_management' },
      { name: 'permissions:read', displayName: 'Read Permissions', resource: 'permission', action: 'read', category: 'permission_management' },
      { name: 'permissions:update', displayName: 'Update Permissions', resource: 'permission', action: 'update', category: 'permission_management' },
      { name: 'permissions:delete', displayName: 'Delete Permissions', resource: 'permission', action: 'delete', category: 'permission_management' },
      
      // Task Management
      { name: 'tasks:create', displayName: 'Create Tasks', resource: 'task', action: 'create', category: 'task_management' },
      { name: 'tasks:read', displayName: 'Read Tasks', resource: 'task', action: 'read', category: 'task_management' },
      { name: 'tasks:update', displayName: 'Update Tasks', resource: 'task', action: 'update', category: 'task_management' },
      { name: 'tasks:delete', displayName: 'Delete Tasks', resource: 'task', action: 'delete', category: 'task_management' },
      { name: 'tasks:assign', displayName: 'Assign Tasks', resource: 'task', action: 'assign', category: 'task_management' },
      
      // Project Management
      { name: 'projects:create', displayName: 'Create Projects', resource: 'project', action: 'create', category: 'project_management' },
      { name: 'projects:read', displayName: 'Read Projects', resource: 'project', action: 'read', category: 'project_management' },
      { name: 'projects:update', displayName: 'Update Projects', resource: 'project', action: 'update', category: 'project_management' },
      { name: 'projects:delete', displayName: 'Delete Projects', resource: 'project', action: 'delete', category: 'project_management' },
      { name: 'projects:manage', displayName: 'Manage Projects', resource: 'project', action: 'manage', category: 'project_management' },
      
      // Security Management
      { name: 'security:audit', displayName: 'View Security Audit', resource: 'security', action: 'audit', category: 'security_management' },
      { name: 'security:monitor', displayName: 'Monitor Security', resource: 'security', action: 'monitor', category: 'security_management' },
      { name: 'security:manage', displayName: 'Manage Security', resource: 'security', action: 'manage', category: 'security_management' },
      
      // System Administration
      { name: 'system:admin', displayName: 'System Administration', resource: 'system', action: 'admin', scope: 'global', category: 'system_admin' },
      { name: 'system:config', displayName: 'System Configuration', resource: 'system', action: 'config', scope: 'global', category: 'system_admin' },
      { name: 'system:backup', displayName: 'System Backup', resource: 'system', action: 'backup', scope: 'global', category: 'system_admin' },
      
      // Content Management
      { name: 'content:create', displayName: 'Create Content', resource: 'content', action: 'create', category: 'content_management' },
      { name: 'content:read', displayName: 'Read Content', resource: 'content', action: 'read', category: 'content_management' },
      { name: 'content:update', displayName: 'Update Content', resource: 'content', action: 'update', category: 'content_management' },
      { name: 'content:delete', displayName: 'Delete Content', resource: 'content', action: 'delete', category: 'content_management' },
      { name: 'content:publish', displayName: 'Publish Content', resource: 'content', action: 'publish', category: 'content_management' },
      
      // Analytics
      { name: 'analytics:read', displayName: 'Read Analytics', resource: 'analytics', action: 'read', category: 'analytics' },
      { name: 'analytics:export', displayName: 'Export Analytics', resource: 'analytics', action: 'export', category: 'analytics' },
      
      // LMS - Course Management
      { name: 'lms:courses:create', displayName: 'Tạo khóa học', resource: 'lms_course', action: 'create', category: 'lms_management' },
      { name: 'lms:courses:read', displayName: 'Xem khóa học', resource: 'lms_course', action: 'read', category: 'lms_management' },
      { name: 'lms:courses:update', displayName: 'Cập nhật khóa học', resource: 'lms_course', action: 'update', category: 'lms_management' },
      { name: 'lms:courses:delete', displayName: 'Xóa khóa học', resource: 'lms_course', action: 'delete', category: 'lms_management' },
      { name: 'lms:courses:publish', displayName: 'Xuất bản khóa học', resource: 'lms_course', action: 'publish', category: 'lms_management' },
      { name: 'lms:courses:manage_own', displayName: 'Quản lý khóa học của mình', resource: 'lms_course', action: 'manage', scope: 'own', category: 'lms_management' },
      { name: 'lms:courses:manage_all', displayName: 'Quản lý tất cả khóa học', resource: 'lms_course', action: 'manage', scope: 'all', category: 'lms_management' },
      
      // LMS - Lesson Management
      { name: 'lms:lessons:create', displayName: 'Tạo bài giảng', resource: 'lms_lesson', action: 'create', category: 'lms_management' },
      { name: 'lms:lessons:read', displayName: 'Xem bài giảng', resource: 'lms_lesson', action: 'read', category: 'lms_management' },
      { name: 'lms:lessons:update', displayName: 'Cập nhật bài giảng', resource: 'lms_lesson', action: 'update', category: 'lms_management' },
      { name: 'lms:lessons:delete', displayName: 'Xóa bài giảng', resource: 'lms_lesson', action: 'delete', category: 'lms_management' },
      
      // LMS - Module Management
      { name: 'lms:modules:create', displayName: 'Tạo chương học', resource: 'lms_module', action: 'create', category: 'lms_management' },
      { name: 'lms:modules:read', displayName: 'Xem chương học', resource: 'lms_module', action: 'read', category: 'lms_management' },
      { name: 'lms:modules:update', displayName: 'Cập nhật chương học', resource: 'lms_module', action: 'update', category: 'lms_management' },
      { name: 'lms:modules:delete', displayName: 'Xóa chương học', resource: 'lms_module', action: 'delete', category: 'lms_management' },
      
      // LMS - Quiz Management
      { name: 'lms:quizzes:create', displayName: 'Tạo bài kiểm tra', resource: 'lms_quiz', action: 'create', category: 'lms_management' },
      { name: 'lms:quizzes:read', displayName: 'Xem bài kiểm tra', resource: 'lms_quiz', action: 'read', category: 'lms_management' },
      { name: 'lms:quizzes:update', displayName: 'Cập nhật bài kiểm tra', resource: 'lms_quiz', action: 'update', category: 'lms_management' },
      { name: 'lms:quizzes:delete', displayName: 'Xóa bài kiểm tra', resource: 'lms_quiz', action: 'delete', category: 'lms_management' },
      { name: 'lms:quizzes:grade', displayName: 'Chấm điểm bài kiểm tra', resource: 'lms_quiz', action: 'grade', category: 'lms_management' },
      
      // LMS - Enrollment Management
      { name: 'lms:enrollments:create', displayName: 'Tạo ghi danh', resource: 'lms_enrollment', action: 'create', category: 'lms_management' },
      { name: 'lms:enrollments:read', displayName: 'Xem ghi danh', resource: 'lms_enrollment', action: 'read', category: 'lms_management' },
      { name: 'lms:enrollments:update', displayName: 'Cập nhật ghi danh', resource: 'lms_enrollment', action: 'update', category: 'lms_management' },
      { name: 'lms:enrollments:delete', displayName: 'Xóa ghi danh', resource: 'lms_enrollment', action: 'delete', category: 'lms_management' },
      { name: 'lms:enrollments:approve', displayName: 'Duyệt ghi danh', resource: 'lms_enrollment', action: 'approve', category: 'lms_management' },
      
      // LMS - Review Management
      { name: 'lms:reviews:create', displayName: 'Tạo đánh giá', resource: 'lms_review', action: 'create', category: 'lms_management' },
      { name: 'lms:reviews:read', displayName: 'Xem đánh giá', resource: 'lms_review', action: 'read', category: 'lms_management' },
      { name: 'lms:reviews:update', displayName: 'Cập nhật đánh giá', resource: 'lms_review', action: 'update', category: 'lms_management' },
      { name: 'lms:reviews:delete', displayName: 'Xóa đánh giá', resource: 'lms_review', action: 'delete', category: 'lms_management' },
      { name: 'lms:reviews:moderate', displayName: 'Kiểm duyệt đánh giá', resource: 'lms_review', action: 'moderate', category: 'lms_management' },
      
      // LMS - Category Management
      { name: 'lms:categories:create', displayName: 'Tạo danh mục khóa học', resource: 'lms_category', action: 'create', category: 'lms_management' },
      { name: 'lms:categories:read', displayName: 'Xem danh mục khóa học', resource: 'lms_category', action: 'read', category: 'lms_management' },
      { name: 'lms:categories:update', displayName: 'Cập nhật danh mục khóa học', resource: 'lms_category', action: 'update', category: 'lms_management' },
      { name: 'lms:categories:delete', displayName: 'Xóa danh mục khóa học', resource: 'lms_category', action: 'delete', category: 'lms_management' },
      
      // LMS - Source Document Management
      { name: 'lms:documents:create', displayName: 'Tạo tài liệu nguồn', resource: 'lms_document', action: 'create', category: 'lms_management' },
      { name: 'lms:documents:read', displayName: 'Xem tài liệu nguồn', resource: 'lms_document', action: 'read', category: 'lms_management' },
      { name: 'lms:documents:update', displayName: 'Cập nhật tài liệu nguồn', resource: 'lms_document', action: 'update', category: 'lms_management' },
      { name: 'lms:documents:delete', displayName: 'Xóa tài liệu nguồn', resource: 'lms_document', action: 'delete', category: 'lms_management' },
      
      // LMS - Certificate Management
      { name: 'lms:certificates:create', displayName: 'Tạo chứng chỉ', resource: 'lms_certificate', action: 'create', category: 'lms_management' },
      { name: 'lms:certificates:read', displayName: 'Xem chứng chỉ', resource: 'lms_certificate', action: 'read', category: 'lms_management' },
      { name: 'lms:certificates:issue', displayName: 'Cấp chứng chỉ', resource: 'lms_certificate', action: 'issue', category: 'lms_management' },
      { name: 'lms:certificates:revoke', displayName: 'Thu hồi chứng chỉ', resource: 'lms_certificate', action: 'revoke', category: 'lms_management' },
      
      // LMS - Discussion Management
      { name: 'lms:discussions:create', displayName: 'Tạo thảo luận', resource: 'lms_discussion', action: 'create', category: 'lms_management' },
      { name: 'lms:discussions:read', displayName: 'Xem thảo luận', resource: 'lms_discussion', action: 'read', category: 'lms_management' },
      { name: 'lms:discussions:update', displayName: 'Cập nhật thảo luận', resource: 'lms_discussion', action: 'update', category: 'lms_management' },
      { name: 'lms:discussions:delete', displayName: 'Xóa thảo luận', resource: 'lms_discussion', action: 'delete', category: 'lms_management' },
      { name: 'lms:discussions:moderate', displayName: 'Kiểm duyệt thảo luận', resource: 'lms_discussion', action: 'moderate', category: 'lms_management' },
      
      // LMS - Student View
      { name: 'lms:student:enroll', displayName: 'Đăng ký học', resource: 'lms_student', action: 'enroll', category: 'lms_student' },
      { name: 'lms:student:learn', displayName: 'Học bài', resource: 'lms_student', action: 'learn', category: 'lms_student' },
      { name: 'lms:student:take_quiz', displayName: 'Làm bài kiểm tra', resource: 'lms_student', action: 'take_quiz', category: 'lms_student' },
      { name: 'lms:student:view_progress', displayName: 'Xem tiến độ học', resource: 'lms_student', action: 'view_progress', category: 'lms_student' },
      { name: 'lms:student:review', displayName: 'Đánh giá khóa học', resource: 'lms_student', action: 'review', category: 'lms_student' },
    ];

    for (const permission of permissions) {
      try {
        await this.rbacService.createPermission({
          ...permission,
          description: `Permission to ${permission.action} ${permission.resource}`,
        });
        this.logger.debug(`Created permission: ${permission.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          this.logger.debug(`Permission already exists: ${permission.name}`);
        } else {
          this.logger.error(`Failed to create permission ${permission.name}: ${error.message}`);
        }
      }
    }
  }

  private async createDefaultRoles() {
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access with all permissions',
        priority: 1000,
        permissions: [
          // System Administration - Full control
          'system:admin', 'system:config', 'system:backup',
          // User Management - Complete CRUD
          'users:create', 'users:read', 'users:update', 'users:delete',
          // Role Management - Complete CRUD
          'roles:create', 'roles:read', 'roles:update', 'roles:delete',
          // Permission Management - Complete CRUD
          'permissions:create', 'permissions:read', 'permissions:update', 'permissions:delete',
          // Security Management - Full access
          'security:audit', 'security:monitor', 'security:manage',
          // Task Management - Complete CRUD + assign
          'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete', 'tasks:assign',
          // Project Management - Complete CRUD + manage
          'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:manage',
          // Content Management - Complete CRUD + publish
          'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
          // Analytics - Full read and export
          'analytics:read', 'analytics:export'
        ]
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access for user and content management',
        priority: 900,
        permissions: [
          'users:create', 'users:read', 'users:update', 'users:delete',
          'roles:read', 'roles:update',
          'permissions:read',
          'security:audit', 'security:monitor',
          'tasks:create', 'tasks:read', 'tasks:update', 'tasks:delete', 'tasks:assign',
          'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:manage',
          'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish',
          'analytics:read', 'analytics:export'
        ]
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Project and team management capabilities',
        priority: 800,
        permissions: [
          'users:read', 'users:update',
          'tasks:create', 'tasks:read', 'tasks:update', 'tasks:assign',
          'projects:create', 'projects:read', 'projects:update', 'projects:manage',
          'content:create', 'content:read', 'content:update', 'content:publish',
          'analytics:read'
        ]
      },
      {
        name: 'team_lead',
        displayName: 'Team Lead',
        description: 'Team leadership with task and content management',
        priority: 700,
        permissions: [
          'users:read',
          'tasks:create', 'tasks:read', 'tasks:update', 'tasks:assign',
          'projects:read', 'projects:update',
          'content:create', 'content:read', 'content:update',
          'analytics:read'
        ]
      },
      {
        name: 'user',
        displayName: 'Regular User',
        description: 'Standard user with basic access',
        priority: 600,
        permissions: [
          'tasks:create', 'tasks:read', 'tasks:update',
          'projects:read',
          'content:create', 'content:read', 'content:update'
        ]
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to content and tasks',
        priority: 500,
        permissions: [
          'tasks:read',
          'projects:read',
          'content:read'
        ]
      },
      {
        name: 'guest',
        displayName: 'Guest',
        description: 'Limited read-only access',
        priority: 100,
        permissions: [
          'content:read'
        ]
      },
      {
        name: 'giangvien',
        displayName: 'Giảng viên',
        description: 'Instructor role with full LMS course management capabilities',
        priority: 750,
        permissions: [
          // LMS - Course Management (Own courses)
          'lms:courses:create',
          'lms:courses:read',
          'lms:courses:update',
          'lms:courses:delete',
          'lms:courses:publish',
          'lms:courses:manage_own',
          
          // LMS - Lesson Management
          'lms:lessons:create',
          'lms:lessons:read',
          'lms:lessons:update',
          'lms:lessons:delete',
          
          // LMS - Module Management
          'lms:modules:create',
          'lms:modules:read',
          'lms:modules:update',
          'lms:modules:delete',
          
          // LMS - Quiz Management
          'lms:quizzes:create',
          'lms:quizzes:read',
          'lms:quizzes:update',
          'lms:quizzes:delete',
          'lms:quizzes:grade',
          
          // LMS - Enrollment Management (Own courses)
          'lms:enrollments:read',
          'lms:enrollments:update',
          'lms:enrollments:approve',
          
          // LMS - Review Management (Own courses)
          'lms:reviews:read',
          'lms:reviews:moderate',
          
          // LMS - Category (Read only)
          'lms:categories:read',
          
          // LMS - Source Document Management
          'lms:documents:create',
          'lms:documents:read',
          'lms:documents:update',
          'lms:documents:delete',
          
          // LMS - Certificate Management (Own courses)
          'lms:certificates:create',
          'lms:certificates:read',
          'lms:certificates:issue',
          
          // LMS - Discussion Management (Own courses)
          'lms:discussions:create',
          'lms:discussions:read',
          'lms:discussions:update',
          'lms:discussions:delete',
          'lms:discussions:moderate',
          
          // Basic content read access
          'content:read',
          
          // Analytics for own courses
          'analytics:read',
        ]
      }
    ];

    for (const roleData of roles) {
      try {
        // Create role first
        const role = await this.rbacService.createRole({
          name: roleData.name,
          displayName: roleData.displayName,
          description: roleData.description,
        }, 'system');

        // Update priority
        await this.rbacService.updateRole(role.id, {
          ...roleData,
          priority: roleData.priority,
        });

        // Get permission IDs
        const allPermissions = await this.rbacService.getAllPermissions();
        const permissionIds = allPermissions
          .filter(p => roleData.permissions.includes(p.name))
          .map(p => p.id);

        // Assign permissions to role
        if (permissionIds.length > 0) {
          await this.rbacService.assignPermissionsToRole(role.id, permissionIds, 'system');
        }

        this.logger.debug(`Created role: ${roleData.name} with ${permissionIds.length} permissions`);
      } catch (error) {
        if (error.code === 'P2002') {
          this.logger.debug(`Role already exists: ${roleData.name}`);
        } else {
          this.logger.error(`Failed to create role ${roleData.name}: ${error.message}`);
        }
      }
    }
  }

  private async seedDefaultAdminUser() {
    try {
      const adminEmail = 'katachanneloffical@gmail.com';
      const adminPhone = '0977272967';
      const adminName = 'Phạm Chí Kiệt';
      const defaultPassword = 'Admin@123456'; // You should change this in production

      // Check if admin user already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: adminEmail },
            { phone: adminPhone }
          ]
        }
      });

      if (existingUser) {
        this.logger.debug(`Admin user already exists: ${existingUser.email}`);
        
        // Ensure user has super_admin role
        const superAdminRole = await this.prisma.role.findUnique({
          where: { name: 'super_admin' },
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        });

        if (superAdminRole) {
          const existingRoleAssignment = await this.prisma.userRoleAssignment.findUnique({
            where: {
              userId_roleId: {
                userId: existingUser.id,
                roleId: superAdminRole.id
              }
            }
          });

          if (!existingRoleAssignment) {
            await this.rbacService.assignRoleToUser({
              userId: existingUser.id,
              roleId: superAdminRole.id
            }, 'system');
            this.logger.debug(`Assigned super_admin role to existing user: ${existingUser.email}`);
          }

          this.logger.debug(`Admin user ${existingUser.email} has ${superAdminRole.permissions.length} permissions via super_admin role`);
        }
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      // Create admin user
      const adminUser = await this.prisma.user.create({
        data: {
          username: 'admin_kataofficial',
          email: adminEmail,
          phone: adminPhone,
          firstName: 'Phạm Chí',
          lastName: 'Kiệt',
          password: hashedPassword,
          isVerified: true,
          roleType: 'ADMIN',
          isActive: true
        }
      });

      this.logger.log(`Created admin user: ${adminUser.email}`);

      // Get super_admin role with all permissions
      const superAdminRole = await this.prisma.role.findUnique({
        where: { name: 'super_admin' },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      if (superAdminRole) {
        // Assign super_admin role to user
        await this.rbacService.assignRoleToUser({
          userId: adminUser.id,
          roleId: superAdminRole.id
        }, 'system');
        this.logger.log(`Assigned super_admin role to user: ${adminUser.email}`);

        this.logger.log(`✅ Default admin user created successfully:`);
        this.logger.log(`   Email: ${adminEmail}`);
        this.logger.log(`   Phone: ${adminPhone}`);
        this.logger.log(`   Name: ${adminName}`);
        this.logger.log(`   Default Password: ${defaultPassword}`);
        this.logger.log(`   Role: super_admin`);
        this.logger.log(`   Permissions: All (${superAdminRole.permissions.length} permissions assigned via role)`);
        this.logger.log(`   🔒 Please change the default password after first login!`);
      } else {
        this.logger.error('Super admin role not found!');
      }
      
    } catch (error) {
      this.logger.error(`Failed to create default admin user: ${error.message}`);
      throw error;
    }
  }

  private async seedDefaultMenus() {
    try {
      this.logger.log('Seeding default menus...');
      
      // First, update ALL existing menus to only allow super_admin
      this.logger.log('Updating existing menus to super_admin only...');
      await this.prisma.menu.updateMany({
        where: {
          type: 'SIDEBAR', // Only update sidebar menus (admin menus)
        },
        data: {
          requiredRoles: ['super_admin'],
          isPublic: false,
        },
      });
      this.logger.log('✅ All existing sidebar menus updated to super_admin only');

      const menus = [
        // ==================== SIDEBAR MENUS ====================
        // All menus restricted to super_admin only (katachanneloffical@gmail.com)
        {
          title: 'Dashboard',
          slug: 'dashboard',
          description: 'Main dashboard',
          type: 'SIDEBAR',
          route: '/admin',
          icon: 'LayoutDashboard',
          order: 1,
          isPublic: false,
          requiredRoles: ['super_admin'],
          isProtected: true,
        },
        {
          title: 'Users',
          slug: 'users',
          description: 'User management',
          type: 'SIDEBAR',
          route: '/admin/users',
          icon: 'Users',
          order: 2,
          requiredPermissions: ['users:read'],
          requiredRoles: ['super_admin'],
          isProtected: true,
        },
        {
          title: 'Roles & Permissions',
          slug: 'roles-permissions',
          description: 'Role and permission management',
          type: 'SIDEBAR',
          route: '/admin/roles',
          icon: 'Shield',
          order: 3,
          requiredPermissions: ['roles:read', 'permissions:read'],
          requiredRoles: ['super_admin'],
          isProtected: true,
        },
        {
          title: 'Content',
          slug: 'content',
          description: 'Content management',
          type: 'SIDEBAR',
          icon: 'FileText',
          order: 4,
          requiredPermissions: ['content:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Posts',
          slug: 'posts',
          description: 'Manage posts',
          type: 'SIDEBAR',
          parentSlug: 'content',
          route: '/admin/posts',
          icon: 'FileEdit',
          order: 1,
          requiredPermissions: ['content:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Categories',
          slug: 'categories',
          description: 'Manage categories',
          type: 'SIDEBAR',
          parentSlug: 'content',
          route: '/admin/categories',
          icon: 'FolderTree',
          order: 2,
          requiredPermissions: ['content:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Tags',
          slug: 'tags',
          description: 'Manage tags',
          type: 'SIDEBAR',
          parentSlug: 'content',
          route: '/admin/tags',
          icon: 'Tag',
          order: 3,
          requiredPermissions: ['content:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Projects',
          slug: 'projects',
          description: 'Project management',
          type: 'SIDEBAR',
          route: '/admin/projects',
          icon: 'Briefcase',
          order: 5,
          requiredPermissions: ['projects:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Tasks',
          slug: 'tasks',
          description: 'Task management',
          type: 'SIDEBAR',
          route: '/admin/tasks',
          icon: 'CheckSquare',
          order: 6,
          requiredPermissions: ['tasks:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Menus',
          slug: 'menus',
          description: 'Menu management',
          type: 'SIDEBAR',
          route: '/admin/menu',
          icon: 'Menu',
          order: 7,
          requiredPermissions: ['content:manage'],
          requiredRoles: ['super_admin'],
          isProtected: true,
        },
        {
          title: 'Analytics',
          slug: 'analytics',
          description: 'Analytics and reports',
          type: 'SIDEBAR',
          route: '/admin/analytics',
          icon: 'BarChart',
          order: 8,
          requiredPermissions: ['analytics:read'],
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Settings',
          slug: 'settings',
          description: 'System settings',
          type: 'SIDEBAR',
          icon: 'Settings',
          order: 9,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'General',
          slug: 'settings-general',
          description: 'General settings',
          type: 'SIDEBAR',
          parentSlug: 'settings',
          route: '/admin/settings/general',
          icon: 'Sliders',
          order: 1,
          requiredRoles: ['super_admin'],
        },
        {
          title: 'Security',
          slug: 'settings-security',
          description: 'Security settings',
          type: 'SIDEBAR',
          parentSlug: 'settings',
          route: '/admin/settings/security',
          icon: 'Lock',
          order: 2,
          requiredRoles: ['super_admin'],
          isProtected: true,
        },
        {
          title: 'Audit Logs',
          slug: 'audit-logs',
          description: 'System audit logs',
          type: 'SIDEBAR',
          route: '/admin/audit-logs',
          icon: 'FileSearch',
          order: 10,
          requiredPermissions: ['security:audit'],
          requiredRoles: ['super_admin'],
        },

        // ==================== HEADER MENUS ====================
        {
          title: 'Home',
          slug: 'home',
          description: 'Homepage',
          type: 'HEADER',
          route: '/',
          order: 1,
          isPublic: true,
        },
        {
          title: 'About',
          slug: 'about',
          description: 'About us',
          type: 'HEADER',
          route: '/about',
          order: 2,
          isPublic: true,
        },
        {
          title: 'Services',
          slug: 'services',
          description: 'Our services',
          type: 'HEADER',
          route: '/services',
          order: 3,
          isPublic: true,
        },
        {
          title: 'Contact',
          slug: 'contact',
          description: 'Contact us',
          type: 'HEADER',
          route: '/contact',
          order: 4,
          isPublic: true,
        },
      ];

      for (const menuData of menus) {
        try {
          // Check if menu already exists
          const existingMenu = await this.prisma.menu.findUnique({
            where: { slug: menuData.slug },
          });

          if (existingMenu) {
            // Update existing menu to ensure correct permissions
            if (menuData.type === 'SIDEBAR') {
              await this.prisma.menu.update({
                where: { slug: menuData.slug },
                data: {
                  requiredRoles: (menuData as any).requiredRoles || ['super_admin'],
                  requiredPermissions: (menuData as any).requiredPermissions || [],
                  isPublic: (menuData as any).isPublic || false,
                  isProtected: (menuData as any).isProtected || false,
                },
              });
              this.logger.debug(`Updated menu permissions: ${menuData.slug}`);
            }
            continue;
          }

          // Get parent if specified
          let parentId: string | undefined;
          let level = 0;
          let path = `/${menuData.slug}`;

          if ('parentSlug' in menuData && menuData.parentSlug) {
            const parent = await this.prisma.menu.findUnique({
              where: { slug: menuData.parentSlug },
            });

            if (parent) {
              parentId = parent.id;
              level = parent.level + 1;
              path = `${parent.path}/${menuData.slug}`;
            }
          }

          // Create menu
          await this.prisma.menu.create({
            data: {
              title: menuData.title,
              slug: menuData.slug,
              description: menuData.description,
              type: menuData.type as any,
              parentId,
              route: menuData.route,
              icon: menuData.icon,
              iconType: 'lucide',
              order: menuData.order,
              level,
              path,
              requiredPermissions: (menuData as any).requiredPermissions || [],
              requiredRoles: (menuData as any).requiredRoles || [],
              isPublic: (menuData as any).isPublic || false,
              isProtected: (menuData as any).isProtected || false,
              isActive: true,
              isVisible: true,
            },
          });

          this.logger.debug(`Created menu: ${menuData.title}`);
        } catch (error) {
          this.logger.error(`Failed to create menu ${menuData.slug}: ${error.message}`);
        }
      }

      this.logger.log('✅ Default menus created successfully');
    } catch (error) {
      this.logger.error(`Failed to seed default menus: ${error.message}`);
      throw error;
    }
  }
}
