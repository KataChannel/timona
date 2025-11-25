"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBAC_ERROR_MESSAGES = exports.SCOPE_HIERARCHY = void 0;
exports.scopeIncludes = scopeIncludes;
exports.getIncludedScopes = getIncludedScopes;
exports.SCOPE_HIERARCHY = {
    own: 1,
    team: 2,
    organization: 3,
    all: 4,
};
function scopeIncludes(userScope, requiredScope) {
    if (!requiredScope)
        return true;
    if (!userScope)
        return false;
    if (userScope === requiredScope)
        return true;
    const userLevel = exports.SCOPE_HIERARCHY[userScope];
    const requiredLevel = exports.SCOPE_HIERARCHY[requiredScope];
    if (userLevel === undefined || requiredLevel === undefined) {
        return userScope === requiredScope;
    }
    return userLevel >= requiredLevel;
}
function getIncludedScopes(scope) {
    const level = exports.SCOPE_HIERARCHY[scope];
    if (level === undefined) {
        return [scope];
    }
    return Object.entries(exports.SCOPE_HIERARCHY)
        .filter(([_, scopeLevel]) => scopeLevel <= level)
        .sort(([_, a], [__, b]) => b - a)
        .map(([scopeName]) => scopeName);
}
exports.RBAC_ERROR_MESSAGES = {
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to access this resource',
    ROLE_NOT_FOUND: 'Role not found',
    PERMISSION_NOT_FOUND: 'Permission not found',
    USER_NOT_FOUND: 'User not found',
    ROLE_ALREADY_ASSIGNED: 'Role already assigned to user',
    INVALID_SCOPE: 'Invalid scope specified',
    OWNERSHIP_REQUIRED: 'You can only access your own resources',
    ADMIN_REQUIRED: 'Admin role required for this action',
};
//# sourceMappingURL=rbac.constants.js.map