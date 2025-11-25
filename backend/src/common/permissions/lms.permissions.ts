/**
 * LMS Permissions System
 * Định nghĩa quyền hạn cho ADMIN và GIANGVIEN
 */

export enum LMSPermission {
  // Course Management
  COURSE_VIEW_ALL = 'course:view:all',
  COURSE_VIEW_OWN = 'course:view:own',
  COURSE_CREATE = 'course:create',
  COURSE_EDIT_ALL = 'course:edit:all',
  COURSE_EDIT_OWN = 'course:edit:own',
  COURSE_DELETE_ALL = 'course:delete:all',
  COURSE_DELETE_OWN = 'course:delete:own',
  COURSE_PUBLISH = 'course:publish',

  // Module Management
  MODULE_CREATE = 'module:create',
  MODULE_EDIT = 'module:edit',
  MODULE_DELETE = 'module:delete',
  MODULE_REORDER = 'module:reorder',

  // Lesson Management
  LESSON_CREATE = 'lesson:create',
  LESSON_EDIT = 'lesson:edit',
  LESSON_DELETE = 'lesson:delete',
  LESSON_REORDER = 'lesson:reorder',

  // Quiz Management
  QUIZ_VIEW_ALL = 'quiz:view:all',
  QUIZ_VIEW_OWN = 'quiz:view:own',
  QUIZ_CREATE = 'quiz:create',
  QUIZ_EDIT_ALL = 'quiz:edit:all',
  QUIZ_EDIT_OWN = 'quiz:edit:own',
  QUIZ_DELETE_ALL = 'quiz:delete:all',
  QUIZ_DELETE_OWN = 'quiz:delete:own',

  // Student Management
  STUDENT_VIEW_ALL = 'student:view:all',
  STUDENT_VIEW_OWN = 'student:view:own', // Students in own courses
  STUDENT_MANAGE = 'student:manage',
  STUDENT_PROGRESS_VIEW = 'student:progress:view',
  STUDENT_GRADE = 'student:grade',

  // Enrollment Management
  ENROLLMENT_VIEW_ALL = 'enrollment:view:all',
  ENROLLMENT_CREATE = 'enrollment:create',
  ENROLLMENT_DELETE = 'enrollment:delete',
  ENROLLMENT_APPROVE = 'enrollment:approve',

  // Category Management
  CATEGORY_VIEW = 'category:view',
  CATEGORY_CREATE = 'category:create',
  CATEGORY_EDIT = 'category:edit',
  CATEGORY_DELETE = 'category:delete',

  // Analytics & Reports
  ANALYTICS_VIEW_ALL = 'analytics:view:all',
  ANALYTICS_VIEW_OWN = 'analytics:view:own',
  REPORT_GENERATE = 'report:generate',
  REPORT_EXPORT = 'report:export',

  // System Settings
  SETTINGS_LMS = 'settings:lms',
  SETTINGS_GENERAL = 'settings:general',
}

/**
 * Role-based Permissions
 */
export const RolePermissions = {
  ADMIN: [
    // Course - Full Access
    LMSPermission.COURSE_VIEW_ALL,
    LMSPermission.COURSE_CREATE,
    LMSPermission.COURSE_EDIT_ALL,
    LMSPermission.COURSE_DELETE_ALL,
    LMSPermission.COURSE_PUBLISH,

    // Module - Full Access
    LMSPermission.MODULE_CREATE,
    LMSPermission.MODULE_EDIT,
    LMSPermission.MODULE_DELETE,
    LMSPermission.MODULE_REORDER,

    // Lesson - Full Access
    LMSPermission.LESSON_CREATE,
    LMSPermission.LESSON_EDIT,
    LMSPermission.LESSON_DELETE,
    LMSPermission.LESSON_REORDER,

    // Quiz - Full Access
    LMSPermission.QUIZ_VIEW_ALL,
    LMSPermission.QUIZ_CREATE,
    LMSPermission.QUIZ_EDIT_ALL,
    LMSPermission.QUIZ_DELETE_ALL,

    // Student - Full Access
    LMSPermission.STUDENT_VIEW_ALL,
    LMSPermission.STUDENT_MANAGE,
    LMSPermission.STUDENT_PROGRESS_VIEW,
    LMSPermission.STUDENT_GRADE,

    // Enrollment - Full Access
    LMSPermission.ENROLLMENT_VIEW_ALL,
    LMSPermission.ENROLLMENT_CREATE,
    LMSPermission.ENROLLMENT_DELETE,
    LMSPermission.ENROLLMENT_APPROVE,

    // Category - Full Access
    LMSPermission.CATEGORY_VIEW,
    LMSPermission.CATEGORY_CREATE,
    LMSPermission.CATEGORY_EDIT,
    LMSPermission.CATEGORY_DELETE,

    // Analytics - Full Access
    LMSPermission.ANALYTICS_VIEW_ALL,
    LMSPermission.REPORT_GENERATE,
    LMSPermission.REPORT_EXPORT,

    // Settings - Full Access
    LMSPermission.SETTINGS_LMS,
    LMSPermission.SETTINGS_GENERAL,
  ],

  GIANGVIEN: [
    // Course - Only Own Courses
    LMSPermission.COURSE_VIEW_OWN,
    LMSPermission.COURSE_CREATE,
    LMSPermission.COURSE_EDIT_OWN,
    LMSPermission.COURSE_DELETE_OWN,
    LMSPermission.COURSE_PUBLISH,

    // Module - Full Access (for own courses)
    LMSPermission.MODULE_CREATE,
    LMSPermission.MODULE_EDIT,
    LMSPermission.MODULE_DELETE,
    LMSPermission.MODULE_REORDER,

    // Lesson - Full Access (for own courses)
    LMSPermission.LESSON_CREATE,
    LMSPermission.LESSON_EDIT,
    LMSPermission.LESSON_DELETE,
    LMSPermission.LESSON_REORDER,

    // Quiz - Only Own Quizzes
    LMSPermission.QUIZ_VIEW_OWN,
    LMSPermission.QUIZ_CREATE,
    LMSPermission.QUIZ_EDIT_OWN,
    LMSPermission.QUIZ_DELETE_OWN,

    // Student - Only Own Course Students
    LMSPermission.STUDENT_VIEW_OWN,
    LMSPermission.STUDENT_PROGRESS_VIEW,
    LMSPermission.STUDENT_GRADE,

    // Enrollment - View Only
    LMSPermission.ENROLLMENT_VIEW_ALL,

    // Category - View Only
    LMSPermission.CATEGORY_VIEW,

    // Analytics - Only Own Courses
    LMSPermission.ANALYTICS_VIEW_OWN,
    LMSPermission.REPORT_GENERATE,
    LMSPermission.REPORT_EXPORT,
  ],

  USER: [],
  GUEST: [],
};

/**
 * Check if user has permission
 */
export function hasPermission(
  userRole: string,
  permission: LMSPermission
): boolean {
  const permissions = RolePermissions[userRole as keyof typeof RolePermissions];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if user has any of the permissions
 */
export function hasAnyPermission(
  userRole: string,
  permissions: LMSPermission[]
): boolean {
  return permissions.some((p) => hasPermission(userRole, p));
}

/**
 * Check if user has all permissions
 */
export function hasAllPermissions(
  userRole: string,
  permissions: LMSPermission[]
): boolean {
  return permissions.every((p) => hasPermission(userRole, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(userRole: string): LMSPermission[] {
  return RolePermissions[userRole as keyof typeof RolePermissions] || [];
}
