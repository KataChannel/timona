import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to cleanup all users except katachanneloffical@gmail.com
 * and seed comprehensive RBAC permissions for the entire system
 */

const KEEP_USER_EMAIL = 'katachanneloffical@gmail.com';

// ============================================================================
// COMPREHENSIVE PERMISSIONS STRUCTURE
// ============================================================================

interface PermissionConfig {
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  category: string;
}

const COMPREHENSIVE_PERMISSIONS: PermissionConfig[] = [
  // ========== AUTHENTICATION & USERS ==========
  {
    name: 'auth:login:own',
    displayName: 'Login',
    description: 'Can login to the system',
    resource: 'auth',
    action: 'login',
    scope: 'own',
    category: 'authentication',
  },
  {
    name: 'auth:logout:own',
    displayName: 'Logout',
    description: 'Can logout from the system',
    resource: 'auth',
    action: 'logout',
    scope: 'own',
    category: 'authentication',
  },
  {
    name: 'auth:register:all',
    displayName: 'Register Users',
    description: 'Can register new users',
    resource: 'auth',
    action: 'register',
    scope: 'all',
    category: 'authentication',
  },
  {
    name: 'user:read:own',
    displayName: 'View Own Profile',
    description: 'Can view own user profile',
    resource: 'user',
    action: 'read',
    scope: 'own',
    category: 'user_management',
  },
  {
    name: 'user:read:all',
    displayName: 'View All Users',
    description: 'Can view all users in the system',
    resource: 'user',
    action: 'read',
    scope: 'all',
    category: 'user_management',
  },
  {
    name: 'user:update:own',
    displayName: 'Update Own Profile',
    description: 'Can update own user profile',
    resource: 'user',
    action: 'update',
    scope: 'own',
    category: 'user_management',
  },
  {
    name: 'user:update:all',
    displayName: 'Update Any User',
    description: 'Can update any user profile',
    resource: 'user',
    action: 'update',
    scope: 'all',
    category: 'user_management',
  },
  {
    name: 'user:delete:all',
    displayName: 'Delete Users',
    description: 'Can delete users from the system',
    resource: 'user',
    action: 'delete',
    scope: 'all',
    category: 'user_management',
  },

  // ========== RBAC ==========
  {
    name: 'role:create:all',
    displayName: 'Create Roles',
    description: 'Can create new roles',
    resource: 'role',
    action: 'create',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'role:read:all',
    displayName: 'View Roles',
    description: 'Can view all roles',
    resource: 'role',
    action: 'read',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'role:update:all',
    displayName: 'Update Roles',
    description: 'Can update roles',
    resource: 'role',
    action: 'update',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'role:delete:all',
    displayName: 'Delete Roles',
    description: 'Can delete roles',
    resource: 'role',
    action: 'delete',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'role:assign:all',
    displayName: 'Assign Roles',
    description: 'Can assign roles to users',
    resource: 'role',
    action: 'assign',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'permission:create:all',
    displayName: 'Create Permissions',
    description: 'Can create new permissions',
    resource: 'permission',
    action: 'create',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'permission:read:all',
    displayName: 'View Permissions',
    description: 'Can view all permissions',
    resource: 'permission',
    action: 'read',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'permission:update:all',
    displayName: 'Update Permissions',
    description: 'Can update permissions',
    resource: 'permission',
    action: 'update',
    scope: 'all',
    category: 'rbac',
  },
  {
    name: 'permission:delete:all',
    displayName: 'Delete Permissions',
    description: 'Can delete permissions',
    resource: 'permission',
    action: 'delete',
    scope: 'all',
    category: 'rbac',
  },

  // ========== BLOG & POSTS ==========
  {
    name: 'blog:create:own',
    displayName: 'Create Own Blog Posts',
    description: 'Can create own blog posts',
    resource: 'blog',
    action: 'create',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'blog:read:all',
    displayName: 'View All Blog Posts',
    description: 'Can view all blog posts',
    resource: 'blog',
    action: 'read',
    scope: 'all',
    category: 'content',
  },
  {
    name: 'blog:update:own',
    displayName: 'Update Own Blog Posts',
    description: 'Can update own blog posts',
    resource: 'blog',
    action: 'update',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'blog:update:all',
    displayName: 'Update All Blog Posts',
    description: 'Can update any blog post',
    resource: 'blog',
    action: 'update',
    scope: 'all',
    category: 'content',
  },
  {
    name: 'blog:delete:own',
    displayName: 'Delete Own Blog Posts',
    description: 'Can delete own blog posts',
    resource: 'blog',
    action: 'delete',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'blog:delete:all',
    displayName: 'Delete Any Blog Post',
    description: 'Can delete any blog post',
    resource: 'blog',
    action: 'delete',
    scope: 'all',
    category: 'content',
  },
  {
    name: 'blog:publish:own',
    displayName: 'Publish Own Blog Posts',
    description: 'Can publish own blog posts',
    resource: 'blog',
    action: 'publish',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'blog:publish:all',
    displayName: 'Publish Any Blog Post',
    description: 'Can publish any blog post',
    resource: 'blog',
    action: 'publish',
    scope: 'all',
    category: 'content',
  },

  // ========== COMMENTS ==========
  {
    name: 'comment:create:own',
    displayName: 'Create Comments',
    description: 'Can create comments',
    resource: 'comment',
    action: 'create',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'comment:read:all',
    displayName: 'View Comments',
    description: 'Can view all comments',
    resource: 'comment',
    action: 'read',
    scope: 'all',
    category: 'content',
  },
  {
    name: 'comment:update:own',
    displayName: 'Update Own Comments',
    description: 'Can update own comments',
    resource: 'comment',
    action: 'update',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'comment:delete:own',
    displayName: 'Delete Own Comments',
    description: 'Can delete own comments',
    resource: 'comment',
    action: 'delete',
    scope: 'own',
    category: 'content',
  },
  {
    name: 'comment:delete:all',
    displayName: 'Delete Any Comment',
    description: 'Can delete any comment',
    resource: 'comment',
    action: 'delete',
    scope: 'all',
    category: 'content',
  },

  // ========== TASKS ==========
  {
    name: 'task:create:own',
    displayName: 'Create Tasks',
    description: 'Can create tasks',
    resource: 'task',
    action: 'create',
    scope: 'own',
    category: 'task_management',
  },
  {
    name: 'task:read:own',
    displayName: 'View Own Tasks',
    description: 'Can view own tasks',
    resource: 'task',
    action: 'read',
    scope: 'own',
    category: 'task_management',
  },
  {
    name: 'task:read:team',
    displayName: 'View Team Tasks',
    description: 'Can view team tasks',
    resource: 'task',
    action: 'read',
    scope: 'team',
    category: 'task_management',
  },
  {
    name: 'task:read:all',
    displayName: 'View All Tasks',
    description: 'Can view all tasks',
    resource: 'task',
    action: 'read',
    scope: 'all',
    category: 'task_management',
  },
  {
    name: 'task:update:own',
    displayName: 'Update Own Tasks',
    description: 'Can update own tasks',
    resource: 'task',
    action: 'update',
    scope: 'own',
    category: 'task_management',
  },
  {
    name: 'task:update:team',
    displayName: 'Update Team Tasks',
    description: 'Can update team tasks',
    resource: 'task',
    action: 'update',
    scope: 'team',
    category: 'task_management',
  },
  {
    name: 'task:delete:own',
    displayName: 'Delete Own Tasks',
    description: 'Can delete own tasks',
    resource: 'task',
    action: 'delete',
    scope: 'own',
    category: 'task_management',
  },
  {
    name: 'task:delete:all',
    displayName: 'Delete Any Task',
    description: 'Can delete any task',
    resource: 'task',
    action: 'delete',
    scope: 'all',
    category: 'task_management',
  },

  // ========== PROJECTS ==========
  {
    name: 'project:create:own',
    displayName: 'Create Projects',
    description: 'Can create projects',
    resource: 'project',
    action: 'create',
    scope: 'own',
    category: 'project_management',
  },
  {
    name: 'project:read:own',
    displayName: 'View Own Projects',
    description: 'Can view own projects',
    resource: 'project',
    action: 'read',
    scope: 'own',
    category: 'project_management',
  },
  {
    name: 'project:read:team',
    displayName: 'View Team Projects',
    description: 'Can view team projects',
    resource: 'project',
    action: 'read',
    scope: 'team',
    category: 'project_management',
  },
  {
    name: 'project:read:all',
    displayName: 'View All Projects',
    description: 'Can view all projects',
    resource: 'project',
    action: 'read',
    scope: 'all',
    category: 'project_management',
  },
  {
    name: 'project:update:own',
    displayName: 'Update Own Projects',
    description: 'Can update own projects',
    resource: 'project',
    action: 'update',
    scope: 'own',
    category: 'project_management',
  },
  {
    name: 'project:delete:own',
    displayName: 'Delete Own Projects',
    description: 'Can delete own projects',
    resource: 'project',
    action: 'delete',
    scope: 'own',
    category: 'project_management',
  },

  // ========== FILES ==========
  {
    name: 'file:create:own',
    displayName: 'Upload Files',
    description: 'Can upload files',
    resource: 'file',
    action: 'create',
    scope: 'own',
    category: 'file_management',
  },
  {
    name: 'file:read:own',
    displayName: 'View Own Files',
    description: 'Can view own files',
    resource: 'file',
    action: 'read',
    scope: 'own',
    category: 'file_management',
  },
  {
    name: 'file:read:all',
    displayName: 'View All Files',
    description: 'Can view all files',
    resource: 'file',
    action: 'read',
    scope: 'all',
    category: 'file_management',
  },
  {
    name: 'file:update:own',
    displayName: 'Update Own Files',
    description: 'Can update own files',
    resource: 'file',
    action: 'update',
    scope: 'own',
    category: 'file_management',
  },
  {
    name: 'file:delete:own',
    displayName: 'Delete Own Files',
    description: 'Can delete own files',
    resource: 'file',
    action: 'delete',
    scope: 'own',
    category: 'file_management',
  },
  {
    name: 'file:delete:all',
    displayName: 'Delete Any File',
    description: 'Can delete any file',
    resource: 'file',
    action: 'delete',
    scope: 'all',
    category: 'file_management',
  },

  // ========== PAGE BUILDER ==========
  {
    name: 'page:create:own',
    displayName: 'Create Pages',
    description: 'Can create pages',
    resource: 'page',
    action: 'create',
    scope: 'own',
    category: 'page_builder',
  },
  {
    name: 'page:read:all',
    displayName: 'View All Pages',
    description: 'Can view all pages',
    resource: 'page',
    action: 'read',
    scope: 'all',
    category: 'page_builder',
  },
  {
    name: 'page:update:own',
    displayName: 'Update Own Pages',
    description: 'Can update own pages',
    resource: 'page',
    action: 'update',
    scope: 'own',
    category: 'page_builder',
  },
  {
    name: 'page:update:all',
    displayName: 'Update Any Page',
    description: 'Can update any page',
    resource: 'page',
    action: 'update',
    scope: 'all',
    category: 'page_builder',
  },
  {
    name: 'page:delete:own',
    displayName: 'Delete Own Pages',
    description: 'Can delete own pages',
    resource: 'page',
    action: 'delete',
    scope: 'own',
    category: 'page_builder',
  },
  {
    name: 'page:delete:all',
    displayName: 'Delete Any Page',
    description: 'Can delete any page',
    resource: 'page',
    action: 'delete',
    scope: 'all',
    category: 'page_builder',
  },
  {
    name: 'page:publish:all',
    displayName: 'Publish Pages',
    description: 'Can publish pages',
    resource: 'page',
    action: 'publish',
    scope: 'all',
    category: 'page_builder',
  },

  // ========== TEMPLATES ==========
  {
    name: 'template:create:own',
    displayName: 'Create Templates',
    description: 'Can create custom templates',
    resource: 'template',
    action: 'create',
    scope: 'own',
    category: 'page_builder',
  },
  {
    name: 'template:read:all',
    displayName: 'View Templates',
    description: 'Can view all templates',
    resource: 'template',
    action: 'read',
    scope: 'all',
    category: 'page_builder',
  },
  {
    name: 'template:update:own',
    displayName: 'Update Own Templates',
    description: 'Can update own templates',
    resource: 'template',
    action: 'update',
    scope: 'own',
    category: 'page_builder',
  },
  {
    name: 'template:delete:own',
    displayName: 'Delete Own Templates',
    description: 'Can delete own templates',
    resource: 'template',
    action: 'delete',
    scope: 'own',
    category: 'page_builder',
  },

  // ========== PRODUCTS ==========
  {
    name: 'product:create:own',
    displayName: 'Create Products',
    description: 'Can create products',
    resource: 'product',
    action: 'create',
    scope: 'own',
    category: 'ecommerce',
  },
  {
    name: 'product:read:all',
    displayName: 'View Products',
    description: 'Can view all products',
    resource: 'product',
    action: 'read',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'product:update:own',
    displayName: 'Update Own Products',
    description: 'Can update own products',
    resource: 'product',
    action: 'update',
    scope: 'own',
    category: 'ecommerce',
  },
  {
    name: 'product:update:all',
    displayName: 'Update Any Product',
    description: 'Can update any product',
    resource: 'product',
    action: 'update',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'product:delete:all',
    displayName: 'Delete Products',
    description: 'Can delete products',
    resource: 'product',
    action: 'delete',
    scope: 'all',
    category: 'ecommerce',
  },

  // ========== ORDERS ==========
  {
    name: 'order:create:own',
    displayName: 'Create Orders',
    description: 'Can create orders',
    resource: 'order',
    action: 'create',
    scope: 'own',
    category: 'ecommerce',
  },
  {
    name: 'order:read:own',
    displayName: 'View Own Orders',
    description: 'Can view own orders',
    resource: 'order',
    action: 'read',
    scope: 'own',
    category: 'ecommerce',
  },
  {
    name: 'order:read:all',
    displayName: 'View All Orders',
    description: 'Can view all orders',
    resource: 'order',
    action: 'read',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'order:update:own',
    displayName: 'Update Own Orders',
    description: 'Can update own orders',
    resource: 'order',
    action: 'update',
    scope: 'own',
    category: 'ecommerce',
  },
  {
    name: 'order:update:all',
    displayName: 'Update Any Order',
    description: 'Can update any order',
    resource: 'order',
    action: 'update',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'order:cancel:own',
    displayName: 'Cancel Own Orders',
    description: 'Can cancel own orders',
    resource: 'order',
    action: 'cancel',
    scope: 'own',
    category: 'ecommerce',
  },

  // ========== CATEGORIES ==========
  {
    name: 'category:create:all',
    displayName: 'Create Categories',
    description: 'Can create product categories',
    resource: 'category',
    action: 'create',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'category:read:all',
    displayName: 'View Categories',
    description: 'Can view all categories',
    resource: 'category',
    action: 'read',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'category:update:all',
    displayName: 'Update Categories',
    description: 'Can update categories',
    resource: 'category',
    action: 'update',
    scope: 'all',
    category: 'ecommerce',
  },
  {
    name: 'category:delete:all',
    displayName: 'Delete Categories',
    description: 'Can delete categories',
    resource: 'category',
    action: 'delete',
    scope: 'all',
    category: 'ecommerce',
  },

  // ========== LMS - COURSES ==========
  {
    name: 'course:create:own',
    displayName: 'Create Courses',
    description: 'Can create courses',
    resource: 'course',
    action: 'create',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'course:read:all',
    displayName: 'View All Courses',
    description: 'Can view all courses',
    resource: 'course',
    action: 'read',
    scope: 'all',
    category: 'lms',
  },
  {
    name: 'course:update:own',
    displayName: 'Update Own Courses',
    description: 'Can update own courses',
    resource: 'course',
    action: 'update',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'course:update:all',
    displayName: 'Update Any Course',
    description: 'Can update any course',
    resource: 'course',
    action: 'update',
    scope: 'all',
    category: 'lms',
  },
  {
    name: 'course:delete:own',
    displayName: 'Delete Own Courses',
    description: 'Can delete own courses',
    resource: 'course',
    action: 'delete',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'course:publish:own',
    displayName: 'Publish Own Courses',
    description: 'Can publish own courses',
    resource: 'course',
    action: 'publish',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'course:enroll:own',
    displayName: 'Enroll in Courses',
    description: 'Can enroll in courses',
    resource: 'course',
    action: 'enroll',
    scope: 'own',
    category: 'lms',
  },

  // ========== LMS - ENROLLMENTS ==========
  {
    name: 'enrollment:read:own',
    displayName: 'View Own Enrollments',
    description: 'Can view own course enrollments',
    resource: 'enrollment',
    action: 'read',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'enrollment:read:all',
    displayName: 'View All Enrollments',
    description: 'Can view all enrollments',
    resource: 'enrollment',
    action: 'read',
    scope: 'all',
    category: 'lms',
  },
  {
    name: 'enrollment:approve:all',
    displayName: 'Approve Enrollments',
    description: 'Can approve course enrollments',
    resource: 'enrollment',
    action: 'approve',
    scope: 'all',
    category: 'lms',
  },

  // ========== LMS - QUIZZES ==========
  {
    name: 'quiz:create:own',
    displayName: 'Create Quizzes',
    description: 'Can create quizzes',
    resource: 'quiz',
    action: 'create',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'quiz:read:all',
    displayName: 'View Quizzes',
    description: 'Can view all quizzes',
    resource: 'quiz',
    action: 'read',
    scope: 'all',
    category: 'lms',
  },
  {
    name: 'quiz:take:own',
    displayName: 'Take Quizzes',
    description: 'Can take quizzes',
    resource: 'quiz',
    action: 'take',
    scope: 'own',
    category: 'lms',
  },
  {
    name: 'quiz:grade:all',
    displayName: 'Grade Quizzes',
    description: 'Can grade quiz attempts',
    resource: 'quiz',
    action: 'grade',
    scope: 'all',
    category: 'lms',
  },

  // ========== MENU ==========
  {
    name: 'menu:create:all',
    displayName: 'Create Menus',
    description: 'Can create menu items',
    resource: 'menu',
    action: 'create',
    scope: 'all',
    category: 'navigation',
  },
  {
    name: 'menu:read:all',
    displayName: 'View Menus',
    description: 'Can view all menus',
    resource: 'menu',
    action: 'read',
    scope: 'all',
    category: 'navigation',
  },
  {
    name: 'menu:update:all',
    displayName: 'Update Menus',
    description: 'Can update menus',
    resource: 'menu',
    action: 'update',
    scope: 'all',
    category: 'navigation',
  },
  {
    name: 'menu:delete:all',
    displayName: 'Delete Menus',
    description: 'Can delete menus',
    resource: 'menu',
    action: 'delete',
    scope: 'all',
    category: 'navigation',
  },

  // ========== AFFILIATE ==========
  {
    name: 'affiliate:create:own',
    displayName: 'Create Affiliate Links',
    description: 'Can create affiliate links',
    resource: 'affiliate',
    action: 'create',
    scope: 'own',
    category: 'affiliate',
  },
  {
    name: 'affiliate:read:own',
    displayName: 'View Own Affiliate Stats',
    description: 'Can view own affiliate statistics',
    resource: 'affiliate',
    action: 'read',
    scope: 'own',
    category: 'affiliate',
  },
  {
    name: 'affiliate:read:all',
    displayName: 'View All Affiliate Data',
    description: 'Can view all affiliate data',
    resource: 'affiliate',
    action: 'read',
    scope: 'all',
    category: 'affiliate',
  },
  {
    name: 'affiliate:approve:all',
    displayName: 'Approve Affiliates',
    description: 'Can approve affiliate applications',
    resource: 'affiliate',
    action: 'approve',
    scope: 'all',
    category: 'affiliate',
  },
  {
    name: 'affiliate:payout:all',
    displayName: 'Process Payouts',
    description: 'Can process affiliate payouts',
    resource: 'affiliate',
    action: 'payout',
    scope: 'all',
    category: 'affiliate',
  },

  // ========== HR ==========
  {
    name: 'hr:employee:create:all',
    displayName: 'Create Employees',
    description: 'Can create employee profiles',
    resource: 'employee',
    action: 'create',
    scope: 'all',
    category: 'hr',
  },
  {
    name: 'hr:employee:read:all',
    displayName: 'View Employees',
    description: 'Can view all employee data',
    resource: 'employee',
    action: 'read',
    scope: 'all',
    category: 'hr',
  },
  {
    name: 'hr:employee:update:all',
    displayName: 'Update Employees',
    description: 'Can update employee profiles',
    resource: 'employee',
    action: 'update',
    scope: 'all',
    category: 'hr',
  },
  {
    name: 'hr:onboarding:manage:all',
    displayName: 'Manage Onboarding',
    description: 'Can manage employee onboarding',
    resource: 'onboarding',
    action: 'manage',
    scope: 'all',
    category: 'hr',
  },
  {
    name: 'hr:offboarding:manage:all',
    displayName: 'Manage Offboarding',
    description: 'Can manage employee offboarding',
    resource: 'offboarding',
    action: 'manage',
    scope: 'all',
    category: 'hr',
  },

  // ========== SUPPORT ==========
  {
    name: 'support:ticket:create:own',
    displayName: 'Create Support Tickets',
    description: 'Can create support tickets',
    resource: 'support_ticket',
    action: 'create',
    scope: 'own',
    category: 'support',
  },
  {
    name: 'support:ticket:read:own',
    displayName: 'View Own Tickets',
    description: 'Can view own support tickets',
    resource: 'support_ticket',
    action: 'read',
    scope: 'own',
    category: 'support',
  },
  {
    name: 'support:ticket:read:all',
    displayName: 'View All Tickets',
    description: 'Can view all support tickets',
    resource: 'support_ticket',
    action: 'read',
    scope: 'all',
    category: 'support',
  },
  {
    name: 'support:ticket:assign:all',
    displayName: 'Assign Tickets',
    description: 'Can assign tickets to agents',
    resource: 'support_ticket',
    action: 'assign',
    scope: 'all',
    category: 'support',
  },
  {
    name: 'support:ticket:resolve:all',
    displayName: 'Resolve Tickets',
    description: 'Can resolve support tickets',
    resource: 'support_ticket',
    action: 'resolve',
    scope: 'all',
    category: 'support',
  },

  // ========== AI & CHATBOT ==========
  {
    name: 'ai:chatbot:create:own',
    displayName: 'Create Chatbots',
    description: 'Can create AI chatbot models',
    resource: 'chatbot',
    action: 'create',
    scope: 'own',
    category: 'ai',
  },
  {
    name: 'ai:chatbot:train:own',
    displayName: 'Train Chatbots',
    description: 'Can train own chatbots',
    resource: 'chatbot',
    action: 'train',
    scope: 'own',
    category: 'ai',
  },
  {
    name: 'ai:chatbot:use:own',
    displayName: 'Use Chatbots',
    description: 'Can interact with chatbots',
    resource: 'chatbot',
    action: 'use',
    scope: 'own',
    category: 'ai',
  },
  {
    name: 'ai:chatbot:manage:all',
    displayName: 'Manage All Chatbots',
    description: 'Can manage all chatbot models',
    resource: 'chatbot',
    action: 'manage',
    scope: 'all',
    category: 'ai',
  },

  // ========== AUDIT LOGS ==========
  {
    name: 'audit:read:own',
    displayName: 'View Own Audit Logs',
    description: 'Can view own audit logs',
    resource: 'audit',
    action: 'read',
    scope: 'own',
    category: 'security',
  },
  {
    name: 'audit:read:all',
    displayName: 'View All Audit Logs',
    description: 'Can view all system audit logs',
    resource: 'audit',
    action: 'read',
    scope: 'all',
    category: 'security',
  },

  // ========== SETTINGS ==========
  {
    name: 'settings:read:all',
    displayName: 'View Settings',
    description: 'Can view system settings',
    resource: 'settings',
    action: 'read',
    scope: 'all',
    category: 'system',
  },
  {
    name: 'settings:update:all',
    displayName: 'Update Settings',
    description: 'Can update system settings',
    resource: 'settings',
    action: 'update',
    scope: 'all',
    category: 'system',
  },
];

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

