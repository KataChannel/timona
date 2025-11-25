"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MfaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const speakeasy = __importStar(require("speakeasy"));
const QRCode = __importStar(require("qrcode"));
const crypto = __importStar(require("crypto"));
const config_1 = require("@nestjs/config");
let MfaService = MfaService_1 = class MfaService {
    constructor(prisma, cacheManager, configService) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.logger = new common_1.Logger(MfaService_1.name);
        this.MAX_ATTEMPTS = 5;
        this.LOCKOUT_DURATION = 15 * 60 * 1000;
        this.BACKUP_CODES_COUNT = 10;
    }
    async setupTotp(userId, deviceInfo) {
        try {
            const existingMfa = await this.prisma.userMfaSettings.findUnique({
                where: { userId }
            });
            if (existingMfa?.totpEnabled) {
                throw new common_1.BadRequestException('TOTP is already enabled for this user');
            }
            const secret = speakeasy.generateSecret({
                name: `rausachcore (${userId})`,
                issuer: 'rausachcore Enterprise',
                length: 32
            });
            const backupCodes = await this.generateBackupCodes();
            await this.prisma.userMfaSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    totpSecret: this.encryptSecret(secret.base32),
                    backupCodes: this.encryptBackupCodes(backupCodes),
                    totpEnabled: false,
                    backupCodesGenerated: true
                },
                update: {
                    totpSecret: this.encryptSecret(secret.base32),
                    backupCodes: this.encryptBackupCodes(backupCodes),
                    backupCodesGenerated: true
                }
            });
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
            await this.logMfaEvent(userId, 'totp_setup_initiated', { deviceInfo });
            this.logger.log(`TOTP setup initiated for user ${userId}`);
            return {
                secret: secret.base32,
                qrCodeUrl,
                backupCodes: backupCodes.map(bc => bc.code),
                manualEntryKey: secret.base32
            };
        }
        catch (error) {
            this.logger.error(`Failed to setup TOTP for user ${userId}:`, error);
            throw error;
        }
    }
    async verifyAndEnableTotp(userId, token, deviceInfo) {
        try {
            const mfaSettings = await this.prisma.userMfaSettings.findUnique({
                where: { userId }
            });
            if (!mfaSettings?.totpSecret) {
                throw new common_1.BadRequestException('TOTP not set up for this user');
            }
            if (mfaSettings.totpEnabled) {
                throw new common_1.BadRequestException('TOTP is already enabled');
            }
            const secret = this.decryptSecret(mfaSettings.totpSecret);
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: 2
            });
            if (!verified) {
                await this.logMfaEvent(userId, 'totp_verification_failed', { token: '***', deviceInfo });
                throw new common_1.UnauthorizedException('Invalid TOTP token');
            }
            await this.prisma.userMfaSettings.update({
                where: { userId },
                data: {
                    totpEnabled: true,
                    preferredMethod: 'totp',
                    enabledAt: new Date()
                }
            });
            await this.logMfaEvent(userId, 'totp_enabled', { deviceInfo });
            this.logger.log(`TOTP successfully enabled for user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to verify and enable TOTP for user ${userId}:`, error);
            throw error;
        }
    }
    async verifyTotp(userId, token, deviceInfo) {
        try {
            const lockoutKey = `mfa_lockout:${userId}`;
            const attemptsKey = `mfa_attempts:${userId}`;
            const isLockedOut = await this.cacheManager.get(lockoutKey);
            if (isLockedOut) {
                const ttl = await this.cacheManager.ttl(lockoutKey);
                return {
                    success: false,
                    method: 'totp',
                    nextAvailableAttempt: new Date(Date.now() + ttl * 1000)
                };
            }
            const attempts = (await this.cacheManager.get(attemptsKey)) || 0;
            if (attempts >= this.MAX_ATTEMPTS) {
                await this.cacheManager.set(lockoutKey, true, this.LOCKOUT_DURATION / 1000);
                await this.logMfaEvent(userId, 'mfa_lockout', { attempts, deviceInfo });
                return {
                    success: false,
                    method: 'totp',
                    nextAvailableAttempt: new Date(Date.now() + this.LOCKOUT_DURATION)
                };
            }
            const mfaSettings = await this.prisma.userMfaSettings.findUnique({
                where: { userId }
            });
            if (!mfaSettings?.totpEnabled || !mfaSettings.totpSecret) {
                throw new common_1.BadRequestException('TOTP not enabled for this user');
            }
            const secret = this.decryptSecret(mfaSettings.totpSecret);
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: 2
            });
            if (verified) {
                await this.cacheManager.del(attemptsKey);
                await this.logMfaEvent(userId, 'totp_verified', { deviceInfo });
                return {
                    success: true,
                    method: 'totp'
                };
            }
            else {
                await this.cacheManager.set(attemptsKey, attempts + 1, 3600);
                await this.logMfaEvent(userId, 'totp_verification_failed', { attempts: attempts + 1, deviceInfo });
                return {
                    success: false,
                    method: 'totp',
                    remainingAttempts: this.MAX_ATTEMPTS - attempts - 1
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to verify TOTP for user ${userId}:`, error);
            throw error;
        }
    }
    async setupSms(userId, phoneNumber, deviceInfo) {
        try {
            if (!this.isValidPhoneNumber(phoneNumber)) {
                throw new common_1.BadRequestException('Invalid phone number format');
            }
            await this.prisma.userMfaSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    smsPhoneNumber: this.encryptPhoneNumber(phoneNumber),
                    smsEnabled: false
                },
                update: {
                    smsPhoneNumber: this.encryptPhoneNumber(phoneNumber)
                }
            });
            await this.sendVerificationSms(userId, phoneNumber);
            await this.logMfaEvent(userId, 'sms_setup_initiated', { phoneNumber: this.maskPhoneNumber(phoneNumber), deviceInfo });
            this.logger.log(`SMS MFA setup initiated for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to setup SMS MFA for user ${userId}:`, error);
            throw error;
        }
    }
    async sendSmsCode(userId, deviceInfo) {
        try {
            const mfaSettings = await this.prisma.userMfaSettings.findUnique({
                where: { userId }
            });
            if (!mfaSettings?.smsEnabled || !mfaSettings.smsPhoneNumber) {
                throw new common_1.BadRequestException('SMS MFA not enabled for this user');
            }
            const phoneNumber = this.decryptPhoneNumber(mfaSettings.smsPhoneNumber);
            await this.sendVerificationSms(userId, phoneNumber);
            await this.logMfaEvent(userId, 'sms_code_sent', { phoneNumber: this.maskPhoneNumber(phoneNumber), deviceInfo });
        }
        catch (error) {
            this.logger.error(`Failed to send SMS code for user ${userId}:`, error);
            throw error;
        }
    }
    async verifySmsCode(userId, code, deviceInfo) {
        try {
            const cacheKey = `sms_code:${userId}`;
            const storedCode = await this.cacheManager.get(cacheKey);
            if (!storedCode) {
                return {
                    success: false,
                    method: 'sms'
                };
            }
            const verified = storedCode === code;
            if (verified) {
                await this.cacheManager.del(cacheKey);
                await this.logMfaEvent(userId, 'sms_verified', { deviceInfo });
                return {
                    success: true,
                    method: 'sms'
                };
            }
            else {
                await this.logMfaEvent(userId, 'sms_verification_failed', { deviceInfo });
                return {
                    success: false,
                    method: 'sms'
                };
            }
        }
        catch (error) {
            this.logger.error(`Failed to verify SMS code for user ${userId}:`, error);
            throw error;
        }
    }
    async verifyBackupCode(userId, code, deviceInfo) {
        try {
            const mfaSettings = await this.prisma.userMfaSettings.findUnique({
                where: { userId }
            });
            if (!mfaSettings?.backupCodes) {
                throw new common_1.BadRequestException('No backup codes available');
            }
            const backupCodes = this.decryptBackupCodes(mfaSettings.backupCodes);
            const codeIndex = backupCodes.findIndex(bc => bc.code === code && !bc.used);
            if (codeIndex === -1) {
                await this.logMfaEvent(userId, 'backup_code_verification_failed', { deviceInfo });
                return {
                    success: false,
                    method: 'recovery'
                };
            }
            backupCodes[codeIndex].used = true;
            backupCodes[codeIndex].usedAt = new Date();
            await this.prisma.userMfaSettings.update({
                where: { userId },
                data: {
                    backupCodes: this.encryptBackupCodes(backupCodes),
                    backupCodesUsed: mfaSettings.backupCodesUsed + 1
                }
            });
            await this.logMfaEvent(userId, 'backup_code_verified', {
                codeIndex,
                remainingCodes: backupCodes.filter(bc => !bc.used).length,
                deviceInfo
            });
            return {
                success: true,
                method: 'recovery'
            };
        }
        catch (error) {
            this.logger.error(`Failed to verify backup code for user ${userId}:`, error);
            throw error;
        }
    }
    async generateNewBackupCodes(userId) {
        try {
            const backupCodes = await this.generateBackupCodes();
            await this.prisma.userMfaSettings.update({
                where: { userId },
                data: {
                    backupCodes: this.encryptBackupCodes(backupCodes),
                    backupCodesUsed: 0,
                    backupCodesGenerated: true
                }
            });
            await this.logMfaEvent(userId, 'backup_codes_regenerated', {});
            return backupCodes.map(bc => bc.code);
        }
        catch (error) {
            this.logger.error(`Failed to generate backup codes for user ${userId}:`, error);
            throw error;
        }
    }
    async getMfaSettings(userId) {
        try {
            const mfaSettings = await this.prisma.userMfaSettings.findUnique({
                where: { userId }
            });
            if (!mfaSettings) {
                return {
                    userId,
                    totpEnabled: false,
                    smsEnabled: false,
                    emailEnabled: false,
                    hardwareTokenEnabled: false,
                    backupCodesGenerated: false,
                    backupCodesUsed: 0,
                    preferredMethod: 'totp',
                    emergencyContactEnabled: false
                };
            }
            return {
                userId: mfaSettings.userId,
                totpEnabled: mfaSettings.totpEnabled,
                smsEnabled: mfaSettings.smsEnabled,
                emailEnabled: mfaSettings.emailEnabled || false,
                hardwareTokenEnabled: mfaSettings.hardwareTokenEnabled || false,
                backupCodesGenerated: mfaSettings.backupCodesGenerated,
                backupCodesUsed: mfaSettings.backupCodesUsed,
                preferredMethod: mfaSettings.preferredMethod || 'totp',
                emergencyContactEnabled: mfaSettings.emergencyContactEnabled || false
            };
        }
        catch (error) {
            this.logger.error(`Failed to get MFA settings for user ${userId}:`, error);
            throw error;
        }
    }
    async disableMfaMethod(userId, method) {
        try {
            const updateData = {};
            switch (method) {
                case 'totp':
                    updateData.totpEnabled = false;
                    updateData.totpSecret = null;
                    break;
                case 'sms':
                    updateData.smsEnabled = false;
                    updateData.smsPhoneNumber = null;
                    break;
                case 'email':
                    updateData.emailEnabled = false;
                    break;
                case 'hardware':
                    updateData.hardwareTokenEnabled = false;
                    break;
            }
            await this.prisma.userMfaSettings.update({
                where: { userId },
                data: updateData
            });
            await this.logMfaEvent(userId, 'mfa_method_disabled', { method });
            this.logger.log(`${method.toUpperCase()} MFA disabled for user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to disable ${method} MFA for user ${userId}:`, error);
            throw error;
        }
    }
    async generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push({ code, used: false });
        }
        return codes;
    }
    encryptSecret(secret) {
        const key = this.configService.get('ENCRYPTION_KEY') || 'default-key-change-in-production';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
        let encrypted = cipher.update(secret, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decryptSecret(encryptedSecret) {
        const key = this.configService.get('ENCRYPTION_KEY') || 'default-key-change-in-production';
        const parts = encryptedSecret.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    encryptBackupCodes(codes) {
        return this.encryptSecret(JSON.stringify(codes));
    }
    decryptBackupCodes(encryptedCodes) {
        const decrypted = this.decryptSecret(encryptedCodes);
        return JSON.parse(decrypted);
    }
    encryptPhoneNumber(phoneNumber) {
        return this.encryptSecret(phoneNumber);
    }
    decryptPhoneNumber(encryptedPhoneNumber) {
        return this.decryptSecret(encryptedPhoneNumber);
    }
    isValidPhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
    }
    maskPhoneNumber(phoneNumber) {
        if (phoneNumber.length <= 4)
            return '****';
        return phoneNumber.substring(0, 3) + '*'.repeat(phoneNumber.length - 6) + phoneNumber.substring(phoneNumber.length - 3);
    }
    async sendVerificationSms(userId, phoneNumber) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const cacheKey = `sms_code:${userId}`;
        await this.cacheManager.set(cacheKey, code, 600);
        this.logger.debug(`SMS verification code for ${userId} (${this.maskPhoneNumber(phoneNumber)}): ${code}`);
    }
    async logMfaEvent(userId, eventType, metadata) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action: `mfa_${eventType}`,
                    resourceType: 'user_mfa',
                    resourceId: userId,
                    details: metadata,
                    ipAddress: metadata.deviceInfo?.ipAddress || 'unknown',
                    userAgent: metadata.deviceInfo?.browser || 'unknown',
                    timestamp: new Date()
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to log MFA event:', error);
        }
    }
};
exports.MfaService = MfaService;
exports.MfaService = MfaService = MfaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cache_manager_1.Cache,
        config_1.ConfigService])
], MfaService);
//# sourceMappingURL=mfa.service.js.map