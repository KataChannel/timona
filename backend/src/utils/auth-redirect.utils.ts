import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get auth redirect settings
 */
export async function getAuthRedirectSettings() {
  const settings = await prisma.websiteSetting.findMany({
    where: {
      category: 'AUTH',
      group: 'redirect',
      isActive: true
    }
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.key] = s.value || '';
  });

  return settingsMap;
}

/**
 * Get redirect URL after login based on user role
 */
export async function getLoginRedirectUrl(userId: string): Promise<string> {
  const settings = await getAuthRedirectSettings();
  
  const roleBasedRedirect = settings['auth_role_based_redirect'] === 'true';
  
  if (!roleBasedRedirect) {
    return settings['auth_login_redirect'] || '/dashboard';
  }

  // Get user with their assigned roles
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

  // Check for giangvien role first (highest priority for LMS)
  const hasGiangvienRole = user.userRoles.some(ur => ur.role.name === 'giangvien');
  if (hasGiangvienRole) {
    return settings['auth_redirect_giangvien'] || '/lms/instructor';
  }

  // Then check roleType for backward compatibility
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

/**
 * Get redirect URL after logout
 */
export async function getLogoutRedirectUrl(): Promise<string> {
  const settings = await getAuthRedirectSettings();
  return settings['auth_logout_redirect'] || '/';
}

/**
 * Get redirect URL after registration
 */
export async function getRegisterRedirectUrl(): Promise<string> {
  const settings = await getAuthRedirectSettings();
  return settings['auth_register_redirect'] || '/welcome';
}

/**
 * Get specific setting value
 */
export async function getAuthSetting(key: string): Promise<string | null> {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key }
  });
  return setting?.value || null;
}

/**
 * Update auth redirect setting
 */
export async function updateAuthRedirectSetting(
  key: string, 
  value: string,
  userId?: string
): Promise<void> {
  await prisma.websiteSetting.update({
    where: { key },
    data: { 
      value,
      updatedBy: userId
    }
  });
}
