import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRoleType } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    const mockRequest = { user };
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getType: jest.fn().mockReturnValue('graphql'),
      getArgs: jest.fn().mockReturnValue([null, null, { req: mockRequest }, null]),
      getArgByIndex: jest.fn((index: number) => {
        const args = [null, null, { req: mockRequest }, null];
        return args[index];
      }),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ExecutionContext;
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
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should allow access when user has required role (ADMIN)', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.ADMIN };
      const mockContext = createMockExecutionContext(mockUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRoleType.ADMIN]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.USER };
      const mockContext = createMockExecutionContext(mockUser);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRoleType.ADMIN, UserRoleType.USER]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      const mockContext = createMockExecutionContext(null);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRoleType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('User not authenticated');
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.GUEST };
      const mockContext = createMockExecutionContext(mockUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRoleType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(/Access denied/);
      expect(() => guard.canActivate(mockContext)).toThrow(/Required roles: ADMIN/);
      expect(() => guard.canActivate(mockContext)).toThrow(/Your role: GUEST/);
    });

    it('should throw ForbiddenException when user role does not match any of multiple required roles', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.GUEST };
      const mockContext = createMockExecutionContext(mockUser);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRoleType.ADMIN, UserRoleType.USER]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(/Required roles: ADMIN, USER/);
    });

    it('should allow USER access to USER-only endpoints', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.USER };
      const mockContext = createMockExecutionContext(mockUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRoleType.USER]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny GUEST access to ADMIN-only endpoints', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.GUEST };
      const mockContext = createMockExecutionContext(mockUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRoleType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should deny USER access to ADMIN-only endpoints', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.USER };
      const mockContext = createMockExecutionContext(mockUser);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRoleType.ADMIN]);

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow ADMIN access to any endpoint', () => {
      const mockUser = { userId: 'user-1', roleType: UserRoleType.ADMIN };
      const mockContext = createMockExecutionContext(mockUser);
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRoleType.ADMIN, UserRoleType.USER, UserRoleType.GUEST]);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });
  });
});
