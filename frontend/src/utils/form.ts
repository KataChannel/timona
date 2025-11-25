/**
 * Form Utilities
 * 
 * Helpers for form handling, validation, and data transformation
 */

/**
 * Create a form change handler
 * 
 * @example
 * ```tsx
 * const handleChange = createFormHandler(setFormData);
 * 
 * <input name="email" onChange={handleChange} />
 * ```
 */
export function createFormHandler<T>(
  setData: React.Dispatch<React.SetStateAction<T>>
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number
    if (type === 'number') {
      const numValue = value === '' ? '' : parseFloat(value);
      setData(prev => ({ ...prev, [name]: numValue }));
      return;
    }
    
    // Handle text, email, etc.
    setData(prev => ({ ...prev, [name]: value }));
  };
}

/**
 * Create a field updater
 * 
 * @example
 * ```tsx
 * const updateField = createFieldUpdater(setFormData);
 * 
 * <Select onValueChange={updateField('category')} />
 * ```
 */
export function createFieldUpdater<T>(
  setData: React.Dispatch<React.SetStateAction<T>>
) {
  return (field: keyof T) => (value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };
}

/**
 * Extract form data from FormData object
 * 
 * @example
 * ```tsx
 * const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 *   e.preventDefault();
 *   const data = extractFormData(new FormData(e.currentTarget));
 *   console.log(data);
 * };
 * ```
 */
export function extractFormData(formData: FormData): Record<string, any> {
  const data: Record<string, any> = {};
  
  formData.forEach((value, key) => {
    // Handle multiple values (e.g., checkboxes with same name)
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  });
  
  return data;
}

/**
 * Validate form field
 * 
 * @example
 * ```tsx
 * const errors = {
 *   email: validateField(email, [
 *     { rule: 'required', message: 'Email is required' },
 *     { rule: 'email', message: 'Invalid email format' },
 *   ]),
 * };
 * ```
 */
export interface ValidationRule {
  rule: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export function validateField(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    switch (rule.rule) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return rule.message;
        }
        break;
        
      case 'min':
        if (typeof value === 'number' && value < rule.value!) {
          return rule.message;
        }
        break;
        
      case 'max':
        if (typeof value === 'number' && value > rule.value!) {
          return rule.message;
        }
        break;
        
      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value!) {
          return rule.message;
        }
        break;
        
      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value!) {
          return rule.message;
        }
        break;
        
      case 'pattern':
        if (value && !rule.value!.test(value)) {
          return rule.message;
        }
        break;
        
      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          return rule.message;
        }
        break;
    }
  }
  
  return null;
}

/**
 * Validate entire form
 * 
 * @example
 * ```tsx
 * const schema = {
 *   email: [
 *     { rule: 'required', message: 'Email is required' },
 *     { rule: 'email', message: 'Invalid email' },
 *   ],
 *   password: [
 *     { rule: 'required', message: 'Password is required' },
 *     { rule: 'minLength', value: 8, message: 'Min 8 characters' },
 *   ],
 * };
 * 
 * const errors = validateForm(formData, schema);
 * ```
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, ValidationRule[]>
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const field in schema) {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  }
  
  return errors;
}

/**
 * Check if form has errors
 */
export function hasErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Reset form to initial values
 */
export function resetForm<T>(
  setData: React.Dispatch<React.SetStateAction<T>>,
  initialData: T
) {
  setData(initialData);
}

/**
 * Transform form data for API submission
 * Removes empty strings, null values, etc.
 * 
 * @example
 * ```tsx
 * const cleanData = transformFormData(formData, {
 *   removeEmpty: true,
 *   removeNull: true,
 *   trim: true,
 * });
 * ```
 */
export function transformFormData<T extends Record<string, any>>(
  data: T,
  options: {
    removeEmpty?: boolean;
    removeNull?: boolean;
    trim?: boolean;
    transformKeys?: (key: string) => string;
  } = {}
): Partial<T> {
  const {
    removeEmpty = false,
    removeNull = false,
    trim = true,
    transformKeys,
  } = options;
  
  const result: any = {};
  
  for (const key in data) {
    let value = data[key];
    
    // Skip null values if requested
    if (removeNull && value === null) continue;
    
    // Trim strings if requested
    if (trim && typeof value === 'string') {
      value = value.trim();
    }
    
    // Skip empty strings if requested
    if (removeEmpty && value === '') continue;
    
    // Transform key if transformer provided
    const finalKey = transformKeys ? transformKeys(key) : key;
    
    result[finalKey] = value;
  }
  
  return result;
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Create form submission handler
 * 
 * @example
 * ```tsx
 * const handleSubmit = createSubmitHandler({
 *   onSubmit: async (data) => {
 *     await api.createUser(data);
 *   },
 *   onSuccess: () => {
 *     toast.success('User created!');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   },
 * });
 * 
 * <form onSubmit={handleSubmit(formData)}>
 * ```
 */
export function createSubmitHandler<T>(options: {
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  validate?: (data: T) => Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (data: T) => async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate if validator provided
    if (options.validate) {
      const errors = options.validate(data);
      if (hasErrors(errors)) {
        options.setErrors?.(errors);
        return;
      }
      options.setErrors?.({});
    }
    
    // Set loading state
    options.setLoading?.(true);
    
    try {
      await options.onSubmit(data);
      options.onSuccess?.();
    } catch (error) {
      options.onError?.(error as Error);
    } finally {
      options.setLoading?.(false);
    }
  };
}
