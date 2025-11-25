// Backend test setup
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient for tests
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  enrollment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  quiz: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  review: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCourse = (overrides = {}) => ({
  id: 'test-course-id',
  title: 'Test Course',
  slug: 'test-course',
  description: 'Test Description',
  price: 99.99,
  level: 'BEGINNER',
  status: 'PUBLISHED',
  instructorId: 'test-instructor-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockEnrollment = (overrides = {}) => ({
  id: 'test-enrollment-id',
  userId: 'test-user-id',
  courseId: 'test-course-id',
  status: 'ACTIVE',
  progress: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
