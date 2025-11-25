/**
 * Validation Utilities
 * 
 * Common validation functions for forms and data
 */

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * URL validation
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Phone number validation (simple)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Strong password validation
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Credit card validation (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s+/g, '');
  
  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Date validation
 */
export function isValidDate(date: string): boolean {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Age validation
 */
export function isValidAge(birthDate: string, minAge: number = 0, maxAge: number = 150): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
}

/**
 * File size validation
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * File type validation
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      // Extension check
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    } else {
      // MIME type check
      return file.type === type || file.type.startsWith(type.replace('/*', ''));
    }
  });
}

/**
 * Image file validation
 */
export function isValidImage(file: File, maxSizeMB: number = 5): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return isValidFileType(file, allowedTypes) && isValidFileSize(file, maxSizeMB);
}

/**
 * Username validation
 * Alphanumeric, underscores, hyphens, 3-20 characters
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Slug validation
 * Lowercase, numbers, hyphens only
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}

/**
 * Hex color validation
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * IP address validation
 */
export function isValidIPv4(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * Domain validation
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * JSON validation
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Number range validation
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * String length validation
 */
export function hasValidLength(
  str: string,
  min: number = 0,
  max: number = Infinity
): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * Array length validation
 */
export function hasValidArrayLength<T>(
  arr: T[],
  min: number = 0,
  max: number = Infinity
): boolean {
  return arr.length >= min && arr.length <= max;
}

/**
 * Empty string validation
 */
export function isEmpty(str: string): boolean {
  return str.trim().length === 0;
}

/**
 * Contains validation
 */
export function contains(str: string, search: string, caseSensitive: boolean = false): boolean {
  if (!caseSensitive) {
    return str.toLowerCase().includes(search.toLowerCase());
  }
  return str.includes(search);
}

/**
 * Starts with validation
 */
export function startsWith(str: string, search: string, caseSensitive: boolean = false): boolean {
  if (!caseSensitive) {
    return str.toLowerCase().startsWith(search.toLowerCase());
  }
  return str.startsWith(search);
}

/**
 * Ends with validation
 */
export function endsWith(str: string, search: string, caseSensitive: boolean = false): boolean {
  if (!caseSensitive) {
    return str.toLowerCase().endsWith(search.toLowerCase());
  }
  return str.endsWith(search);
}

/**
 * Alphanumeric validation
 */
export function isAlphanumeric(str: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
}

/**
 * Alphabetic validation
 */
export function isAlphabetic(str: string): boolean {
  const alphabeticRegex = /^[a-zA-Z]+$/;
  return alphabeticRegex.test(str);
}

/**
 * Numeric validation
 */
export function isNumeric(str: string): boolean {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(str);
}

/**
 * Match validation
 */
export function matches(str: string, pattern: RegExp): boolean {
  return pattern.test(str);
}

/**
 * Equals validation
 */
export function equals(value1: any, value2: any): boolean {
  if (typeof value1 !== typeof value2) return false;
  
  if (typeof value1 === 'object' && value1 !== null && value2 !== null) {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
  
  return value1 === value2;
}

/**
 * Required field validation
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return !isEmpty(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Validator function type
 */
export type Validator = (value: any) => boolean;

/**
 * Combine validators with AND logic
 */
export function all(...validators: Validator[]): Validator {
  return (value: any) => validators.every(validator => validator(value));
}

/**
 * Combine validators with OR logic
 */
export function any(...validators: Validator[]): Validator {
  return (value: any) => validators.some(validator => validator(value));
}

/**
 * Negate validator
 */
export function not(validator: Validator): Validator {
  return (value: any) => !validator(value);
}

/**
 * Create custom validator
 */
export function createValidator(
  fn: (value: any) => boolean,
  message: string
): { validate: Validator; message: string } {
  return {
    validate: fn,
    message,
  };
}
