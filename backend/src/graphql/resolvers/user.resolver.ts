import { Resolver, Query, Mutation, Args, Context, Subscription, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import { User, UserSearchResult, UserStats, BulkUserActionResult, AdminResetPasswordResult } from '../models/user.model';
import { AuthResponse } from '../models/auth.model';
import { OtpResponse } from '../models/otp.model';
import { RegisterUserInput, LoginUserInput, UpdateUserInput, SocialLoginInput, PhoneLoginInput, RequestPhoneVerificationInput, UserSearchInput, BulkUserActionInput, AdminUpdateUserInput, AdminCreateUserInput, UpdateProfileInput, ChangePasswordInput, SetPasswordInput, AdminResetPasswordInput } from '../inputs/user.input';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { OtpService } from '../../services/otp.service';
import { PubSubService } from '../../services/pubsub.service';
import { $Enums } from '@prisma/client';
import { getLoginRedirectUrl, getRegisterRedirectUrl } from '../../utils/auth-redirect.utils';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly pubSubService: PubSubService,
  ) {}

  // Queries
  @Query(() => User, { name: 'getUserById' })
  @UseGuards(JwtAuthGuard)
  async getUserById(@Args('id') id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Query(() => User, { name: 'getMe' })
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User): Promise<User> {
    // User is already attached by JwtAuthGuard and extracted by CurrentUser decorator
    // Just return the full user object from database to ensure all fields are populated
    return this.userService.findById(user.id);
  }

  @Query(() => [User], { name: 'getUsers' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // Mutations
  @Mutation(() => AuthResponse, { name: 'registerUser' })
  async registerUser(@Args('input') input: RegisterUserInput): Promise<AuthResponse> {
    const user = await this.userService.create(input);
    const tokens = await this.authService.generateTokens(user);
    const redirectUrl = await getRegisterRedirectUrl();
    
    // Publish user registration event
    this.pubSubService.publishUserRegistered(user);
    
    return {
      ...tokens,
      user,
      redirectUrl,
    };
  }

  @Mutation(() => AuthResponse, { name: 'loginUser' })
  async loginUser(@Args('input') input: LoginUserInput): Promise<AuthResponse> {
    const user = await this.authService.validateUser(input.emailOrUsername, input.password);
    const tokens = await this.authService.generateTokens(user);
    const redirectUrl = await getLoginRedirectUrl(user.id);
    
    return {
      ...tokens,
      user,
      redirectUrl,
    };
  }

  @Mutation(() => AuthResponse, { name: 'loginWithGoogle' })
  async loginWithGoogle(@Args('input') input: SocialLoginInput): Promise<AuthResponse> {
    console.log('Input to loginWithGoogle:', input);
    
    const result = await this.authService.loginWithGoogle(input);
    console.log('Result from authService:', result);
    const redirectUrl = await getLoginRedirectUrl(result.user.id);
    
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      redirectUrl,
    };
  }

  @Mutation(() => AuthResponse, { name: 'loginWithFacebook' })
  async loginWithFacebook(@Args('input') input: SocialLoginInput): Promise<AuthResponse> {
    const result = await this.authService.loginWithFacebook(
      input.token,
      input.providerId
    );
    const redirectUrl = await getLoginRedirectUrl(result.user.id);
    
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      redirectUrl,
    };
  }

  @Mutation(() => AuthResponse, { name: 'loginWithPhone' })
  async loginWithPhone(@Args('input') input: PhoneLoginInput): Promise<AuthResponse> {
    // Verify OTP first
    const isValidOtp = await this.otpService.verifyOtp(input.phone, input.otp);
    
    if (!isValidOtp) {
      throw new Error('Invalid or expired OTP');
    }

    const result = await this.authService.loginWithPhone(input.phone);
    const redirectUrl = await getLoginRedirectUrl(result.user.id);
    
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      redirectUrl,
    };
  }

  @Mutation(() => OtpResponse, { name: 'requestPhoneVerification' })
  async requestPhoneVerification(@Args('input') input: RequestPhoneVerificationInput): Promise<OtpResponse> {
    return await this.otpService.requestPhoneVerification(input.phone);
  }

  @Mutation(() => User, { name: 'updateUser' })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
    @Context() context: any,
  ): Promise<User> {
    const currentUser = context.req.user;
    
    // Users can only update their own profile unless they're admin
    if (currentUser.id !== id && currentUser.roleType !== $Enums.UserRoleType.ADMIN) {
      throw new Error('Unauthorized');
    }
    
    return this.userService.update(id, input);
  }

  /**
   * Cập nhật thông tin hồ sơ người dùng
   * - Có thể cập nhật firstName, lastName, avatar, phone
   */
  @Mutation(() => User, { name: 'updateProfile' })
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.authService.updateProfile(user.id, input);
  }

  /**
   * Thay đổi mật khẩu
   * - Yêu cầu mật khẩu hiện tại để xác thực
   */
  @Mutation(() => Boolean, { name: 'changePassword' })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.authService.changePassword(
      user.id,
      input.currentPassword,
      input.newPassword,
    );
    return true;
  }

  /**
   * Tạo mật khẩu cho tài khoản login qua mạng xã hội
   * - Chỉ dùng khi tài khoản chưa có mật khẩu
   */
  @Mutation(() => Boolean, { name: 'setPassword' })
  @UseGuards(JwtAuthGuard)
  async setPassword(
    @Args('input') input: SetPasswordInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    // Kiểm tra confirm password match
    if (input.password !== input.confirmPassword) {
      throw new Error('Mật khẩu xác nhận không khớp');
    }

    await this.authService.setPassword(user.id, input.password);
    return true;
  }

  /**
   * Kiểm tra tài khoản có mật khẩu không
   * - Dùng để xác định có nên show form tạo/thay đổi mật khẩu không
   */
  @Query(() => Boolean, { name: 'hasPassword' })
  @UseGuards(JwtAuthGuard)
  async hasPassword(@CurrentUser() user: User): Promise<boolean> {
    return this.authService.hasPassword(user.id);
  }

  @Mutation(() => Boolean, { name: 'deleteUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    await this.userService.delete(id);
    return true;
  }

  // Admin-specific queries and mutations
  @Query(() => UserSearchResult, { name: 'searchUsers' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async searchUsers(@Args('input') input: UserSearchInput): Promise<UserSearchResult> {
    return this.userService.searchUsers(input);
  }

  @Query(() => UserStats, { name: 'getUserStats' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async getUserStats(): Promise<UserStats> {
    return this.userService.getUserStats();
  }

  @Mutation(() => BulkUserActionResult, { name: 'bulkUserAction' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async bulkUserAction(@Args('input') input: BulkUserActionInput): Promise<BulkUserActionResult> {
    return this.userService.bulkUserAction(input);
  }

  @Mutation(() => User, { name: 'adminUpdateUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async adminUpdateUser(
    @Args('id') id: string,
    @Args('input') input: AdminUpdateUserInput,
  ): Promise<User> {
    return this.userService.adminUpdateUser(id, input);
  }

  @Mutation(() => User, { name: 'adminCreateUser' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async adminCreateUser(@Args('input') input: AdminCreateUserInput): Promise<User> {
    return this.userService.adminCreateUser(input);
  }

  /**
   * Admin reset password cho người dùng
   * - Tạo mật khẩu ngẫu nhiên
   * - Gửi email/thông báo cho người dùng
   * - Audit log sự kiện reset password
   */
  @Mutation(() => AdminResetPasswordResult, { name: 'adminResetPassword' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRoleType.ADMIN)
  async adminResetPassword(
    @Args('input') input: AdminResetPasswordInput,
    @CurrentUser() adminUser: User,
  ): Promise<AdminResetPasswordResult> {
    return this.userService.adminResetPassword(input.userId, adminUser.id);
  }

  /**
   * Request forgot password - Gửi mã OTP reset mật khẩu
   */
  @Mutation(() => OtpResponse, { name: 'requestForgotPassword' })
  async requestForgotPassword(@Args('email') email: string): Promise<OtpResponse> {
    const result = await this.authService.requestForgotPassword(email);
    return {
      success: result.success,
      message: result.message,
      ...(result.token && { token: result.token }), // Only in development
    };
  }

  /**
   * Verify forgot password token
   */
  @Mutation(() => OtpResponse, { name: 'verifyResetToken' })
  async verifyResetToken(
    @Args('email') email: string,
    @Args('token') token: string,
  ): Promise<OtpResponse> {
    const result = await this.authService.verifyResetToken(email, token);
    return {
      success: result.success,
      message: result.message,
    };
  }

  /**
   * Reset password with token
   */
  @Mutation(() => OtpResponse, { name: 'resetPasswordWithToken' })
  async resetPasswordWithToken(
    @Args('email') email: string,
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
  ): Promise<OtpResponse> {
    const result = await this.authService.resetPasswordWithToken(email, token, newPassword);
    return {
      success: result.success,
      message: result.message,
    };
  }

  // Field resolvers
  @ResolveField('role', () => String)
  async role(@Parent() user: User): Promise<string> {
    return user.roleType as string;
  }

  @ResolveField('roles', () => [Object], { nullable: true })
  async roles(@Parent() user: any): Promise<any[]> {
    // Extract roles from userRoles relation
    if (user.userRoles && Array.isArray(user.userRoles)) {
      return user.userRoles.map((assignment: any) => assignment.role);
    }
    return [];
  }

  @ResolveField('permissions', () => [Object], { nullable: true })
  async permissions(@Parent() user: any): Promise<any[]> {
    // Extract permissions from both userPermissions relation and roles
    const permissions = new Map();
    
    // Add direct user permissions
    if (user.userPermissions && Array.isArray(user.userPermissions)) {
      user.userPermissions.forEach((up: any) => {
        // Only add valid permissions with non-null names
        if (up.permission && up.permission.id && up.permission.name) {
          permissions.set(up.permission.id, up.permission);
        }
      });
    }
    
    // Add permissions from roles
    if (user.userRoles && Array.isArray(user.userRoles)) {
      user.userRoles.forEach((assignment: any) => {
        if (assignment.role?.permissions && Array.isArray(assignment.role.permissions)) {
          assignment.role.permissions.forEach((rp: any) => {
            // Only add valid permissions with non-null names
            if (rp.permission && rp.permission.id && rp.permission.name) {
              permissions.set(rp.permission.id, rp.permission);
            }
          });
        }
      });
    }
    
    return Array.from(permissions.values());
  }

  // Subscriptions
  @Subscription(() => User, { name: 'userRegistered' })
  userRegistered() {
    return this.pubSubService.getUserRegisteredIterator();
  }
}
