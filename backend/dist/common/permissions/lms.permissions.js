"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = exports.LMSPermission = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.getRolePermissions = getRolePermissions;
var LMSPermission;
(function (LMSPermission) {
    LMSPermission["COURSE_VIEW_ALL"] = "course:view:all";
    LMSPermission["COURSE_VIEW_OWN"] = "course:view:own";
    LMSPermission["COURSE_CREATE"] = "course:create";
    LMSPermission["COURSE_EDIT_ALL"] = "course:edit:all";
    LMSPermission["COURSE_EDIT_OWN"] = "course:edit:own";
    LMSPermission["COURSE_DELETE_ALL"] = "course:delete:all";
    LMSPermission["COURSE_DELETE_OWN"] = "course:delete:own";
    LMSPermission["COURSE_PUBLISH"] = "course:publish";
    LMSPermission["MODULE_CREATE"] = "module:create";
    LMSPermission["MODULE_EDIT"] = "module:edit";
    LMSPermission["MODULE_DELETE"] = "module:delete";
    LMSPermission["MODULE_REORDER"] = "module:reorder";
    LMSPermission["LESSON_CREATE"] = "lesson:create";
    LMSPermission["LESSON_EDIT"] = "lesson:edit";
    LMSPermission["LESSON_DELETE"] = "lesson:delete";
    LMSPermission["LESSON_REORDER"] = "lesson:reorder";
    LMSPermission["QUIZ_VIEW_ALL"] = "quiz:view:all";
    LMSPermission["QUIZ_VIEW_OWN"] = "quiz:view:own";
    LMSPermission["QUIZ_CREATE"] = "quiz:create";
    LMSPermission["QUIZ_EDIT_ALL"] = "quiz:edit:all";
    LMSPermission["QUIZ_EDIT_OWN"] = "quiz:edit:own";
    LMSPermission["QUIZ_DELETE_ALL"] = "quiz:delete:all";
    LMSPermission["QUIZ_DELETE_OWN"] = "quiz:delete:own";
    LMSPermission["STUDENT_VIEW_ALL"] = "student:view:all";
    LMSPermission["STUDENT_VIEW_OWN"] = "student:view:own";
    LMSPermission["STUDENT_MANAGE"] = "student:manage";
    LMSPermission["STUDENT_PROGRESS_VIEW"] = "student:progress:view";
    LMSPermission["STUDENT_GRADE"] = "student:grade";
    LMSPermission["ENROLLMENT_VIEW_ALL"] = "enrollment:view:all";
    LMSPermission["ENROLLMENT_CREATE"] = "enrollment:create";
    LMSPermission["ENROLLMENT_DELETE"] = "enrollment:delete";
    LMSPermission["ENROLLMENT_APPROVE"] = "enrollment:approve";
    LMSPermission["CATEGORY_VIEW"] = "category:view";
    LMSPermission["CATEGORY_CREATE"] = "category:create";
    LMSPermission["CATEGORY_EDIT"] = "category:edit";
    LMSPermission["CATEGORY_DELETE"] = "category:delete";
    LMSPermission["ANALYTICS_VIEW_ALL"] = "analytics:view:all";
    LMSPermission["ANALYTICS_VIEW_OWN"] = "analytics:view:own";
    LMSPermission["REPORT_GENERATE"] = "report:generate";
    LMSPermission["REPORT_EXPORT"] = "report:export";
    LMSPermission["SETTINGS_LMS"] = "settings:lms";
    LMSPermission["SETTINGS_GENERAL"] = "settings:general";
})(LMSPermission || (exports.LMSPermission = LMSPermission = {}));
exports.RolePermissions = {
    ADMIN: [
        LMSPermission.COURSE_VIEW_ALL,
        LMSPermission.COURSE_CREATE,
        LMSPermission.COURSE_EDIT_ALL,
        LMSPermission.COURSE_DELETE_ALL,
        LMSPermission.COURSE_PUBLISH,
        LMSPermission.MODULE_CREATE,
        LMSPermission.MODULE_EDIT,
        LMSPermission.MODULE_DELETE,
        LMSPermission.MODULE_REORDER,
        LMSPermission.LESSON_CREATE,
        LMSPermission.LESSON_EDIT,
        LMSPermission.LESSON_DELETE,
        LMSPermission.LESSON_REORDER,
        LMSPermission.QUIZ_VIEW_ALL,
        LMSPermission.QUIZ_CREATE,
        LMSPermission.QUIZ_EDIT_ALL,
        LMSPermission.QUIZ_DELETE_ALL,
        LMSPermission.STUDENT_VIEW_ALL,
        LMSPermission.STUDENT_MANAGE,
        LMSPermission.STUDENT_PROGRESS_VIEW,
        LMSPermission.STUDENT_GRADE,
        LMSPermission.ENROLLMENT_VIEW_ALL,
        LMSPermission.ENROLLMENT_CREATE,
        LMSPermission.ENROLLMENT_DELETE,
        LMSPermission.ENROLLMENT_APPROVE,
        LMSPermission.CATEGORY_VIEW,
        LMSPermission.CATEGORY_CREATE,
        LMSPermission.CATEGORY_EDIT,
        LMSPermission.CATEGORY_DELETE,
        LMSPermission.ANALYTICS_VIEW_ALL,
        LMSPermission.REPORT_GENERATE,
        LMSPermission.REPORT_EXPORT,
        LMSPermission.SETTINGS_LMS,
        LMSPermission.SETTINGS_GENERAL,
    ],
    GIANGVIEN: [
        LMSPermission.COURSE_VIEW_OWN,
        LMSPermission.COURSE_CREATE,
        LMSPermission.COURSE_EDIT_OWN,
        LMSPermission.COURSE_DELETE_OWN,
        LMSPermission.COURSE_PUBLISH,
        LMSPermission.MODULE_CREATE,
        LMSPermission.MODULE_EDIT,
        LMSPermission.MODULE_DELETE,
        LMSPermission.MODULE_REORDER,
        LMSPermission.LESSON_CREATE,
        LMSPermission.LESSON_EDIT,
        LMSPermission.LESSON_DELETE,
        LMSPermission.LESSON_REORDER,
        LMSPermission.QUIZ_VIEW_OWN,
        LMSPermission.QUIZ_CREATE,
        LMSPermission.QUIZ_EDIT_OWN,
        LMSPermission.QUIZ_DELETE_OWN,
        LMSPermission.STUDENT_VIEW_OWN,
        LMSPermission.STUDENT_PROGRESS_VIEW,
        LMSPermission.STUDENT_GRADE,
        LMSPermission.ENROLLMENT_VIEW_ALL,
        LMSPermission.CATEGORY_VIEW,
        LMSPermission.ANALYTICS_VIEW_OWN,
        LMSPermission.REPORT_GENERATE,
        LMSPermission.REPORT_EXPORT,
    ],
    USER: [],
    GUEST: [],
};
function hasPermission(userRole, permission) {
    const permissions = exports.RolePermissions[userRole];
    return permissions ? permissions.includes(permission) : false;
}
function hasAnyPermission(userRole, permissions) {
    return permissions.some((p) => hasPermission(userRole, p));
}
function hasAllPermissions(userRole, permissions) {
    return permissions.every((p) => hasPermission(userRole, p));
}
function getRolePermissions(userRole) {
    return exports.RolePermissions[userRole] || [];
}
//# sourceMappingURL=lms.permissions.js.map