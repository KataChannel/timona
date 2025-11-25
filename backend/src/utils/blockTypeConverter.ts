/**
 * BlockType Enum Converter
 * Converts between frontend numeric values (0-26) and backend string values ('TEXT', 'IMAGE', etc.)
 * 
 * Frontend uses numeric enum for performance: BlockType.TEXT = 0
 * Backend/Database uses string enum for compatibility: BlockType.TEXT = 'TEXT'
 */

// Numeric to String mapping (Frontend to Backend)
export const BLOCK_TYPE_NUMERIC_TO_STRING: Record<number, string> = {
  0: 'TEXT',
  1: 'IMAGE',
  2: 'VIDEO',
  3: 'CAROUSEL',
  4: 'HERO',
  5: 'BUTTON',
  6: 'DIVIDER',
  7: 'SPACER',
  8: 'TEAM',
  9: 'STATS',
  10: 'CONTACT_INFO',
  11: 'GALLERY',
  12: 'CARD',
  13: 'TESTIMONIAL',
  14: 'FAQ',
  15: 'CONTACT_FORM',
  16: 'COMPLETED_TASKS',
  17: 'CONTAINER',
  18: 'SECTION',
  19: 'GRID',
  20: 'FLEX_ROW',
  21: 'FLEX_COLUMN',
  22: 'COLUMN',
  23: 'ROW',
  24: 'DYNAMIC',
  25: 'PRODUCT_LIST',
  26: 'PRODUCT_DETAIL',
  27: 'PRODUCT_CAROUSEL',
};

// String to Numeric mapping (Backend to Frontend)
export const BLOCK_TYPE_STRING_TO_NUMERIC: Record<string, number> = {
  'TEXT': 0,
  'IMAGE': 1,
  'VIDEO': 2,
  'CAROUSEL': 3,
  'HERO': 4,
  'BUTTON': 5,
  'DIVIDER': 6,
  'SPACER': 7,
  'TEAM': 8,
  'STATS': 9,
  'CONTACT_INFO': 10,
  'GALLERY': 11,
  'CARD': 12,
  'TESTIMONIAL': 13,
  'FAQ': 14,
  'CONTACT_FORM': 15,
  'COMPLETED_TASKS': 16,
  'CONTAINER': 17,
  'SECTION': 18,
  'GRID': 19,
  'FLEX_ROW': 20,
  'FLEX_COLUMN': 21,
  'COLUMN': 22,
  'ROW': 23,
  'DYNAMIC': 24,
  'PRODUCT_LIST': 25,
  'PRODUCT_DETAIL': 26,
  'PRODUCT_CAROUSEL': 27,
};

/**
 * Convert frontend numeric BlockType to backend string BlockType
 * Used when sending data from frontend to backend
 */
export function numericBlockTypeToString(numericType: number | string | undefined): string | undefined {
  if (numericType === undefined) return undefined;
  
  const numeric = typeof numericType === 'string' ? parseInt(numericType, 10) : numericType;
  
  if (isNaN(numeric)) return undefined;
  
  return BLOCK_TYPE_NUMERIC_TO_STRING[numeric];
}

/**
 * Convert backend string BlockType to frontend numeric BlockType
 * Used when receiving data from backend to frontend
 */
export function stringBlockTypeToNumeric(stringType: string | number | undefined): number | undefined {
  if (stringType === undefined) return undefined;
  
  const str = typeof stringType === 'number' ? String(stringType) : stringType;
  
  return BLOCK_TYPE_STRING_TO_NUMERIC[str.toUpperCase()];
}

/**
 * Batch convert array of numeric BlockTypes to string
 */
export function convertBlockTypesNumericToString(types: (number | string | undefined)[]): (string | undefined)[] {
  return types.map(numericBlockTypeToString);
}

/**
 * Batch convert array of string BlockTypes to numeric
 */
export function convertBlockTypesStringToNumeric(types: (string | number | undefined)[]): (number | undefined)[] {
  return types.map(stringBlockTypeToNumeric);
}

/**
 * Convert CreatePageBlockInput - numeric to string for backend
 */
export function convertCreateBlockInputToBackend(input: any): any {
  return {
    ...input,
    type: numericBlockTypeToString(input.type),
    children: input.children?.map(convertCreateBlockInputToBackend),
  };
}

/**
 * Convert UpdatePageBlockInput - numeric to string for backend
 */
export function convertUpdateBlockInputToBackend(input: any): any {
  return {
    ...input,
    type: input.type !== undefined ? numericBlockTypeToString(input.type) : undefined,
    children: input.children?.map(convertUpdateBlockInputToBackend),
  };
}

/**
 * Convert PageBlock from backend - string to numeric for frontend
 */
export function convertPageBlockToFrontend(block: any): any {
  if (!block) return block;
  
  return {
    ...block,
    type: stringBlockTypeToNumeric(block.type),
    children: block.children?.map(convertPageBlockToFrontend),
  };
}

/**
 * Convert array of PageBlocks from backend
 */
export function convertPageBlocksToFrontend(blocks: any[]): any[] {
  return blocks.map(convertPageBlockToFrontend);
}
