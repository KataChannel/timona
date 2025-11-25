import { MfaService, TotpSetup, MfaVerificationResult, MfaSettings } from '../services/mfa.service';
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
export declare class SecurityController {
    private readonly mfaService;
    constructor(mfaService: MfaService);
    setupTotp(req: any, setupDto: SetupTotpDto): Promise<{
        success: boolean;
        data?: TotpSetup;
        message: string;
    }>;
    verifyTotpSetup(req: any, verifyDto: VerifyTotpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyTotp(req: any, verifyDto: VerifyTotpDto): Promise<{
        success: boolean;
        data?: MfaVerificationResult;
        message: string;
    }>;
    setupSms(req: any, setupDto: SetupSmsDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendSmsCode(req: any, body: {
        deviceInfo?: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    verifySmsCode(req: any, verifyDto: VerifySmsDto): Promise<{
        success: boolean;
        data?: MfaVerificationResult;
        message: string;
    }>;
    verifyBackupCode(req: any, verifyDto: VerifyBackupCodeDto): Promise<{
        success: boolean;
        data?: MfaVerificationResult;
        message: string;
    }>;
    regenerateBackupCodes(req: any): Promise<{
        success: boolean;
        data?: string[];
        message: string;
    }>;
    getMfaSettings(req: any): Promise<{
        success: boolean;
        data?: MfaSettings;
        message: string;
    }>;
    disableMfaMethod(req: any, method: 'totp' | 'sms' | 'email' | 'hardware'): Promise<{
        success: boolean;
        message: string;
    }>;
    getSecurityDashboard(req: any): Promise<{
        success: boolean;
        data?: any;
        message: string;
    }>;
}
