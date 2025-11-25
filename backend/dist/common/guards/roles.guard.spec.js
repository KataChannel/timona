"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./roles.guard");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../decorators/roles.decorator");
describe('RolesGuard', () => {
    let guard;
    let reflector;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                roles_guard_1.RolesGuard,
                {
                    provide: core_1.Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();
        guard = module.get(roles_guard_1.RolesGuard);
        reflector = module.get(core_1.Reflector);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    const createMockExecutionContext = (user) => {
        const mockRequest = { user };
        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue(mockRequest),
            }),
            getType: jest.fn().mockReturnValue('graphql'),
            getArgs: jest.fn().mockReturnValue([null, null, { req: mockRequest }, null]),
            getArgByIndex: jest.fn((index) => {
                const args = [null, null, { req: mockRequest }, null];
                return args[index];
            }),
            switchToRpc: jest.fn(),
            switchToWs: jest.fn(),
        };
    };
    it('should be defined', () => {
        expect(guard).toBeDefined();
    });
    describe('canActivate', () => {
        it('should allow access when no roles are required', () => {
            const mockContext = createMockExecutionContext({});
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(roles_decorator_1.ROLES_KEY, [
                mockContext.getHandler(),
                mockContext.getClass(),
            ]);
        });
        it('should allow access when user has required role (ADMIN)', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.ADMIN };
            const mockContext = createMockExecutionContext(mockUser);
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.UserRoleType.ADMIN]);
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });
        it('should allow access when user has one of multiple required roles', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.USER };
            const mockContext = createMockExecutionContext(mockUser);
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([client_1.UserRoleType.ADMIN, client_1.UserRoleType.USER]);
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });
        it('should throw ForbiddenException when user is not authenticated', () => {
            const mockContext = createMockExecutionContext(null);
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.UserRoleType.ADMIN]);
            expect(() => guard.canActivate(mockContext)).toThrow(common_1.ForbiddenException);
            expect(() => guard.canActivate(mockContext)).toThrow('User not authenticated');
        });
        it('should throw ForbiddenException when user does not have required role', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.GUEST };
            const mockContext = createMockExecutionContext(mockUser);
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.UserRoleType.ADMIN]);
            expect(() => guard.canActivate(mockContext)).toThrow(common_1.ForbiddenException);
            expect(() => guard.canActivate(mockContext)).toThrow(/Access denied/);
            expect(() => guard.canActivate(mockContext)).toThrow(/Required roles: ADMIN/);
            expect(() => guard.canActivate(mockContext)).toThrow(/Your role: GUEST/);
        });
        it('should throw ForbiddenException when user role does not match any of multiple required roles', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.GUEST };
            const mockContext = createMockExecutionContext(mockUser);
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([client_1.UserRoleType.ADMIN, client_1.UserRoleType.USER]);
            expect(() => guard.canActivate(mockContext)).toThrow(common_1.ForbiddenException);
            expect(() => guard.canActivate(mockContext)).toThrow(/Required roles: ADMIN, USER/);
        });
        it('should allow USER access to USER-only endpoints', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.USER };
            const mockContext = createMockExecutionContext(mockUser);
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.UserRoleType.USER]);
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });
        it('should deny GUEST access to ADMIN-only endpoints', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.GUEST };
            const mockContext = createMockExecutionContext(mockUser);
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.UserRoleType.ADMIN]);
            expect(() => guard.canActivate(mockContext)).toThrow(common_1.ForbiddenException);
        });
        it('should deny USER access to ADMIN-only endpoints', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.USER };
            const mockContext = createMockExecutionContext(mockUser);
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([client_1.UserRoleType.ADMIN]);
            expect(() => guard.canActivate(mockContext)).toThrow(common_1.ForbiddenException);
        });
        it('should allow ADMIN access to any endpoint', () => {
            const mockUser = { userId: 'user-1', roleType: client_1.UserRoleType.ADMIN };
            const mockContext = createMockExecutionContext(mockUser);
            jest
                .spyOn(reflector, 'getAllAndOverride')
                .mockReturnValue([client_1.UserRoleType.ADMIN, client_1.UserRoleType.USER, client_1.UserRoleType.GUEST]);
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
        });
    });
});
//# sourceMappingURL=roles.guard.spec.js.map