async function cleanupUsers() {
  console.log('🔍 Finding user to keep...');

  const keepUser = await prisma.user.findFirst({
    where: { email: KEEP_USER_EMAIL },
  });

  if (!keepUser) {
    throw new Error(
      `❌ User with email ${KEEP_USER_EMAIL} not found! Cannot proceed.`,
    );
  }

  console.log(`✅ Found user to keep: ${keepUser.email} (ID: ${keepUser.id})`);
  console.log(`   Role: ${keepUser.roleType}, Active: ${keepUser.isActive}`);

  // Get all user IDs to delete
  const usersToDelete = await prisma.user.findMany({
    where: {
      id: { not: keepUser.id },
    },
    select: { id: true, email: true, username: true },
  });

  console.log(
    `\n📊 Found ${usersToDelete.length} users to delete (keeping ${KEEP_USER_EMAIL})`,
  );

  if (usersToDelete.length === 0) {
    console.log('✅ No users to delete. Database is already clean.');
    return keepUser;
  }

  const userIdsToDelete = usersToDelete.map((u) => u.id);

  console.log('\n🗑️  Starting user cleanup process...');

  // Delete in correct order to respect foreign key constraints
  console.log('   Deleting UserRoleAssignments...');
  const deletedRoleAssignments = await prisma.userRoleAssignment.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  });
  console.log(`   ✓ Deleted ${deletedRoleAssignments.count} role assignments`);

  console.log('   Deleting UserPermissions...');
  const deletedUserPermissions = await prisma.userPermission.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  });
  console.log(
    `   ✓ Deleted ${deletedUserPermissions.count} user permissions`,
  );

  console.log('   Deleting ResourceAccesses...');
  const deletedResourceAccesses = await prisma.resourceAccess.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  });
  console.log(
    `   ✓ Deleted ${deletedResourceAccesses.count} resource accesses`,
  );

  console.log('   Deleting UserSessions...');
  const deletedSessions = await prisma.userSession.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  });
  console.log(`   ✓ Deleted ${deletedSessions.count} sessions`);

  console.log('   Deleting VerificationTokens...');
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  });
  console.log(`   ✓ Deleted ${deletedTokens.count} verification tokens`);

  console.log('   Deleting AuthMethods...');
  const deletedAuthMethods = await prisma.authMethod.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  });
  console.log(`   ✓ Deleted ${deletedAuthMethods.count} auth methods`);

  console.log('   Setting AuditLogs userId to null...');
  const updatedAuditLogs = await prisma.auditLog.updateMany({
    where: { userId: { in: userIdsToDelete } },
    data: { userId: null },
  });
  console.log(`   ✓ Updated ${updatedAuditLogs.count} audit logs`);

  // Delete users (CASCADE will handle remaining relations)
  console.log('   Deleting Users...');
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: userIdsToDelete } },
  });
  console.log(`   ✓ Deleted ${deletedUsers.count} users`);

  console.log(
    `\n✅ User cleanup complete! Kept only: ${keepUser.email} (${keepUser.roleType})`,
  );

  return keepUser;
}

