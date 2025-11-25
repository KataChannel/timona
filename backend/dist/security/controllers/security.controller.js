"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const mfa_service_1 = require("../services/mfa.service");
let SecurityController = class SecurityController {
    constructor(mfaService) {
        this.mfaService = mfaService;
    }
    async setupTotp(req, setupDto) {
        try {
            const userId = req.user.id;
            const totpSetup = await this.mfaService.setupTotp(userId, setupDto.deviceInfo);
            return {
                success: true,
                data: totpSetup,
                message: 'TOTP setup initiated successfully. Please scan the QR code and verify with a token.'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to setup TOTP'
            };
        }
    }
    async verifyTotpSetup(req, verifyDto) {
        try {
            const userId = req.user.id;
            const success = await this.mfaService.verifyAndEnableTotp(userId, verifyDto.token, verifyDto.deviceInfo);
            return {
                success,
                message: success ? 'TOTP MFA enabled successfully' : 'Invalid TOTP token'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to verify TOTP token'
            };
        }
    }
    async verifyTotp(req, verifyDto) {
        try {
            const userId = req.user.id;
            const result = await this.mfaService.verifyTotp(userId, verifyDto.token, verifyDto.deviceInfo);
            return {
                success: result.success,
                data: result,
                message: result.success ? 'TOTP verified successfully' : 'Invalid TOTP token'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to verify TOTP token'
            };
        }
    }
    async setupSms(req, setupDto) {
        try {
            const userId = req.user.id;
            await this.mfaService.setupSms(userId, setupDto.phoneNumber, setupDto.deviceInfo);
            return {
                success: true,
                message: 'SMS MFA setup initiated. Please verify with the code sent to your phone.'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to setup SMS MFA'
            };
        }
    }
    async sendSmsCode(req, body) {
        try {
            const userId = req.user.id;
            await this.mfaService.sendSmsCode(userId, body.deviceInfo);
            return {
                success: true,
                message: 'SMS verification code sent successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send SMS code'
            };
        }
    }
    async verifySmsCode(req, verifyDto) {
        try {
            const userId = req.user.id;
            const result = await this.mfaService.verifySmsCode(userId, verifyDto.code, verifyDto.deviceInfo);
            return {
                success: result.success,
                data: result,
                message: result.success ? 'SMS code verified successfully' : 'Invalid SMS code'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to verify SMS code'
            };
        }
    }
    async verifyBackupCode(req, verifyDto) {
        try {
            const userId = req.user.id;
            const result = await this.mfaService.verifyBackupCode(userId, verifyDto.code, verifyDto.deviceInfo);
            return {
                success: result.success,
                data: result,
                message: result.success ? 'Backup code verified successfully' : 'Invalid backup code'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to verify backup code'
            };
        }
    }
    async regenerateBackupCodes(req) {
        try {
            const userId = req.user.id;
            const backupCodes = await this.mfaService.generateNewBackupCodes(userId);
            return {
                success: true,
                data: backupCodes,
                message: 'New backup codes generated successfully. Please store them securely.'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to generate backup codes'
            };
        }
    }
    async getMfaSettings(req) {
        try {
            const userId = req.user.id;
            const settings = await this.mfaService.getMfaSettings(userId);
            return {
                success: true,
                data: settings,
                message: 'MFA settings retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to retrieve MFA settings'
            };
        }
    }
    async disableMfaMethod(req, method) {
        try {
            const userId = req.user.id;
            await this.mfaService.disableMfaMethod(userId, method);
            return {
                success: true,
                message: `${method.toUpperCase()} MFA disabled successfully`
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || `Failed to disable ${method} MFA`
            };
        }
    }
    async getSecurityDashboard(req) {
        try {
            const userId = req.user.id;
            const mfaSettings = await this.mfaService.getMfaSettings(userId);
            const dashboardData = {
                mfa: mfaSettings,
                recentActivity: {
                    totalLogins: 45,
                    lastLogin: new Date(),
                    failedAttempts: 2,
                    suspiciousActivity: 0
                },
                devices: {
                    totalDevices: 3,
                    trustedDevices: 2,
                    activeDevices: 1
                },
                security: {
                    passwordStrength: 'strong',
                    lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    securityScore: 85
                }
            };
            return {
                success: true,
                data: dashboardData,
                message: 'Security dashboard data retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to retrieve security dashboard data'
            };
        }
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Post)('mfa/totp/setup'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "setupTotp", null);
__decorate([
    (0, common_1.Post)('mfa/totp/verify-setup'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "verifyTotpSetup", null);
__decorate([
    (0, common_1.Post)('mfa/totp/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "verifyTotp", null);
__decorate([
    (0, common_1.Post)('mfa/sms/setup'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "setupSms", null);
__decorate([
    (0, common_1.Post)('mfa/sms/send-code'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "sendSmsCode", null);
__decorate([
    (0, common_1.Post)('mfa/sms/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "verifySmsCode", null);
__decorate([
    (0, common_1.Post)('mfa/backup-code/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "verifyBackupCode", null);
__decorate([
    (0, common_1.Post)('mfa/backup-codes/regenerate'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "regenerateBackupCodes", null);
__decorate([
    (0, common_1.Get)('mfa/settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getMfaSettings", null);
__decorate([
    (0, common_1.Delete)('mfa/:method'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "disableMfaMethod", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getSecurityDashboard", null);
exports.SecurityController = SecurityController = __decorate([
    (0, common_1.Controller)('security'),
    __metadata("design:paramtypes", [mfa_service_1.MfaService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map