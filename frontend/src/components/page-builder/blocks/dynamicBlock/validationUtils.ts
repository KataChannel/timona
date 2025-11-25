/**
 * Validation Utilities
 * All validation logic centralized here
 */

/**
 * Validate and parse JSON string
 * @returns { isValid: boolean, data: any, error?: string }
 */
export function validateJSON(jsonStr: string, isArray: boolean = false) {
  const trimmed = jsonStr.trim();
  
  // Empty is valid (defaults to {} or [])
  if (!trimmed || trimmed === (isArray ? '[]' : '{}')) {
    return {
      isValid: true,
      data: isArray ? [] : {},
      error: null,
    };
  }

  try {
    const parsed = JSON.parse(trimmed);
    
    // Type check if array expected
    if (isArray && !Array.isArray(parsed)) {
      return {
        isValid: false,
        data: null,
        error: 'Dữ liệu phải là một array',
      };
    }

    return {
      isValid: true,
      data: parsed,
      error: null,
    };
  } catch (err) {
    return {
      isValid: false,
      data: null,
      error: 'JSON format không hợp lệ - Kiểm tra lại cú pháp',
    };
  }
}

/**
 * Validate limit number
 * @returns { isValid: boolean, value?: number, error?: string }
 */
export function validateLimit(limitStr: string) {
  const trimmed = limitStr.trim();

  // Empty is valid (no limit)
  if (!trimmed) {
    return {
      isValid: true,
      value: undefined,
      error: null,
    };
  }

  const value = parseInt(trimmed);
  
  if (isNaN(value)) {
    return {
      isValid: false,
      value: null,
      error: 'Limit phải là một số',
    };
  }

  if (value <= 0) {
    return {
      isValid: false,
      value: null,
      error: 'Limit phải lớn hơn 0',
    };
  }

  return {
    isValid: true,
    value,
    error: null,
  };
}

/**
 * Check if there are any validation errors
 */
export function hasValidationErrors(
  staticError: boolean,
  repeaterError: boolean,
  limitError: boolean
): boolean {
  return staticError || repeaterError || limitError;
}
