import { PrismaService } from '../../prisma/prisma.service';
import { Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
export interface TotpSetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
    manualEntryKey: string;
}
export interface MfaVerificationResult {
    success: boolean;
    method: 'totp' | 'sms' | 'email' | 'hardware' | 'recovery';
    remainingAttempts?: number;
    nextAvailableAttempt?: Date;
}
export interface DeviceInfo {
    id: string;
    userId: string;
    deviceName: string;
    deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    browser: string;
    os: string;
    ipAddress: string;
    location?: string;
    isTrusted: boolean;
    lastUsed: Date;
    createdAt: Date;
}
export interface MfaSettings {
    userId: string;
    totpEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    hardwareTokenEnabled: boolean;
    backupCodesGenerated: boolean;
    backupCodesUsed: number;
    preferredMethod: 'totp' | 'sms' | 'email' | 'hardware';
    emergencyContactEnabled: boolean;
}
export declare class MfaService {
    private readonly prisma;
    private readonly cacheManager;
    private readonly configService;
    private readonly logger;
    private readonly MAX_ATTEMPTS;
    private readonly LOCKOUT_DURATION;
    private readonly BACKUP_CODES_COUNT;
    constructor(prisma: PrismaService, cacheManager: Cache, configService: ConfigService);
    setupTotp(userId: string, deviceInfo?: DeviceInfo): Promise<TotpSetup>;
    verifyAndEnableTotp(userId: string, token: string, deviceInfo?: DeviceInfo): Promise<boolean>;
    verifyTotp(userId: string, token: string, deviceInfo?: DeviceInfo): Promise<MfaVerificationResult>;
    setupSms(userId: string, phoneNumber: string, deviceInfo?: DeviceInfo): Promise<void>;
    sendSmsCode(userId: string, deviceInfo?: DeviceInfo): Promise<void>;
    verifySmsCode(userId: string, code: string, deviceInfo?: DeviceInfo): Promise<MfaVerificationResult>;
    verifyBackupCode(userId: string, code: string, deviceInfo?: DeviceInfo): Promise<MfaVerificationResult>;
    generateNewBackupCodes(userId: string): Promise<string[]>;
    getMfaSettings(userId: string): Promise<MfaSettings>;
    disableMfaMethod(userId: string, method: 'totp' | 'sms' | 'email' | 'hardware'): Promise<void>;
    private generateBackupCodes;
    private encryptSecret;
    private decryptSecret;
    private encryptBackupCodes;
    private decryptBackupCodes;
    private encryptPhoneNumber;
    private decryptPhoneNumber;
    private isValidPhoneNumber;
    private maskPhoneNumber;
    private sendVerificationSms;
    private logMfaEvent;
}
