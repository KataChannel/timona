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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, httpService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(emailOrUsername, password) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername },
                ],
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email hoặc tên người dùng không hợp lệ');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email hoặc mật khẩu không hợp lệ');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Tài khoản đã bị khóa');
        }
        return user;
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            roleType: user.roleType
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '24h',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Người dùng không tồn tại');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token làm mới không hợp lệ');
        }
    }
    async verifyGoogleToken(token) {
        this.logger.log('=== VERIFYING GOOGLE TOKEN ===');
        this.logger.log(`Token: ${token.substring(0, 50)}...`);
        this.logger.log(`Environment GOOGLE_CLIENT_ID: ${this.configService.get('GOOGLE_CLIENT_ID')}`);
        this.logger.log(`Process.env GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID}`);
        try {
            const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`;
            this.logger.log(`Making request to: ${url.substring(0, 80)}...`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            this.logger.log(`Google response status: ${response.status}`);
            this.logger.log(`Google response data:`, response.data);
            if (response.data.error) {
                this.logger.error(`Google token error: ${response.data.error}`);
                throw new common_1.UnauthorizedException('Invalid Google token');
            }
            const tokenData = response.data;
            const expectedAudience = this.configService.get('GOOGLE_CLIENT_ID');
            this.logger.log(`Expected audience: ${expectedAudience}`);
            this.logger.log(`Token audience: ${tokenData.aud}`);
            if (expectedAudience && tokenData.aud !== expectedAudience) {
                this.logger.error('Token audience mismatch!');
                throw new common_1.UnauthorizedException('Token audience mismatch');
            }
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
        }
        catch (error) {
            this.logger.error(`Google token verification error: ${error.response?.data || error.message}`);
            this.logger.error('Full error:', error);
            throw new common_1.UnauthorizedException('Failed to verify Google token');
        }
    }
    async verifyFacebookToken(token) {
        try {
            const appId = this.configService.get('FACEBOOK_APP_ID');
            const appSecret = this.configService.get('FACEBOOK_APP_SECRET');
            if (!appId || !appSecret) {
                throw new common_1.UnauthorizedException('Facebook app credentials not configured');
            }
            const verifyResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`));
            if (!verifyResponse.data.data.is_valid) {
                throw new common_1.UnauthorizedException('Invalid Facebook token');
            }
            const userInfoResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`));
            return {
                id: userInfoResponse.data.id,
                email: userInfoResponse.data.email,
                firstName: userInfoResponse.data.first_name,
                lastName: userInfoResponse.data.last_name,
                avatar: userInfoResponse.data.picture?.data?.url,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Failed to verify Facebook token');
        }
    }
    async loginWithGoogle(input) {
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
                const existingGoogleAuth = user.authMethods.find(auth => auth.provider === 'GOOGLE');
                if (!existingGoogleAuth) {
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
            }
            else {
                this.logger.log(`Creating new user for: ${userInfo.email}`);
                user = await this.prisma.user.create({
                    data: {
                        email: userInfo.email,
                        username: userInfo.email,
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
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() }
            });
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
                user: user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            };
        }
        catch (error) {
            this.logger.error(`Google login failed: ${error.message}`, error.stack);
            this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
            throw new common_1.BadRequestException(`Invalid Google token: ${error.message}`);
        }
    }
    async loginWithFacebook(token, providerId) {
        const facebookUser = await this.verifyFacebookToken(token);
        const facebookId = providerId || facebookUser.id;
        let user = null;
        const existingAuthMethod = await this.prisma.authMethod.findFirst({
            where: {
                provider: client_1.AuthProvider.FACEBOOK,
                providerId: facebookId,
            },
            include: {
                user: true,
            },
        });
        if (existingAuthMethod) {
            user = existingAuthMethod.user;
        }
        else if (facebookUser.email) {
            user = await this.prisma.user.findUnique({
                where: { email: facebookUser.email },
                include: {
                    authMethods: true,
                },
            });
            if (user) {
                await this.prisma.authMethod.create({
                    data: {
                        userId: user.id,
                        provider: client_1.AuthProvider.FACEBOOK,
                        providerId: facebookId,
                        isVerified: true,
                    },
                });
            }
        }
        if (!user && facebookUser.email) {
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
                            provider: client_1.AuthProvider.FACEBOOK,
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
            throw new common_1.UnauthorizedException('Unable to authenticate with Facebook');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                failedLoginAttempts: 0,
                lockedUntil: null,
            },
        });
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
    async loginWithPhone(phone, profile) {
        let user = await this.prisma.user.findUnique({
            where: { phone },
            include: {
                authMethods: true,
            },
        });
        if (user) {
            const phoneAuthMethod = user.authMethods.find(method => method.provider === client_1.AuthProvider.PHONE);
            if (!phoneAuthMethod) {
                await this.prisma.authMethod.create({
                    data: {
                        userId: user.id,
                        provider: client_1.AuthProvider.PHONE,
                        providerId: phone,
                        isVerified: true,
                    },
                });
            }
        }
        else {
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
                            provider: client_1.AuthProvider.PHONE,
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
    async updateProfile(userId, updateData) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        }
        if (updateData.phone && updateData.phone !== user.phone) {
            const existingUser = await this.prisma.user.findUnique({
                where: { phone: updateData.phone },
            });
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.BadRequestException('Số điện thoại đã được sử dụng');
            }
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                firstName: updateData.firstName ?? user.firstName,
                lastName: updateData.lastName ?? user.lastName,
                avatar: updateData.avatar ?? user.avatar,
                phone: updateData.phone ?? user.phone,
            },
        });
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
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        }
        if (!user.password) {
            throw new common_1.BadRequestException('Tài khoản này không có mật khẩu. Vui lòng tạo mật khẩu trước.');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Mật khẩu hiện tại không chính xác');
        }
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new common_1.BadRequestException('Mật khẩu mới phải khác mật khẩu cũ');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
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
    async setPassword(userId, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        }
        if (user.password) {
            throw new common_1.BadRequestException('Tài khoản này đã có mật khẩu. Vui lòng sử dụng chức năng thay đổi mật khẩu.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
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
    async hasPassword(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { password: true },
        });
        return !!user?.password;
    }
    generateRandomPassword(length = 12) {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = uppercase + lowercase + numbers + special;
        let password = '';
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
        password += special.charAt(Math.floor(Math.random() * special.length));
        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
        return password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');
    }
    async adminResetPassword(userId, adminId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Người dùng không tồn tại');
        }
        const newPassword = this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
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
    async requestForgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return {
                success: true,
                message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã xác thực.',
            };
        }
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.verificationToken.deleteMany({
            where: {
                userId: user.id,
                type: 'PASSWORD_RESET',
                isUsed: false,
            },
        });
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
        return {
            success: true,
            message: 'Mã xác thực đã được gửi đến email của bạn.',
            ...(process.env.NODE_ENV === 'development' && { token: resetToken }),
        };
    }
    async verifyResetToken(email, token) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.BadRequestException('Email không tồn tại trong hệ thống');
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
            throw new common_1.BadRequestException('Mã xác thực không hợp lệ');
        }
        if (new Date() > verificationToken.expiresAt) {
            throw new common_1.BadRequestException('Mã xác thực đã hết hạn');
        }
        return {
            success: true,
            message: 'Mã xác thực hợp lệ',
            userId: user.id,
        };
    }
    async resetPasswordWithToken(email, token, newPassword) {
        const verification = await this.verifyResetToken(email, token);
        if (!verification.success) {
            throw new common_1.BadRequestException('Mã xác thực không hợp lệ');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: verification.userId },
            data: {
                password: hashedPassword,
            },
        });
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        axios_1.HttpService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map