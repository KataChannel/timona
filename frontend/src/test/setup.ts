// Frontend test setup
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  gql: (strings: TemplateStringsArray) => strings[0],
  ApolloProvider: ({ children }: { children: React.ReactNode }) => children,
  ApolloClient: vi.fn(),
  InMemoryCache: vi.fn(),
  createHttpLink: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Global test utilities
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  name: 'Test User',
  role: 'USER',
};

export const mockCourse = {
  id: 'test-course-id',
  title: 'Test Course',
  slug: 'test-course',
  description: 'Test Description',
  price: 99.99,
  level: 'BEGINNER',
  status: 'PUBLISHED',
};

export const mockEnrollment = {
  id: 'test-enrollment-id',
  userId: 'test-user-id',
  courseId: 'test-course-id',
  status: 'ACTIVE',
  progress: 50,
};
