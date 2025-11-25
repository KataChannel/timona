import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenType } from '@prisma/client';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async generateOtp(phone: string): Promise<string> {
    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Lưu OTP vào database với thời gian hết hạn 5 phút
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Tìm user theo phone number (có thể chưa tồn tại)
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    // Nếu user chưa tồn tại, tạo user tạm thời
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          username: 'temp_' + phone.slice(-6) + '_' + Math.random().toString(36).substring(7),
          isActive: false, // Chưa active cho đến khi verify OTP
          isVerified: false,
        },
      });
    }

    // Xóa các OTP cũ chưa sử dụng
    await this.prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: TokenType.PHONE_VERIFICATION,
        isUsed: false,
      },
    });

    // Tạo OTP mới
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: otp,
        type: TokenType.PHONE_VERIFICATION,
        expiresAt,
        isUsed: false,
      },
    });

    // TODO: Gửi SMS OTP đến số điện thoại
    console.log(`OTP for ${phone}: ${otp}`); // Debug only, remove in production

    return otp;
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
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
        type: TokenType.PHONE_VERIFICATION,
        isUsed: false,
        expiresAt: {
          gt: new Date(), // Chưa hết hạn
        },
      },
    });

    if (!verificationToken) {
      return false;
    }

    // Đánh dấu OTP đã sử dụng
    await this.prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { isUsed: true },
    });

    // Kích hoạt user nếu chưa active
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

  async requestPhoneVerification(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.generateOtp(phone);
      return {
        success: true,
        message: 'OTP đã được gửi đến số điện thoại của bạn',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Có lỗi xảy ra khi gửi OTP',
      };
    }
  }
}
