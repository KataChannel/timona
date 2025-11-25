import { SetMetadata } from '@nestjs/common';
import { LMSPermission } from '../permissions/lms.permissions';

export const LMS_PERMISSIONS_KEY = 'lms_permissions';

/**
 * Decorator để check LMS permissions
 * @param permissions - Danh sách permissions cần có
 * 
 * @example
 * @LMSPermissions(LMSPermission.COURSE_CREATE, LMSPermission.COURSE_EDIT_OWN)
 * async createCourse() { ... }
 */
export const LMSPermissions = (...permissions: LMSPermission[]) =>
  SetMetadata(LMS_PERMISSIONS_KEY, permissions);
