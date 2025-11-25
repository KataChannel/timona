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
exports.AdminResetPasswordInput = exports.SetPasswordInput = exports.UpdateProfileInput = exports.AdminCreateUserInput = exports.AdminUpdateUserInput = exports.BulkUserActionInput = exports.UserSearchInput = exports.RequestPhoneVerificationInput = exports.ChangePasswordInput = exports.UpdateUserInput = exports.VerifyPhoneInput = exports.VerifyEmailInput = exports.ResetPasswordInput = exports.ForgotPasswordInput = exports.SocialLoginInput = exports.PhoneLoginInput = exports.LoginUserInput = exports.RegisterUserInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
require("../models/auth-extended.model");
const AuthProvider = client_1.$Enums.AuthProvider;
(0, graphql_1.registerEnumType)(client_1.$Enums.UserRoleType, {
    name: 'UserRoleType',
});
let RegisterUserInput = class RegisterUserInput {
};
exports.RegisterUserInput = RegisterUserInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterUserInput.prototype, "avatar", void 0);
exports.RegisterUserInput = RegisterUserInput = __decorate([
    (0, graphql_1.InputType)()
], RegisterUserInput);
let LoginUserInput = class LoginUserInput {
};
exports.LoginUserInput = LoginUserInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginUserInput.prototype, "emailOrUsername", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginUserInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LoginUserInput.prototype, "rememberMe", void 0);
exports.LoginUserInput = LoginUserInput = __decorate([
    (0, graphql_1.InputType)()
], LoginUserInput);
let PhoneLoginInput = class PhoneLoginInput {
};
exports.PhoneLoginInput = PhoneLoginInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], PhoneLoginInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhoneLoginInput.prototype, "otp", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PhoneLoginInput.prototype, "rememberMe", void 0);
exports.PhoneLoginInput = PhoneLoginInput = __decorate([
    (0, graphql_1.InputType)()
], PhoneLoginInput);
let SocialLoginInput = class SocialLoginInput {
};
exports.SocialLoginInput = SocialLoginInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(() => AuthProvider),
    (0, class_validator_1.IsEnum)(AuthProvider),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "provider", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "providerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginInput.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SocialLoginInput.prototype, "rememberMe", void 0);
