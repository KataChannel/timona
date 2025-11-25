import { Injectable, Logger, BadRequestException, UnauthorizedException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
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

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly BACKUP_CODES_COUNT = 10;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService
  ) {}

  /**
   * Setup TOTP (Time-based One-Time Password) for a user
   */
  async setupTotp(userId: string, deviceInfo?: DeviceInfo): Promise<TotpSetup> {
    try {
      // Check if user already has TOTP enabled
      const existingMfa = await this.prisma.userMfaSettings.findUnique({
        where: { userId }
      });

      if (existingMfa?.totpEnabled) {
        throw new BadRequestException('TOTP is already enabled for this user');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `rausachcore (${userId})`,
        issuer: 'rausachcore Enterprise',
        length: 32
      });

      // Generate backup codes
      const backupCodes = await this.generateBackupCodes();

      // Store encrypted secret and backup codes
      await this.prisma.userMfaSettings.upsert({
        where: { userId },
        create: {
          userId,
          totpSecret: this.encryptSecret(secret.base32),
          backupCodes: this.encryptBackupCodes(backupCodes),
          totpEnabled: false, // Will be enabled after verification
          backupCodesGenerated: true
        },
        update: {
          totpSecret: this.encryptSecret(secret.base32),
          backupCodes: this.encryptBackupCodes(backupCodes),
          backupCodesGenerated: true
        }
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      // Log setup attempt
      await this.logMfaEvent(userId, 'totp_setup_initiated', { deviceInfo });

      this.logger.log(`TOTP setup initiated for user ${userId}`);

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes: backupCodes.map(bc => bc.code),
        manualEntryKey: secret.base32
      };
    } catch (error) {
      this.logger.error(`Failed to setup TOTP for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify TOTP token and enable MFA
   */
  async verifyAndEnableTotp(userId: string, token: string, deviceInfo?: DeviceInfo): Promise<boolean> {
    try {
      const mfaSettings = await this.prisma.userMfaSettings.findUnique({
        where: { userId }
      });

      if (!mfaSettings?.totpSecret) {
        throw new BadRequestException('TOTP not set up for this user');
      }

      if (mfaSettings.totpEnabled) {
        throw new BadRequestException('TOTP is already enabled');
      }

      // Verify token
      const secret = this.decryptSecret(mfaSettings.totpSecret);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time steps tolerance
      });

      if (!verified) {
        await this.logMfaEvent(userId, 'totp_verification_failed', { token: '***', deviceInfo });
        throw new UnauthorizedException('Invalid TOTP token');
      }

      // Enable TOTP
      await this.prisma.userMfaSettings.update({
        where: { userId },
        data: {
          totpEnabled: true,
          preferredMethod: 'totp',
          enabledAt: new Date()
        }
      });

      // Log successful setup
      await this.logMfaEvent(userId, 'totp_enabled', { deviceInfo });

      this.logger.log(`TOTP successfully enabled for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify and enable TOTP for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify TOTP token for authentication
   */
  async verifyTotp(userId: string, token: string, deviceInfo?: DeviceInfo): Promise<MfaVerificationResult> {
    try {
      // Check rate limiting
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

      // Get current attempts
      const attempts = (await this.cacheManager.get<number>(attemptsKey)) || 0;
      if (attempts >= this.MAX_ATTEMPTS) {
        await this.cacheManager.set(lockoutKey, true, this.LOCKOUT_DURATION / 1000);
        await this.logMfaEvent(userId, 'mfa_lockout', { attempts, deviceInfo });
        return {
          success: false,
          method: 'totp',
          nextAvailableAttempt: new Date(Date.now() + this.LOCKOUT_DURATION)
        };
      }

      // Get MFA settings
      const mfaSettings = await this.prisma.userMfaSettings.findUnique({
        where: { userId }
      });

      if (!mfaSettings?.totpEnabled || !mfaSettings.totpSecret) {
        throw new BadRequestException('TOTP not enabled for this user');
      }

      // Verify token
      const secret = this.decryptSecret(mfaSettings.totpSecret);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (verified) {
        // Clear attempts on success
        await this.cacheManager.del(attemptsKey);
        await this.logMfaEvent(userId, 'totp_verified', { deviceInfo });
        
        return {
          success: true,
          method: 'totp'
        };
      } else {
        // Increment attempts
        await this.cacheManager.set(attemptsKey, attempts + 1, 3600); // 1 hour expiry
        await this.logMfaEvent(userId, 'totp_verification_failed', { attempts: attempts + 1, deviceInfo });
        
        return {
          success: false,
          method: 'totp',
          remainingAttempts: this.MAX_ATTEMPTS - attempts - 1
        };
      }
    } catch (error) {
      this.logger.error(`Failed to verify TOTP for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Setup SMS MFA
   */
  async setupSms(userId: string, phoneNumber: string, deviceInfo?: DeviceInfo): Promise<void> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new BadRequestException('Invalid phone number format');
      }

      // Store encrypted phone number
      await this.prisma.userMfaSettings.upsert({
        where: { userId },
        create: {
          userId,
          smsPhoneNumber: this.encryptPhoneNumber(phoneNumber),
          smsEnabled: false // Will be enabled after verification
        },
        update: {
          smsPhoneNumber: this.encryptPhoneNumber(phoneNumber)
        }
      });

      // Send verification SMS
      await this.sendVerificationSms(userId, phoneNumber);

      await this.logMfaEvent(userId, 'sms_setup_initiated', { phoneNumber: this.maskPhoneNumber(phoneNumber), deviceInfo });
      this.logger.log(`SMS MFA setup initiated for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to setup SMS MFA for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Send SMS verification code
   */
  async sendSmsCode(userId: string, deviceInfo?: DeviceInfo): Promise<void> {
    try {
      const mfaSettings = await this.prisma.userMfaSettings.findUnique({
        where: { userId }
      });

      if (!mfaSettings?.smsEnabled || !mfaSettings.smsPhoneNumber) {
        throw new BadRequestException('SMS MFA not enabled for this user');
      }

      const phoneNumber = this.decryptPhoneNumber(mfaSettings.smsPhoneNumber);
      await this.sendVerificationSms(userId, phoneNumber);

      await this.logMfaEvent(userId, 'sms_code_sent', { phoneNumber: this.maskPhoneNumber(phoneNumber), deviceInfo });
    } catch (error) {
      this.logger.error(`Failed to send SMS code for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify SMS code
   */
  async verifySmsCode(userId: string, code: string, deviceInfo?: DeviceInfo): Promise<MfaVerificationResult> {
    try {
      const cacheKey = `sms_code:${userId}`;
      const storedCode = await this.cacheManager.get<string>(cacheKey);

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
      } else {
        await this.logMfaEvent(userId, 'sms_verification_failed', { deviceInfo });
        
        return {
          success: false,
          method: 'sms'
        };
      }
    } catch (error) {
      this.logger.error(`Failed to verify SMS code for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string, deviceInfo?: DeviceInfo): Promise<MfaVerificationResult> {
    try {
      const mfaSettings = await this.prisma.userMfaSettings.findUnique({
        where: { userId }
      });

      if (!mfaSettings?.backupCodes) {
        throw new BadRequestException('No backup codes available');
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

      // Mark code as used
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
    } catch (error) {
      this.logger.error(`Failed to verify backup code for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(userId: string): Promise<string[]> {
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
    } catch (error) {
      this.logger.error(`Failed to generate backup codes for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get MFA settings for user
   */
  async getMfaSettings(userId: string): Promise<MfaSettings> {
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
        preferredMethod: mfaSettings.preferredMethod as any || 'totp',
        emergencyContactEnabled: mfaSettings.emergencyContactEnabled || false
      };
    } catch (error) {
      this.logger.error(`Failed to get MFA settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Disable MFA method
   */
  async disableMfaMethod(userId: string, method: 'totp' | 'sms' | 'email' | 'hardware'): Promise<void> {
    try {
      const updateData: any = {};
      
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
    } catch (error) {
      this.logger.error(`Failed to disable ${method} MFA for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private async generateBackupCodes(): Promise<Array<{ code: string; used: boolean; usedAt?: Date }>> {
    const codes = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push({ code, used: false });
    }
    return codes;
  }

  private encryptSecret(secret: string): string {
    const key = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-in-production';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptSecret(encryptedSecret: string): string {
    const key = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-in-production';
    const parts = encryptedSecret.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private encryptBackupCodes(codes: Array<{ code: string; used: boolean; usedAt?: Date }>): string {
    return this.encryptSecret(JSON.stringify(codes));
  }

  private decryptBackupCodes(encryptedCodes: string): Array<{ code: string; used: boolean; usedAt?: Date }> {
    const decrypted = this.decryptSecret(encryptedCodes);
    return JSON.parse(decrypted);
  }

  private encryptPhoneNumber(phoneNumber: string): string {
    return this.encryptSecret(phoneNumber);
  }

  private decryptPhoneNumber(encryptedPhoneNumber: string): string {
    return this.decryptSecret(encryptedPhoneNumber);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - enhance as needed
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) return '****';
    return phoneNumber.substring(0, 3) + '*'.repeat(phoneNumber.length - 6) + phoneNumber.substring(phoneNumber.length - 3);
  }

  private async sendVerificationSms(userId: string, phoneNumber: string): Promise<void> {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in cache with 10-minute expiry
    const cacheKey = `sms_code:${userId}`;
    await this.cacheManager.set(cacheKey, code, 600);

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, log the code for development
    this.logger.debug(`SMS verification code for ${userId} (${this.maskPhoneNumber(phoneNumber)}): ${code}`);
    
    // In production, replace with actual SMS sending logic:
    // await this.smsService.sendMessage(phoneNumber, `Your rausachcore verification code is: ${code}`);
  }

  private async logMfaEvent(userId: string, eventType: string, metadata: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to log MFA event:', error);
      // Don't throw here to avoid breaking MFA flow
    }
  }
}