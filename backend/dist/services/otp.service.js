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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OtpService = class OtpService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateOtp(phone) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        let user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    phone,
                    username: 'temp_' + phone.slice(-6) + '_' + Math.random().toString(36).substring(7),
                    isActive: false,
                    isVerified: false,
                },
            });
        }
        await this.prisma.verificationToken.deleteMany({
            where: {
                userId: user.id,
                type: client_1.TokenType.PHONE_VERIFICATION,
                isUsed: false,
            },
        });
        await this.prisma.verificationToken.create({
            data: {
                userId: user.id,
                token: otp,
                type: client_1.TokenType.PHONE_VERIFICATION,
                expiresAt,
                isUsed: false,
            },
        });
        console.log(`OTP for ${phone}: ${otp}`);
        return otp;
    }
    async verifyOtp(phone, otp) {
        const user = await this.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            return false;
        }
        const verificationToken = await this.prisma.verificationToken.findFirst({
            where: {
                userId: user.id,
                token: otp,
                type: client_1.TokenType.PHONE_VERIFICATION,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!verificationToken) {
            return false;
        }
        await this.prisma.verificationToken.update({
            where: { id: verificationToken.id },
            data: { isUsed: true },
        });
        if (!user.isActive) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    isActive: true,
                    isVerified: true,
                },
            });
        }
        return true;
    }
    async requestPhoneVerification(phone) {
        try {
            await this.generateOtp(phone);
            return {
                success: true,
                message: 'OTP đã được gửi đến số điện thoại của bạn',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Có lỗi xảy ra khi gửi OTP',
            };
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OtpService);
//# sourceMappingURL=otp.service.js.map