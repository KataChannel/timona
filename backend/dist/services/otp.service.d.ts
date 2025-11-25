import { PrismaService } from '../prisma/prisma.service';
export declare class OtpService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateOtp(phone: string): Promise<string>;
    verifyOtp(phone: string, otp: string): Promise<boolean>;
    requestPhoneVerification(phone: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
