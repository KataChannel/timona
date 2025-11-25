import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request;
    let isGraphQL = false;
    
    // Check if this is a GraphQL context or REST context
    try {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
      isGraphQL = true;
    } catch {
      // If GraphQL context creation fails, it's a REST endpoint
      request = context.switchToHttp().getRequest();
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      const contextType = isGraphQL ? 'GraphQL' : 'REST';
      this.logger.warn(`${contextType} - No token provided in Authorization header`);
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'fallback-secret-key';
      const payload = this.jwtService.verify(token, { secret });
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        this.logger.warn(`User not found for token payload sub: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        this.logger.warn(`Inactive user attempted access: ${user.id} (${user.email})`);
        throw new UnauthorizedException('User account is inactive');
      }

      // Attach user to request with both user object and sub for compatibility
      request.user = {
        ...user,
        sub: user.id, // Ensure sub is available for the controller
      };
      
      this.logger.debug(`Authenticated user: ${user.id} (${user.email})`);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      if (error.name === 'TokenExpiredError') {
        this.logger.warn('JWT token expired');
        throw new UnauthorizedException('Authentication token has expired');
      }
      
      if (error.name === 'JsonWebTokenError') {
        this.logger.warn(`JWT verification failed: ${error.message}`);
        throw new UnauthorizedException('Invalid authentication token');
      }
      
      this.logger.error(`JWT verification error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
