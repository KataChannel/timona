"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LMSPermissions = exports.LMS_PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.LMS_PERMISSIONS_KEY = 'lms_permissions';
const LMSPermissions = (...permissions) => (0, common_1.SetMetadata)(exports.LMS_PERMISSIONS_KEY, permissions);
exports.LMSPermissions = LMSPermissions;
//# sourceMappingURL=lms-permissions.decorator.js.map