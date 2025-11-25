/**
 * Error Handling Utilities
 * 
 * Helpers for error handling, formatting, and logging
 */

/**
 * Custom Application Error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Network Error
 */
export class NetworkError extends AppError {
  constructor(message: string, public response?: Response) {
    super(message, 'NETWORK_ERROR', response?.status);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication Error
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Format error for display
 * 
 * @example
 * ```tsx
 * try {
 *   await api.fetchData();
 * } catch (err) {
 *   const message = formatError(err);
 *   toast.error(message);
 * }
 * ```
 */
export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Get error details for debugging
 * 
 * @example
 * ```tsx
 * const details = getErrorDetails(error);
 * console.error('Error:', details);
 * ```
 */
export function getErrorDetails(error: unknown): {
  message: string;
  code?: string;
  statusCode?: number;
  stack?: string;
  details?: any;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      details: error.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  
  return {
    message: String(error),
  };
}

/**
 * Handle async errors with try-catch
 * 
 * @example
 * ```tsx
 * const [data, error] = await handleAsync(api.fetchData());
 * 
 * if (error) {
 *   console.error('Failed:', error);
 *   return;
 * }
 * 
 * console.log('Success:', data);
 * ```
 */
export async function handleAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as Error];
  }
}

/**
 * Retry async function on failure
 * 
 * @example
 * ```tsx
 * const data = await retry(
 *   () => api.fetchData(),
 *   { 
 *     maxAttempts: 3, 
 *     delay: 1000,
 *     onRetry: (attempt) => console.log(`Retry ${attempt}`)
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'linear',
    onRetry,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        onRetry?.(attempt, lastError);
        
        const delayTime = backoff === 'exponential'
          ? delay * Math.pow(2, attempt - 1)
          : delay * attempt;
        
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
    }
  }
  
  throw lastError!;
}

/**
 * Create error logger
 * 
 * @example
 * ```tsx
 * const logger = createErrorLogger({
 *   onError: (error) => {
 *     // Send to error tracking service
 *     Sentry.captureException(error);
 *   }
 * });
 * 
 * logger.log(error);
 * logger.warn('Warning message');
 * logger.error('Error message');
 * ```
 */
export function createErrorLogger(options: {
  onError?: (error: Error) => void;
  onWarn?: (message: string) => void;
  logToConsole?: boolean;
} = {}) {
  const { onError, onWarn, logToConsole = true } = options;
  
  return {
    log: (error: Error) => {
      if (logToConsole) {
        console.error(error);
      }
      onError?.(error);
    },
    
    warn: (message: string) => {
      if (logToConsole) {
        console.warn(message);
      }
      onWarn?.(message);
    },
    
    error: (message: string, error?: Error) => {
      const err = error || new Error(message);
      if (logToConsole) {
        console.error(message, err);
      }
      onError?.(err);
    },
  };
}

/**
 * Parse GraphQL errors
 * 
 * @example
 * ```tsx
 * try {
 *   await client.query({ query: GET_USERS });
 * } catch (err) {
 *   const errors = parseGraphQLError(err);
 *   console.log(errors);
 * }
 * ```
 */
export function parseGraphQLError(error: any): string[] {
  if (error?.graphQLErrors) {
    return error.graphQLErrors.map((err: any) => err.message);
  }
  
  if (error?.networkError) {
    return [error.networkError.message];
  }
  
  return [formatError(error)];
}

/**
 * Parse API error response
 * 
 * @example
 * ```tsx
 * const response = await fetch('/api/users');
 * if (!response.ok) {
 *   const error = await parseAPIError(response);
 *   throw new AppError(error.message, error.code);
 * }
 * ```
 */
export async function parseAPIError(response: Response): Promise<{
  message: string;
  code?: string;
  errors?: Record<string, string>;
}> {
  try {
    const data = await response.json();
    return {
      message: data.message || data.error || 'Request failed',
      code: data.code,
      errors: data.errors,
    };
  } catch {
    return {
      message: response.statusText || 'Request failed',
    };
  }
}

/**
 * Safe JSON parse
 * 
 * @example
 * ```tsx
 * const data = safeJSONParse(str, { default: [] });
 * ```
 */
export function safeJSONParse<T = any>(
  str: string,
  options: { default?: T; onError?: (error: Error) => void } = {}
): T | null {
  try {
    return JSON.parse(str);
  } catch (error) {
    options.onError?.(error as Error);
    return options.default ?? null;
  }
}

/**
 * Is error of specific type
 * 
 * @example
 * ```tsx
 * if (isErrorType(error, ValidationError)) {
 *   console.log('Validation failed:', error.fields);
 * }
 * ```
 */
export function isErrorType<T extends Error>(
  error: unknown,
  ErrorClass: new (...args: any[]) => T
): error is T {
  return error instanceof ErrorClass;
}

/**
 * Assert value is not null/undefined
 * 
 * @example
 * ```tsx
 * const user = await fetchUser(id);
 * assertExists(user, 'User not found');
 * // TypeScript now knows user is not null
 * ```
 */
export function assertExists<T>(
  value: T | null | undefined,
  message: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError(message, 'ASSERTION_ERROR');
  }
}

/**
 * Wrap function with error boundary
 * 
 * @example
 * ```tsx
 * const safeFunction = wrapWithErrorHandler(
 *   riskyFunction,
 *   (error) => console.error('Failed:', error)
 * );
 * 
 * await safeFunction();
 * ```
 */
export function wrapWithErrorHandler<T extends (...args: any[]) => any>(
  fn: T,
  onError: (error: Error) => void
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          onError(error);
          throw error;
        });
      }
      return result;
    } catch (error) {
      onError(error as Error);
      throw error;
    }
  }) as T;
}
