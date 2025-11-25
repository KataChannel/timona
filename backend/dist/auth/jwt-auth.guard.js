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
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const graphql_1 = require("@nestjs/graphql");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../services/user.service");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    constructor(jwtService, userService, configService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.configService = configService;
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
    }
    async canActivate(context) {
        let request;
        let isGraphQL = false;
        try {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            request = gqlContext.getContext().req;
            isGraphQL = true;
        }
        catch {
            request = context.switchToHttp().getRequest();
        }
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            const contextType = isGraphQL ? 'GraphQL' : 'REST';
            this.logger.warn(`${contextType} - No token provided in Authorization header`);
            throw new common_1.UnauthorizedException('Authentication token is required');
        }
        try {
            const secret = this.configService.get('JWT_SECRET') || 'fallback-secret-key';
            const payload = this.jwtService.verify(token, { secret });
            const user = await this.userService.findById(payload.sub);
            if (!user) {
                this.logger.warn(`User not found for token payload sub: ${payload.sub}`);
                throw new common_1.UnauthorizedException('User not found');
            }
            if (!user.isActive) {
                this.logger.warn(`Inactive user attempted access: ${user.id} (${user.email})`);
                throw new common_1.UnauthorizedException('User account is inactive');
            }
            request.user = {
                ...user,
                sub: user.id,
            };
            this.logger.debug(`Authenticated user: ${user.id} (${user.email})`);
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error.name === 'TokenExpiredError') {
                this.logger.warn('JWT token expired');
                throw new common_1.UnauthorizedException('Authentication token has expired');
            }
            if (error.name === 'JsonWebTokenError') {
                this.logger.warn(`JWT verification failed: ${error.message}`);
                throw new common_1.UnauthorizedException('Invalid authentication token');
            }
            this.logger.error(`JWT verification error: ${error.message}`, error.stack);
            throw new common_1.UnauthorizedException('Authentication failed');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService,
        config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map