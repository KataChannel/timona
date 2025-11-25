import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly userService;
    private readonly configService;
    private readonly logger;
    constructor(jwtService: JwtService, userService: UserService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
