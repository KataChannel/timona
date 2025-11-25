import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MfaService, TotpSetup, MfaVerificationResult, MfaSettings } from '../services/mfa.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // TODO: Implement JWT auth guard

export interface SetupTotpDto {
  deviceInfo?: {
    deviceName: string;
    deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
    browser: string;
    os: string;
    ipAddress: string;
    location?: string;
  };
}

export interface VerifyTotpDto {
  token: string;
  deviceInfo?: any;
}

export interface SetupSmsDto {
  phoneNumber: string;
  deviceInfo?: any;
}

export interface VerifySmsDto {
  code: string;
  deviceInfo?: any;
}

export interface VerifyBackupCodeDto {
  code: string;
  deviceInfo?: any;
}

@Controller('security')
// @UseGuards(JwtAuthGuard) // TODO: Enable JWT auth guard when implemented
export class SecurityController {
  constructor(private readonly mfaService: MfaService) {}

  /**
   * Setup TOTP MFA for the authenticated user
   */
  @Post('mfa/totp/setup')
  async setupTotp(@Request() req: any, @Body() setupDto: SetupTotpDto): Promise<{
    success: boolean;
    data?: TotpSetup;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const totpSetup = await this.mfaService.setupTotp(userId, setupDto.deviceInfo as any);
      
      return {
        success: true,
        data: totpSetup,
        message: 'TOTP setup initiated successfully. Please scan the QR code and verify with a token.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to setup TOTP'
      };
    }
  }

  /**
   * Verify TOTP token and enable MFA
   */
  @Post('mfa/totp/verify-setup')
  async verifyTotpSetup(@Request() req: any, @Body() verifyDto: VerifyTotpDto): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const success = await this.mfaService.verifyAndEnableTotp(userId, verifyDto.token, verifyDto.deviceInfo);
      
      return {
        success,
        message: success ? 'TOTP MFA enabled successfully' : 'Invalid TOTP token'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify TOTP token'
      };
    }
  }

  /**
   * Verify TOTP token for authentication
   */
  @Post('mfa/totp/verify')
  async verifyTotp(@Request() req: any, @Body() verifyDto: VerifyTotpDto): Promise<{
    success: boolean;
    data?: MfaVerificationResult;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const result = await this.mfaService.verifyTotp(userId, verifyDto.token, verifyDto.deviceInfo);
      
      return {
        success: result.success,
        data: result,
        message: result.success ? 'TOTP verified successfully' : 'Invalid TOTP token'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify TOTP token'
      };
    }
  }

  /**
   * Setup SMS MFA
   */
  @Post('mfa/sms/setup')
  async setupSms(@Request() req: any, @Body() setupDto: SetupSmsDto): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      await this.mfaService.setupSms(userId, setupDto.phoneNumber, setupDto.deviceInfo);
      
      return {
        success: true,
        message: 'SMS MFA setup initiated. Please verify with the code sent to your phone.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to setup SMS MFA'
      };
    }
  }

  /**
   * Send SMS verification code
   */
  @Post('mfa/sms/send-code')
  async sendSmsCode(@Request() req: any, @Body() body: { deviceInfo?: any }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      await this.mfaService.sendSmsCode(userId, body.deviceInfo);
      
      return {
        success: true,
        message: 'SMS verification code sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send SMS code'
      };
    }
  }

  /**
   * Verify SMS code
   */
  @Post('mfa/sms/verify')
  async verifySmsCode(@Request() req: any, @Body() verifyDto: VerifySmsDto): Promise<{
    success: boolean;
    data?: MfaVerificationResult;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const result = await this.mfaService.verifySmsCode(userId, verifyDto.code, verifyDto.deviceInfo);
      
      return {
        success: result.success,
        data: result,
        message: result.success ? 'SMS code verified successfully' : 'Invalid SMS code'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify SMS code'
      };
    }
  }

  /**
   * Verify backup code
   */
  @Post('mfa/backup-code/verify')
  async verifyBackupCode(@Request() req: any, @Body() verifyDto: VerifyBackupCodeDto): Promise<{
    success: boolean;
    data?: MfaVerificationResult;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const result = await this.mfaService.verifyBackupCode(userId, verifyDto.code, verifyDto.deviceInfo);
      
      return {
        success: result.success,
        data: result,
        message: result.success ? 'Backup code verified successfully' : 'Invalid backup code'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify backup code'
      };
    }
  }

  /**
   * Generate new backup codes
   */
  @Post('mfa/backup-codes/regenerate')
  async regenerateBackupCodes(@Request() req: any): Promise<{
    success: boolean;
    data?: string[];
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const backupCodes = await this.mfaService.generateNewBackupCodes(userId);
      
      return {
        success: true,
        data: backupCodes,
        message: 'New backup codes generated successfully. Please store them securely.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to generate backup codes'
      };
    }
  }

  /**
   * Get MFA settings for the authenticated user
   */
  @Get('mfa/settings')
  async getMfaSettings(@Request() req: any): Promise<{
    success: boolean;
    data?: MfaSettings;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const settings = await this.mfaService.getMfaSettings(userId);
      
      return {
        success: true,
        data: settings,
        message: 'MFA settings retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve MFA settings'
      };
    }
  }

  /**
   * Disable MFA method
   */
  @Delete('mfa/:method')
  async disableMfaMethod(
    @Request() req: any,
    @Param('method') method: 'totp' | 'sms' | 'email' | 'hardware'
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      await this.mfaService.disableMfaMethod(userId, method);
      
      return {
        success: true,
        message: `${method.toUpperCase()} MFA disabled successfully`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || `Failed to disable ${method} MFA`
      };
    }
  }

  /**
   * Get security dashboard data
   */
  @Get('dashboard')
  async getSecurityDashboard(@Request() req: any): Promise<{
    success: boolean;
    data?: any;
    message: string;
  }> {
    try {
      const userId = req.user.id;
      const mfaSettings = await this.mfaService.getMfaSettings(userId);
      
      // Mock security dashboard data - enhance with real data
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
          lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          securityScore: 85
        }
      };
      
      return {
        success: true,
        data: dashboardData,
        message: 'Security dashboard data retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to retrieve security dashboard data'
      };
    }
  }
}