exports.SocialLoginInput = SocialLoginInput = __decorate([
    (0, graphql_1.InputType)()
], SocialLoginInput);
let ForgotPasswordInput = class ForgotPasswordInput {
};
exports.ForgotPasswordInput = ForgotPasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ForgotPasswordInput.prototype, "email", void 0);
exports.ForgotPasswordInput = ForgotPasswordInput = __decorate([
    (0, graphql_1.InputType)()
], ForgotPasswordInput);
let ResetPasswordInput = class ResetPasswordInput {
};
exports.ResetPasswordInput = ResetPasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "newPassword", void 0);
exports.ResetPasswordInput = ResetPasswordInput = __decorate([
    (0, graphql_1.InputType)()
], ResetPasswordInput);
let VerifyEmailInput = class VerifyEmailInput {
};
exports.VerifyEmailInput = VerifyEmailInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyEmailInput.prototype, "token", void 0);
exports.VerifyEmailInput = VerifyEmailInput = __decorate([
    (0, graphql_1.InputType)()
], VerifyEmailInput);
let VerifyPhoneInput = class VerifyPhoneInput {
};
exports.VerifyPhoneInput = VerifyPhoneInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], VerifyPhoneInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPhoneInput.prototype, "otp", void 0);
exports.VerifyPhoneInput = VerifyPhoneInput = __decorate([
    (0, graphql_1.InputType)()
], VerifyPhoneInput);
let UpdateUserInput = class UpdateUserInput {
};
exports.UpdateUserInput = UpdateUserInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserInput.prototype, "avatar", void 0);
exports.UpdateUserInput = UpdateUserInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateUserInput);
let ChangePasswordInput = class ChangePasswordInput {
};
exports.ChangePasswordInput = ChangePasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "currentPassword", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "newPassword", void 0);
exports.ChangePasswordInput = ChangePasswordInput = __decorate([
    (0, graphql_1.InputType)()
], ChangePasswordInput);
let RequestPhoneVerificationInput = class RequestPhoneVerificationInput {
};
exports.RequestPhoneVerificationInput = RequestPhoneVerificationInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], RequestPhoneVerificationInput.prototype, "phone", void 0);
exports.RequestPhoneVerificationInput = RequestPhoneVerificationInput = __decorate([
    (0, graphql_1.InputType)()
], RequestPhoneVerificationInput);
let UserSearchInput = class UserSearchInput {
};
exports.UserSearchInput = UserSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSearchInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.UserRoleType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.$Enums.UserRoleType),
    __metadata("design:type", String)
], UserSearchInput.prototype, "roleType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserSearchInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserSearchInput.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSearchInput.prototype, "createdAfter", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSearchInput.prototype, "createdBefore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UserSearchInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UserSearchInput.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'createdAt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSearchInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSearchInput.prototype, "sortOrder", void 0);
exports.UserSearchInput = UserSearchInput = __decorate([
    (0, graphql_1.InputType)()
], UserSearchInput);
let BulkUserActionInput = class BulkUserActionInput {
};
exports.BulkUserActionInput = BulkUserActionInput;
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], BulkUserActionInput.prototype, "userIds", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkUserActionInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.UserRoleType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.$Enums.UserRoleType),
    __metadata("design:type", String)
], BulkUserActionInput.prototype, "newRole", void 0);
exports.BulkUserActionInput = BulkUserActionInput = __decorate([
    (0, graphql_1.InputType)()
], BulkUserActionInput);
let AdminUpdateUserInput = class AdminUpdateUserInput {
};
exports.AdminUpdateUserInput = AdminUpdateUserInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.UserRoleType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.$Enums.UserRoleType),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "roleType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUpdateUserInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUpdateUserInput.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminUpdateUserInput.prototype, "isTwoFactorEnabled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminUpdateUserInput.prototype, "avatar", void 0);
exports.AdminUpdateUserInput = AdminUpdateUserInput = __decorate([
    (0, graphql_1.InputType)()
], AdminUpdateUserInput);
let AdminCreateUserInput = class AdminCreateUserInput {
};
exports.AdminCreateUserInput = AdminCreateUserInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.UserRoleType, { nullable: true, defaultValue: client_1.$Enums.UserRoleType.USER }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.$Enums.UserRoleType),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "roleType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminCreateUserInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AdminCreateUserInput.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdminCreateUserInput.prototype, "avatar", void 0);
exports.AdminCreateUserInput = AdminCreateUserInput = __decorate([
    (0, graphql_1.InputType)()
], AdminCreateUserInput);
let UpdateProfileInput = class UpdateProfileInput {
};
exports.UpdateProfileInput = UpdateProfileInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Họ phải có ít nhất 2 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileInput.prototype, "avatar", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)('VN', { message: 'Số điện thoại không hợp lệ' }),
    __metadata("design:type", String)
], UpdateProfileInput.prototype, "phone", void 0);
exports.UpdateProfileInput = UpdateProfileInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateProfileInput);
let SetPasswordInput = class SetPasswordInput {
};
exports.SetPasswordInput = SetPasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được để trống' }),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    __metadata("design:type", String)
], SetPasswordInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Xác nhận mật khẩu không được để trống' }),
    __metadata("design:type", String)
], SetPasswordInput.prototype, "confirmPassword", void 0);
exports.SetPasswordInput = SetPasswordInput = __decorate([
    (0, graphql_1.InputType)()
], SetPasswordInput);
let AdminResetPasswordInput = class AdminResetPasswordInput {
};
exports.AdminResetPasswordInput = AdminResetPasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'User ID không được để trống' }),
    (0, class_validator_1.IsUUID)(undefined, { message: 'User ID phải là UUID hợp lệ' }),
    __metadata("design:type", String)
], AdminResetPasswordInput.prototype, "userId", void 0);
exports.AdminResetPasswordInput = AdminResetPasswordInput = __decorate([
    (0, graphql_1.InputType)()
], AdminResetPasswordInput);
//# sourceMappingURL=user.input.js.map