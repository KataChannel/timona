export declare enum LMSPermission {
    COURSE_VIEW_ALL = "course:view:all",
    COURSE_VIEW_OWN = "course:view:own",
    COURSE_CREATE = "course:create",
    COURSE_EDIT_ALL = "course:edit:all",
    COURSE_EDIT_OWN = "course:edit:own",
    COURSE_DELETE_ALL = "course:delete:all",
    COURSE_DELETE_OWN = "course:delete:own",
    COURSE_PUBLISH = "course:publish",
    MODULE_CREATE = "module:create",
    MODULE_EDIT = "module:edit",
    MODULE_DELETE = "module:delete",
    MODULE_REORDER = "module:reorder",
    LESSON_CREATE = "lesson:create",
    LESSON_EDIT = "lesson:edit",
    LESSON_DELETE = "lesson:delete",
    LESSON_REORDER = "lesson:reorder",
    QUIZ_VIEW_ALL = "quiz:view:all",
    QUIZ_VIEW_OWN = "quiz:view:own",
    QUIZ_CREATE = "quiz:create",
    QUIZ_EDIT_ALL = "quiz:edit:all",
    QUIZ_EDIT_OWN = "quiz:edit:own",
    QUIZ_DELETE_ALL = "quiz:delete:all",
    QUIZ_DELETE_OWN = "quiz:delete:own",
    STUDENT_VIEW_ALL = "student:view:all",
    STUDENT_VIEW_OWN = "student:view:own",
    STUDENT_MANAGE = "student:manage",
    STUDENT_PROGRESS_VIEW = "student:progress:view",
    STUDENT_GRADE = "student:grade",
    ENROLLMENT_VIEW_ALL = "enrollment:view:all",
    ENROLLMENT_CREATE = "enrollment:create",
    ENROLLMENT_DELETE = "enrollment:delete",
    ENROLLMENT_APPROVE = "enrollment:approve",
    CATEGORY_VIEW = "category:view",
    CATEGORY_CREATE = "category:create",
    CATEGORY_EDIT = "category:edit",
    CATEGORY_DELETE = "category:delete",
    ANALYTICS_VIEW_ALL = "analytics:view:all",
    ANALYTICS_VIEW_OWN = "analytics:view:own",
    REPORT_GENERATE = "report:generate",
    REPORT_EXPORT = "report:export",
    SETTINGS_LMS = "settings:lms",
    SETTINGS_GENERAL = "settings:general"
}
export declare const RolePermissions: {
    ADMIN: LMSPermission[];
    GIANGVIEN: LMSPermission[];
    USER: any[];
    GUEST: any[];
};
export declare function hasPermission(userRole: string, permission: LMSPermission): boolean;
export declare function hasAnyPermission(userRole: string, permissions: LMSPermission[]): boolean;
export declare function hasAllPermissions(userRole: string, permissions: LMSPermission[]): boolean;
export declare function getRolePermissions(userRole: string): LMSPermission[];
