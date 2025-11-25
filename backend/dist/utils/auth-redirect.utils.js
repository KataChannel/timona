"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthRedirectSettings = getAuthRedirectSettings;
exports.getLoginRedirectUrl = getLoginRedirectUrl;
exports.getLogoutRedirectUrl = getLogoutRedirectUrl;
exports.getRegisterRedirectUrl = getRegisterRedirectUrl;
exports.getAuthSetting = getAuthSetting;
exports.updateAuthRedirectSetting = updateAuthRedirectSetting;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getAuthRedirectSettings() {
    const settings = await prisma.websiteSetting.findMany({
        where: {
            category: 'AUTH',
            group: 'redirect',
            isActive: true
        }
    });
    const settingsMap = {};
    settings.forEach(s => {
        settingsMap[s.key] = s.value || '';
    });
    return settingsMap;
}
async function getLoginRedirectUrl(userId) {
    const settings = await getAuthRedirectSettings();
    const roleBasedRedirect = settings['auth_role_based_redirect'] === 'true';
    if (!roleBasedRedirect) {
        return settings['auth_login_redirect'] || '/dashboard';
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: {
                include: {
                    role: true
                }
            }
        }
    });
    if (!user) {
        return settings['auth_login_redirect'] || '/dashboard';
    }
    const hasGiangvienRole = user.userRoles.some(ur => ur.role.name === 'giangvien');
    if (hasGiangvienRole) {
        return settings['auth_redirect_giangvien'] || '/lms/instructor';
    }
    switch (user.roleType.toUpperCase()) {
        case 'ADMIN':
            return settings['auth_redirect_admin'] || '/admin';
        case 'USER':
            return settings['auth_redirect_user'] || '/dashboard';
        case 'GUEST':
            return settings['auth_redirect_guest'] || '/courses';
        default:
            return settings['auth_login_redirect'] || '/dashboard';
    }
}
async function getLogoutRedirectUrl() {
    const settings = await getAuthRedirectSettings();
    return settings['auth_logout_redirect'] || '/';
}
async function getRegisterRedirectUrl() {
    const settings = await getAuthRedirectSettings();
    return settings['auth_register_redirect'] || '/welcome';
}
async function getAuthSetting(key) {
    const setting = await prisma.websiteSetting.findUnique({
        where: { key }
    });
    return setting?.value || null;
}
async function updateAuthRedirectSetting(key, value, userId) {
    await prisma.websiteSetting.update({
        where: { key },
        data: {
            value,
            updatedBy: userId
        }
    });
}
//# sourceMappingURL=auth-redirect.utils.js.map