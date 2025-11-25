/**
 * Array Utilities
 * 
 * Helpers for array manipulation, grouping, and transformation
 */

/**
 * Group array items by a key
 * 
 * @example
 * ```tsx
 * const users = [
 *   { id: 1, role: 'admin', name: 'Alice' },
 *   { id: 2, role: 'user', name: 'Bob' },
 *   { id: 3, role: 'admin', name: 'Charlie' },
 * ];
 * 
 * const byRole = groupBy(users, 'role');
 * // { admin: [Alice, Charlie], user: [Bob] }
 * 
 * const byFirstLetter = groupBy(users, user => user.name[0]);
 * // { A: [Alice], B: [Bob], C: [Charlie] }
 * ```
 */
export function groupBy<T>(
  array: T[],
  keyOrFn: keyof T | ((item: T) => string | number)
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = typeof keyOrFn === 'function' 
      ? String(keyOrFn(item))
      : String(item[keyOrFn]);
    
    if (!groups[key]) {
      groups[key] = [];
    }
    
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Get unique values from array
 * 
 * @example
 * ```tsx
 * unique([1, 2, 2, 3, 3, 3]); // [1, 2, 3]
 * unique(users, 'email'); // Unique by email
 * ```
 */
export function unique<T>(
  array: T[],
  key?: keyof T
): T[] {
  if (!key) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Sort array by multiple keys
 * 
 * @example
 * ```tsx
 * sortBy(users, ['role', 'name']);
 * sortBy(users, [
 *   { key: 'role', order: 'asc' },
 *   { key: 'name', order: 'desc' },
 * ]);
 * ```
 */
export function sortBy<T>(
  array: T[],
  keys: (keyof T | { key: keyof T; order: 'asc' | 'desc' })[]
): T[] {
  return [...array].sort((a, b) => {
    for (const keyConfig of keys) {
      const key = typeof keyConfig === 'object' ? keyConfig.key : keyConfig;
      const order = typeof keyConfig === 'object' ? keyConfig.order : 'asc';
      
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    
    return 0;
  });
}

/**
 * Chunk array into smaller arrays
 * 
 * @example
 * ```tsx
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Move item in array
 * 
 * @example
 * ```tsx
 * const items = ['a', 'b', 'c', 'd'];
 * move(items, 1, 3); // ['a', 'c', 'd', 'b']
 * ```
 */
export function move<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Partition array into two groups based on predicate
 * 
 * @example
 * ```tsx
 * const [even, odd] = partition([1, 2, 3, 4, 5], n => n % 2 === 0);
 * // even: [2, 4], odd: [1, 3, 5]
 * ```
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  
  for (const item of array) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  
  return [pass, fail];
}

/**
 * Remove duplicates and merge arrays
 * 
 * @example
 * ```tsx
 * union([1, 2], [2, 3], [3, 4]); // [1, 2, 3, 4]
 * ```
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat());
}

/**
 * Get intersection of arrays
 * 
 * @example
 * ```tsx
 * intersection([1, 2, 3], [2, 3, 4], [3, 4, 5]); // [3]
 * ```
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  
  return arrays[0].filter(item =>
    arrays.slice(1).every(arr => arr.includes(item))
  );
}

/**
 * Get difference between arrays
 * 
 * @example
 * ```tsx
 * difference([1, 2, 3], [2, 3, 4]); // [1]
 * ```
 */
export function difference<T>(array: T[], ...arrays: T[][]): T[] {
  const others = arrays.flat();
  return array.filter(item => !others.includes(item));
}

/**
 * Shuffle array randomly
 * 
 * @example
 * ```tsx
 * shuffle([1, 2, 3, 4, 5]); // Random order
 * ```
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Take first N items
 * 
 * @example
 * ```tsx
 * take([1, 2, 3, 4, 5], 3); // [1, 2, 3]
 * ```
 */
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

/**
 * Take last N items
 * 
 * @example
 * ```tsx
 * takeLast([1, 2, 3, 4, 5], 3); // [3, 4, 5]
 * ```
 */
export function takeLast<T>(array: T[], count: number): T[] {
  return array.slice(-count);
}

/**
 * Flatten nested arrays
 * 
 * @example
 * ```tsx
 * flatten([[1, 2], [3, [4, 5]]]); // [1, 2, 3, 4, 5]
 * ```
 */
export function flatten<T>(array: any[]): T[] {
  return array.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

/**
 * Map array to object
 * 
 * @example
 * ```tsx
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * mapToObject(users, 'id');
 * // { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
 * ```
 */
export function mapToObject<T>(
  array: T[],
  keyField: keyof T
): Record<string | number, T> {
  return array.reduce((obj, item) => {
    const key = item[keyField] as string | number;
    obj[key] = item;
    return obj;
  }, {} as Record<string | number, T>);
}

/**
 * Sum array values
 * 
 * @example
 * ```tsx
 * sum([1, 2, 3, 4, 5]); // 15
 * sum(products, 'price'); // Sum of all prices
 * sum(products, p => p.price * p.quantity); // Custom sum
 * ```
 */
export function sum<T>(
  array: T[],
  keyOrFn?: keyof T | ((item: T) => number)
): number {
  if (!keyOrFn) {
    return (array as unknown as number[]).reduce((sum, val) => sum + val, 0);
  }
  
  return array.reduce((sum, item) => {
    const value = typeof keyOrFn === 'function'
      ? keyOrFn(item)
      : (item[keyOrFn] as unknown as number);
    return sum + value;
  }, 0);
}

/**
 * Get average of array values
 * 
 * @example
 * ```tsx
 * average([1, 2, 3, 4, 5]); // 3
 * average(users, 'age'); // Average age
 * ```
 */
export function average<T>(
  array: T[],
  keyOrFn?: keyof T | ((item: T) => number)
): number {
  if (array.length === 0) return 0;
  return sum(array, keyOrFn as any) / array.length;
}

/**
 * Get min/max values
 */
export function min<T>(
  array: T[],
  keyOrFn?: keyof T | ((item: T) => number)
): number {
  if (array.length === 0) return 0;
  
  const values = keyOrFn
    ? array.map(item =>
        typeof keyOrFn === 'function'
          ? keyOrFn(item)
          : (item[keyOrFn] as unknown as number)
      )
    : (array as unknown as number[]);
  
  return Math.min(...values);
}

export function max<T>(
  array: T[],
  keyOrFn?: keyof T | ((item: T) => number)
): number {
  if (array.length === 0) return 0;
  
  const values = keyOrFn
    ? array.map(item =>
        typeof keyOrFn === 'function'
          ? keyOrFn(item)
          : (item[keyOrFn] as unknown as number)
      )
    : (array as unknown as number[]);
  
  return Math.max(...values);
}

/**
 * Count occurrences
 * 
 * @example
 * ```tsx
 * countBy(['a', 'b', 'a', 'c', 'a']); // { a: 3, b: 1, c: 1 }
 * countBy(users, 'role'); // Count users by role
 * ```
 */
export function countBy<T>(
  array: T[],
  keyOrFn?: keyof T | ((item: T) => string | number)
): Record<string, number> {
  return array.reduce((counts, item) => {
    const key = keyOrFn
      ? typeof keyOrFn === 'function'
        ? String(keyOrFn(item))
        : String(item[keyOrFn])
      : String(item);
    
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}
