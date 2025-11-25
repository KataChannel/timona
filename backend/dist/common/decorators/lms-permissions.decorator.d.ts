import { LMSPermission } from '../permissions/lms.permissions';
export declare const LMS_PERMISSIONS_KEY = "lms_permissions";
export declare const LMSPermissions: (...permissions: LMSPermission[]) => import("@nestjs/common").CustomDecorator<string>;
