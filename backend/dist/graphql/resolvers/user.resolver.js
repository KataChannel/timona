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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
const user_model_1 = require("../models/user.model");
const auth_model_1 = require("../models/auth.model");
const otp_model_1 = require("../models/otp.model");
const user_input_1 = require("../inputs/user.input");
const user_service_1 = require("../../services/user.service");
const auth_service_1 = require("../../auth/auth.service");
const otp_service_1 = require("../../services/otp.service");
const pubsub_service_1 = require("../../services/pubsub.service");
const client_1 = require("@prisma/client");
const auth_redirect_utils_1 = require("../../utils/auth-redirect.utils");
let UserResolver = class UserResolver {
    constructor(userService, authService, otpService, pubSubService) {
        this.userService = userService;
        this.authService = authService;
        this.otpService = otpService;
        this.pubSubService = pubSubService;
    }
    async getUserById(id) {
        return this.userService.findById(id);
    }
    async getMe(user) {
        return this.userService.findById(user.id);
    }
    async getUsers() {
        return this.userService.findAll();
    }
    async registerUser(input) {
        const user = await this.userService.create(input);
        const tokens = await this.authService.generateTokens(user);
        const redirectUrl = await (0, auth_redirect_utils_1.getRegisterRedirectUrl)();
        this.pubSubService.publishUserRegistered(user);
        return {
            ...tokens,
            user,
            redirectUrl,
        };
    }
    async loginUser(input) {
        const user = await this.authService.validateUser(input.emailOrUsername, input.password);
        const tokens = await this.authService.generateTokens(user);
        const redirectUrl = await (0, auth_redirect_utils_1.getLoginRedirectUrl)(user.id);
        return {
            ...tokens,
            user,
            redirectUrl,
        };
    }
    async loginWithGoogle(input) {
        console.log('Input to loginWithGoogle:', input);
        const result = await this.authService.loginWithGoogle(input);
        console.log('Result from authService:', result);
        const redirectUrl = await (0, auth_redirect_utils_1.getLoginRedirectUrl)(result.user.id);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
            redirectUrl,
        };
    }
    async loginWithFacebook(input) {
        const result = await this.authService.loginWithFacebook(input.token, input.providerId);
        const redirectUrl = await (0, auth_redirect_utils_1.getLoginRedirectUrl)(result.user.id);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
            redirectUrl,
        };
    }
    async loginWithPhone(input) {
        const isValidOtp = await this.otpService.verifyOtp(input.phone, input.otp);
        if (!isValidOtp) {
            throw new Error('Invalid or expired OTP');
        }
        const result = await this.authService.loginWithPhone(input.phone);
        const redirectUrl = await (0, auth_redirect_utils_1.getLoginRedirectUrl)(result.user.id);
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user,
            redirectUrl,
        };
    }
    async requestPhoneVerification(input) {
        return await this.otpService.requestPhoneVerification(input.phone);
    }
    async updateUser(id, input, context) {
        const currentUser = context.req.user;
        if (currentUser.id !== id && currentUser.roleType !== client_1.$Enums.UserRoleType.ADMIN) {
            throw new Error('Unauthorized');
        }
        return this.userService.update(id, input);
    }
    async updateProfile(input, user) {
        return this.authService.updateProfile(user.id, input);
    }
    async changePassword(input, user) {
        await this.authService.changePassword(user.id, input.currentPassword, input.newPassword);
        return true;
    }
    async setPassword(input, user) {
        if (input.password !== input.confirmPassword) {
            throw new Error('Mật khẩu xác nhận không khớp');
        }
        await this.authService.setPassword(user.id, input.password);
        return true;
    }
    async hasPassword(user) {
        return this.authService.hasPassword(user.id);
    }
    async deleteUser(id) {
        await this.userService.delete(id);
        return true;
    }
    async searchUsers(input) {
        return this.userService.searchUsers(input);
    }
    async getUserStats() {
        return this.userService.getUserStats();
    }
    async bulkUserAction(input) {
        return this.userService.bulkUserAction(input);
    }
    async adminUpdateUser(id, input) {
        return this.userService.adminUpdateUser(id, input);
    }
    async adminCreateUser(input) {
        return this.userService.adminCreateUser(input);
    }
    async adminResetPassword(input, adminUser) {
        return this.userService.adminResetPassword(input.userId, adminUser.id);
    }
    async requestForgotPassword(email) {
        const result = await this.authService.requestForgotPassword(email);
        return {
            success: result.success,
            message: result.message,
            ...(result.token && { token: result.token }),
        };
    }
    async verifyResetToken(email, token) {
        const result = await this.authService.verifyResetToken(email, token);
        return {
            success: result.success,
            message: result.message,
        };
    }
    async resetPasswordWithToken(email, token, newPassword) {
        const result = await this.authService.resetPasswordWithToken(email, token, newPassword);
        return {
            success: result.success,
            message: result.message,
        };
    }
    async role(user) {
        return user.roleType;
    }
    async roles(user) {
        if (user.userRoles && Array.isArray(user.userRoles)) {
            return user.userRoles.map((assignment) => assignment.role);
        }
        return [];
    }
    async permissions(user) {
        const permissions = new Map();
        if (user.userPermissions && Array.isArray(user.userPermissions)) {
            user.userPermissions.forEach((up) => {
                if (up.permission && up.permission.id && up.permission.name) {
                    permissions.set(up.permission.id, up.permission);
                }
            });
        }
        if (user.userRoles && Array.isArray(user.userRoles)) {
            user.userRoles.forEach((assignment) => {
                if (assignment.role?.permissions && Array.isArray(assignment.role.permissions)) {
                    assignment.role.permissions.forEach((rp) => {
                        if (rp.permission && rp.permission.id && rp.permission.name) {
                            permissions.set(rp.permission.id, rp.permission);
                        }
                    });
                }
            });
        }
        return Array.from(permissions.values());
    }
    userRegistered() {
        return this.pubSubService.getUserRegisteredIterator();
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, graphql_1.Query)(() => user_model_1.User, { name: 'getUserById' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUserById", null);
__decorate([
    (0, graphql_1.Query)(() => user_model_1.User, { name: 'getMe' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getMe", null);
__decorate([
    (0, graphql_1.Query)(() => [user_model_1.User], { name: 'getUsers' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUsers", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_model_1.AuthResponse, { name: 'registerUser' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.RegisterUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "registerUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_model_1.AuthResponse, { name: 'loginUser' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.LoginUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_model_1.AuthResponse, { name: 'loginWithGoogle' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.SocialLoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginWithGoogle", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_model_1.AuthResponse, { name: 'loginWithFacebook' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.SocialLoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginWithFacebook", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_model_1.AuthResponse, { name: 'loginWithPhone' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.PhoneLoginInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "loginWithPhone", null);
__decorate([
    (0, graphql_1.Mutation)(() => otp_model_1.OtpResponse, { name: 'requestPhoneVerification' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.RequestPhoneVerificationInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestPhoneVerification", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_model_1.User, { name: 'updateUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_input_1.UpdateUserInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_model_1.User, { name: 'updateProfile' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.UpdateProfileInput,
        user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateProfile", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'changePassword' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.ChangePasswordInput,
        user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'setPassword' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.SetPasswordInput,
        user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "setPassword", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean, { name: 'hasPassword' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "hasPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { name: 'deleteUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
__decorate([
    (0, graphql_1.Query)(() => user_model_1.UserSearchResult, { name: 'searchUsers' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.UserSearchInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "searchUsers", null);
__decorate([
    (0, graphql_1.Query)(() => user_model_1.UserStats, { name: 'getUserStats' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUserStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_model_1.BulkUserActionResult, { name: 'bulkUserAction' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.BulkUserActionInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "bulkUserAction", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_model_1.User, { name: 'adminUpdateUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_input_1.AdminUpdateUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "adminUpdateUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_model_1.User, { name: 'adminCreateUser' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.AdminCreateUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "adminCreateUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_model_1.AdminResetPasswordResult, { name: 'adminResetPassword' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_input_1.AdminResetPasswordInput,
        user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "adminResetPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => otp_model_1.OtpResponse, { name: 'requestForgotPassword' }),
    __param(0, (0, graphql_1.Args)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestForgotPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => otp_model_1.OtpResponse, { name: 'verifyResetToken' }),
    __param(0, (0, graphql_1.Args)('email')),
    __param(1, (0, graphql_1.Args)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "verifyResetToken", null);
__decorate([
    (0, graphql_1.Mutation)(() => otp_model_1.OtpResponse, { name: 'resetPasswordWithToken' }),
    __param(0, (0, graphql_1.Args)('email')),
    __param(1, (0, graphql_1.Args)('token')),
    __param(2, (0, graphql_1.Args)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "resetPasswordWithToken", null);
__decorate([
    (0, graphql_1.ResolveField)('role', () => String),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "role", null);
__decorate([
    (0, graphql_1.ResolveField)('roles', () => [Object], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "roles", null);
__decorate([
    (0, graphql_1.ResolveField)('permissions', () => [Object], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "permissions", null);
__decorate([
    (0, graphql_1.Subscription)(() => user_model_1.User, { name: 'userRegistered' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "userRegistered", null);
exports.UserResolver = UserResolver = __decorate([
    (0, graphql_1.Resolver)(() => user_model_1.User),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService,
        otp_service_1.OtpService,
        pubsub_service_1.PubSubService])
], UserResolver);
//# sourceMappingURL=user.resolver.js.map