async function cleanupRoleAssignments() {
  console.log('\n🗑️  Cleaning up ALL role assignments...');

  const deletedAssignments = await prisma.userRoleAssignment.deleteMany({});
  console.log(`✅ Deleted ${deletedAssignments.count} role assignments`);

  const deletedUserPermissions = await prisma.userPermission.deleteMany({});
  console.log(
    `✅ Deleted ${deletedUserPermissions.count} direct user permissions`,
  );

  console.log('✅ All role assignments cleaned up!');
}

async function seedPermissions(keepUser: any) {
  console.log('\n🌱 Seeding comprehensive permissions...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const perm of COMPREHENSIVE_PERMISSIONS) {
    try {
      const existing = await prisma.permission.findUnique({
        where: { name: perm.name },
      });

      if (existing) {
        // Update existing permission
        await prisma.permission.update({
          where: { name: perm.name },
          data: {
            displayName: perm.displayName,
            description: perm.description,
            resource: perm.resource,
            action: perm.action,
            scope: perm.scope,
            category: perm.category,
            isActive: true,
            updatedAt: new Date(),
          },
        });
        updated++;
      } else {
        // Create new permission
        await prisma.permission.create({
          data: {
            ...perm,
            isSystemPerm: true,
            isActive: true,
            createdBy: keepUser.id,
          },
        });
        created++;
      }
    } catch (error) {
      console.error(`   ⚠️  Error processing ${perm.name}:`, error.message);
      skipped++;
    }
  }

  console.log('\n📊 Permission seeding summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   ⚠️  Skipped: ${skipped}`);
  console.log(
    `   📝 Total: ${COMPREHENSIVE_PERMISSIONS.length} permissions processed`,
  );
}

async function verifyCleanup() {
  console.log('\n🔍 Verifying cleanup results...');

  const userCount = await prisma.user.count();
  const roleAssignmentCount = await prisma.userRoleAssignment.count();
  const userPermissionCount = await prisma.userPermission.count();
  const permissionCount = await prisma.permission.count();
  const roleCount = await prisma.role.count();

  console.log('\n📊 Final Database State:');
  console.log(`   👥 Users: ${userCount} (expected: 1)`);
  console.log(`   🔗 Role Assignments: ${roleAssignmentCount} (expected: 0)`);
  console.log(
    `   🔑 User Direct Permissions: ${userPermissionCount} (expected: 0)`,
  );
  console.log(`   🎫 Permissions: ${permissionCount}`);
  console.log(`   👔 Roles: ${roleCount}`);

  if (userCount === 1) {
    const remainingUser = await prisma.user.findFirst();
    console.log(
      `\n✅ Verification passed! Only user: ${remainingUser.email} (${remainingUser.roleType})`,
    );
  } else {
    console.log(`\n⚠️  Warning: Found ${userCount} users, expected 1`);
  }

  if (roleAssignmentCount === 0 && userPermissionCount === 0) {
    console.log('✅ All role assignments cleaned up successfully!');
  } else {
    console.log(
      `⚠️  Warning: Found ${roleAssignmentCount} role assignments and ${userPermissionCount} user permissions`,
    );
  }

  console.log(
    `✅ Permissions structure intact with ${permissionCount} permissions`,
  );
  console.log(`✅ Roles structure intact with ${roleCount} roles`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🧹 CLEANUP USERS & SEED COMPREHENSIVE PERMISSIONS 🌱 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log(`📧 Keeping user: ${KEEP_USER_EMAIL}`);
  console.log(`🗑️  Deleting all other users and their data`);
  console.log(`🧹 Cleaning up all role assignments`);
  console.log(
    `🌱 Seeding ${COMPREHENSIVE_PERMISSIONS.length} comprehensive permissions\n`,
  );

  try {
    // Step 1: Cleanup users (except keep user)
    const keepUser = await cleanupUsers();

    // Step 2: Cleanup all role assignments
    await cleanupRoleAssignments();

    // Step 3: Seed comprehensive permissions
    await seedPermissions(keepUser);

    // Step 4: Verify cleanup
    await verifyCleanup();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║          ✅ CLEANUP & SEED COMPLETED! 🎉           ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log('📋 Next Steps:');
    console.log('   1. Review the cleanup results above');
    console.log('   2. Assign appropriate roles to the kept user if needed');
    console.log('   3. Create new users as needed');
    console.log('   4. Assign roles and permissions to new users\n');
  } catch (error) {
    console.error('\n❌ Error during cleanup and seed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
