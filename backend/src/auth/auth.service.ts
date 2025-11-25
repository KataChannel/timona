import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SocialLoginInput } from '../graphql/inputs/user.input';

// Define interfaces for the auth service
interface GoogleUserInfo {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(emailOrUsername: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    });
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc tên người dùng không hợp lệ');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    return user;
  }

  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username,
      roleType: user.roleType 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h', // 24 hours
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 7 days
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }
      
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Token làm mới không hợp lệ');
    }
  }

  // Google token verification
  async verifyGoogleToken(token: string): Promise<any> {
    this.logger.log('=== VERIFYING GOOGLE TOKEN ===');
    this.logger.log(`Token: ${token.substring(0, 50)}...`);
    this.logger.log(`Environment GOOGLE_CLIENT_ID: ${this.configService.get('GOOGLE_CLIENT_ID')}`);
    this.logger.log(`Process.env GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID}`);
    
    try {
      // For Google Sign-In, the token is an ID token (JWT)
      // Use the tokeninfo endpoint with id_token parameter
      const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
      this.logger.log(`Making request to: ${url.substring(0, 80)}...`);
      
      const response = await firstValueFrom(
        this.httpService.get(url)
      );
      
      this.logger.log(`Google response status: ${response.status}`);
      this.logger.log(`Google response data:`, response.data);
      
      if (response.data.error) {
        this.logger.error(`Google token error: ${response.data.error}`);
        throw new UnauthorizedException('Invalid Google token');
      }

      const tokenData = response.data;
      
      // Verify the audience (your Google Client ID)
      const expectedAudience = this.configService.get('GOOGLE_CLIENT_ID');
      this.logger.log(`Expected audience: ${expectedAudience}`);
      this.logger.log(`Token audience: ${tokenData.aud}`);
      
      if (expectedAudience && tokenData.aud !== expectedAudience) {
        this.logger.error('Token audience mismatch!');
        throw new UnauthorizedException('Token audience mismatch');
      }

      // Return user info from the ID token
      const userData = {
        id: tokenData.sub,
        email: tokenData.email,
        given_name: tokenData.given_name,
        family_name: tokenData.family_name,
        picture: tokenData.picture,
        email_verified: tokenData.email_verified === 'true' || tokenData.email_verified === true,
      };
      
      this.logger.log(`Extracted user data:`, userData);
      return userData;
    } catch (error) {
      this.logger.error(`Google token verification error: ${error.response?.data || error.message}`);
      this.logger.error('Full error:', error);
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }

  // Facebook token verification
  async verifyFacebookToken(token: string): Promise<any> {
    try {
      const appId = this.configService.get('FACEBOOK_APP_ID');
      const appSecret = this.configService.get('FACEBOOK_APP_SECRET');
      
      if (!appId || !appSecret) {
        throw new UnauthorizedException('Facebook app credentials not configured');
      }

      // Verify token with Facebook
      const verifyResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`
        )
      );

      if (!verifyResponse.data.data.is_valid) {
        throw new UnauthorizedException('Invalid Facebook token');
      }

      // Get user info from Facebook
      const userInfoResponse = await firstValueFrom(
        this.httpService.get(
          `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`
        )
      );

      return {
        id: userInfoResponse.data.id,
        email: userInfoResponse.data.email,
        firstName: userInfoResponse.data.first_name,
        lastName: userInfoResponse.data.last_name,
        avatar: userInfoResponse.data.picture?.data?.url,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Facebook token');
    }
  }

  async loginWithGoogle(input: SocialLoginInput): Promise<AuthPayload> {
    this.logger.log(`Starting Google login for token: ${input.token.substring(0, 20)}...`);
    this.logger.log(`Environment GOOGLE_CLIENT_ID exists: ${!!process.env.GOOGLE_CLIENT_ID}`);
    
    try {
      this.logger.log(`Calling verifyGoogleToken...`);
      const userInfo = await this.verifyGoogleToken(input.token);
      this.logger.log(`Google token verified for user: ${userInfo.email}`);
      
      let user = await this.prisma.user.findUnique({
        where: { email: userInfo.email },
        include: { authMethods: true }
      });
      
      if (user) {
        this.logger.log(`Existing user found: ${user.id}`);
        
        // Check if Google auth method exists
        const existingGoogleAuth = user.authMethods.find(
          auth => auth.provider === 'GOOGLE'
        );
        
        if (!existingGoogleAuth) {
          // Link Google account to existing user
          await this.prisma.authMethod.create({
            data: {
              userId: user.id,
              provider: 'GOOGLE',
              providerId: userInfo.id,
              isVerified: true
            }
          });
          this.logger.log(`Google auth method linked to existing user: ${user.id}`);
        }
      } else {
        this.logger.log(`Creating new user for: ${userInfo.email}`);
        
        // Create new user with Google auth
        user = await this.prisma.user.create({
          data: {
            email: userInfo.email,
            username: userInfo.email, // Use email as username for now
            firstName: userInfo.given_name || '',
            lastName: userInfo.family_name || '',
            avatar: userInfo.picture,
            isVerified: userInfo.email_verified || false,
            authMethods: {
              create: {
                provider: 'GOOGLE',
                providerId: userInfo.id,
                isVerified: true
              }
            }
          },
          include: { authMethods: true }
        });
        this.logger.log(`New user created: ${user.id}`);
      }
      
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      
      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          resourceType: 'user',
          resourceId: user.id,
          details: `Google login for ${user.email}`,
          ipAddress: null,
          userAgent: null
        }
      });
      
      const tokens = await this.generateTokens(user);
      
      this.logger.log(`Google login successful for user: ${user.id}`);
      
      return {
        user: user as any,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      this.logger.error(`Google login failed: ${error.message}`, error.stack);
      this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      throw new BadRequestException(`Invalid Google token: ${error.message}`);
    }
  }

  async loginWithFacebook(token: string, providerId?: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Verify Facebook token and get user info
    const facebookUser = await this.verifyFacebookToken(token);
    const facebookId = providerId || facebookUser.id;
    
    // 1. Kiểm tra Facebook ID hoặc email với hệ thống
    let user = null;
    
    // Tìm user theo Facebook ID trong AuthMethod
    const existingAuthMethod = await this.prisma.authMethod.findFirst({
      where: {
        provider: AuthProvider.FACEBOOK,
        providerId: facebookId,
      },
      include: {
        user: true,
      },
    });

    if (existingAuthMethod) {
      user = existingAuthMethod.user;
    } else if (facebookUser.email) {
      // Tìm user theo email
      user = await this.prisma.user.findUnique({
        where: { email: facebookUser.email },
        include: {
          authMethods: true,
        },
      });

      if (user) {
        // 2. Nếu tồn tại thì cập nhật liên kết Facebook ID
        await this.prisma.authMethod.create({
          data: {
            userId: user.id,
            provider: AuthProvider.FACEBOOK,
            providerId: facebookId,
            isVerified: true,
          },
        });
      }
    }

    if (!user && facebookUser.email) {
      // 3. Nếu chưa tồn tại thì tạo mới thông tin
      const username = facebookUser.email.split('@')[0] + '_' + Math.random().toString(36).substring(7);
      
      user = await this.prisma.user.create({
        data: {
          email: facebookUser.email,
          username,
          firstName: facebookUser.firstName,
          lastName: facebookUser.lastName,
          avatar: facebookUser.avatar,
          isActive: true,
          isVerified: true,
          authMethods: {
            create: {
              provider: AuthProvider.FACEBOOK,
              providerId: facebookId,
              isVerified: true,
            },
          },
        },
        include: {
          authMethods: true,
        },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Unable to authenticate with Facebook');
    }

    // Cập nhật last login và reset failed attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'FACEBOOK_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        details: {
          facebookId,
          email: facebookUser.email,
        },
      },
    });

    const tokens = await this.generateTokens(user);
    
    return {
      user,
      ...tokens,
    };
  }

  async loginWithPhone(phone: string, profile?: any): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // 1. Kiểm tra phone với hệ thống
    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        authMethods: true,
      },
    });

    if (user) {
      // 2. Nếu tồn tại, kiểm tra xem đã có AuthMethod PHONE chưa
      const phoneAuthMethod = user.authMethods.find(method => method.provider === AuthProvider.PHONE);
      
      if (!phoneAuthMethod) {
        // Tạo AuthMethod cho PHONE nếu chưa có
        await this.prisma.authMethod.create({
          data: {
            userId: user.id,
            provider: AuthProvider.PHONE,
            providerId: phone,
            isVerified: true,
          },
        });
      }
    } else {
      // 3. Nếu chưa tồn tại thì tạo mới thông tin
      user = await this.prisma.user.create({
        data: {
          phone,
          username: 'user_' + phone.slice(-6) + '_' + Math.random().toString(36).substring(7),
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          avatar: profile?.avatar,
          isActive: true,
          isVerified: true,
          authMethods: {
            create: {
              provider: AuthProvider.PHONE,
              providerId: phone,
              isVerified: true,
            },
          },
        },
        include: {
          authMethods: true,
        },
      });
    }

    // Cập nhật last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);
    
    return {
      user,
      ...tokens,
    };
  }

  /**
   * Cập nhật thông tin hồ sơ người dùng
   * - Cập nhật firstName, lastName, avatar, số điện thoại
   */
  async updateProfile(
    userId: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      phone?: string;
    },
  ): Promise<User> {
    // Kiểm tra người dùng tồn tại
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Kiểm tra số điện thoại không trùng
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phone: updateData.phone },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Số điện thoại đã được sử dụng');
      }
    }

    // Cập nhật thông tin
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateData.firstName ?? user.firstName,
        lastName: updateData.lastName ?? user.lastName,
        avatar: updateData.avatar ?? user.avatar,
        phone: updateData.phone ?? user.phone,
      },
    });

    // Tạo audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_PROFILE',
        resourceType: 'user',
        resourceId: userId,
        details: {
          updatedFields: Object.keys(updateData),
        },
      },
    });

    this.logger.log(`✅ Cập nhật hồ sơ người dùng ${userId}`);

    return updatedUser;
  }

  /**
   * Thay đổi mật khẩu cho người dùng đã xác thực
   * - Yêu cầu mật khẩu hiện tại
   * - Thay mật khẩu thành mật khẩu mới
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    // Kiểm tra người dùng tồn tại
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Kiểm tra có mật khẩu không (trường hợp login bằng social)
    if (!user.password) {
      throw new BadRequestException('Tài khoản này không có mật khẩu. Vui lòng tạo mật khẩu trước.');
    }

    // Xác thực mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    // Kiểm tra mật khẩu mới khác mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Tạo audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'CHANGE_PASSWORD',
        resourceType: 'user',
        resourceId: userId,
        details: {
          timestamp: new Date(),
        },
      },
    });

    this.logger.log(`✅ Người dùng ${userId} đã thay đổi mật khẩu`);

    return {
      success: true,
      message: 'Mật khẩu đã được cập nhật thành công',
    };
  }

  /**
   * Tạo mật khẩu cho người dùng login qua mạng xã hội
   * - Chỉ sử dụng khi người dùng chưa có mật khẩu
   */
  async setPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Kiểm tra người dùng tồn tại
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Kiểm tra đã có mật khẩu chưa
    if (user.password) {
      throw new BadRequestException('Tài khoản này đã có mật khẩu. Vui lòng sử dụng chức năng thay đổi mật khẩu.');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Lưu mật khẩu
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Tạo audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'SET_PASSWORD',
        resourceType: 'user',
        resourceId: userId,
        details: {
          timestamp: new Date(),
          source: 'social_login',
        },
      },
    });

    this.logger.log(`✅ Người dùng ${userId} đã tạo mật khẩu`);

    return {
      success: true,
      message: 'Mật khẩu đã được tạo thành công',
    };
  }

  /**
   * Kiểm tra người dùng có mật khẩu không
   */
  async hasPassword(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    return !!user?.password;
  }

  /**
   * Generate mật khẩu ngẫu nhiên
   * - Độ dài 12 ký tự
   * - Bao gồm chữ hoa, thường, số, ký tự đặc biệt
   */
  private generateRandomPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    let password = '';
    
    // Đảm bảo có ít nhất 1 ký tự từ mỗi loại
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    // Điền phần còn lại
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Xáo trộn mật khẩu
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Admin reset password cho người dùng
   * - Tạo mật khẩu ngẫu nhiên
   * - Cập nhật mật khẩu trong DB
   * - Tạo audit log
   */
  async adminResetPassword(
    userId: string,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    newPassword: string;
    user: User;
  }> {
    // Kiểm tra người dùng tồn tại
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Tạo mật khẩu ngẫu nhiên
    const newPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Tạo audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_RESET_PASSWORD',
        resourceType: 'user',
        resourceId: userId,
        details: {
          targetUserId: userId,
          timestamp: new Date(),
          adminId: adminId,
        },
      },
    });

    this.logger.log(`✅ Admin ${adminId} reset password cho user ${userId}`);

    return {
      success: true,
      message: 'Mật khẩu đã được reset thành công. Mật khẩu mới đã được gửi cho người dùng.',
      newPassword,
      user: updatedUser,
    };
  }

  /**
   * Request forgot password - Tạo token reset mật khẩu
   * - Tạo token ngẫu nhiên 6 chữ số
   * - Lưu vào VerificationToken với type RESET_PASSWORD
   * - Token có hiệu lực 15 phút
   */
  async requestForgotPassword(email: string): Promise<{
    success: boolean;
    message: string;
    token?: string; // Only for development/testing
  }> {
    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Không tiết lộ email có tồn tại hay không (security best practice)
      return {
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã xác thực.',
      };
    }

    // Tạo mã OTP 6 chữ số
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Xóa các token cũ chưa sử dụng
    await this.prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET',
        isUsed: false,
      },
    });

    // Tạo token mới - expires sau 15 phút
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    this.logger.log(`🔑 Forgot password token created for user: ${user.email}`);

    // TODO: Send email with reset token
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      success: true,
      message: 'Mã xác thực đã được gửi đến email của bạn.',
      ...(process.env.NODE_ENV === 'development' && { token: resetToken }), // Only in dev
    };
  }

  /**
   * Verify forgot password token
   * - Kiểm tra token có hợp lệ không
   * - Token chưa được sử dụng
   * - Token chưa hết hạn
   */
  async verifyResetToken(email: string, token: string): Promise<{
    success: boolean;
    message: string;
    userId?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        token,
        type: 'PASSWORD_RESET',
        isUsed: false,
      },
    });

    if (!verificationToken) {
      throw new BadRequestException('Mã xác thực không hợp lệ');
    }

    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Mã xác thực đã hết hạn');
    }

    return {
      success: true,
      message: 'Mã xác thực hợp lệ',
      userId: user.id,
    };
  }

  /**
   * Reset password with token
   * - Verify token
   * - Update password
   * - Mark token as used
   */
  async resetPasswordWithToken(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // Verify token
    const verification = await this.verifyResetToken(email, token);

    if (!verification.success) {
      throw new BadRequestException('Mã xác thực không hợp lệ');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: {
        password: hashedPassword,
      },
    });

    // Mark token as used
    await this.prisma.verificationToken.updateMany({
      where: {
        userId: verification.userId,
        token,
        type: 'PASSWORD_RESET',
      },
      data: {
        isUsed: true,
      },
    });

    this.logger.log(`✅ Password reset successfully for user: ${email}`);

    return {
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công',
    };
  }
}
