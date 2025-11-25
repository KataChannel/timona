/**
 * Template Processing Utilities
 * All template rendering logic
 */

/**
 * Process Handlebars-like template syntax
 * Supports: {{variable}}, {{#each array}}, {{#if condition}}, {{#repeat count}}
 */
export function processTemplate(template: string, data: any): string {
  if (!template || !data) return '';
  
  let result = template;

  // Process repeat helper (e.g., {{#repeat rating}}) - FIRST before loops
  const repeatRegex = /{{#repeat\s+(\w+)}}([\s\S]*?){{\/repeat}}/g;
  result = result.replace(repeatRegex, (match: string, countVar: string, repeatTemplate: string) => {
    const count = data[countVar] || 0;
    return Array(count).fill(repeatTemplate).join('');
  });

  // Process conditional blocks ({{#if condition}}) - BEFORE loops
  const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
  result = result.replace(ifRegex, (match: string, condition: string, ifTemplate: string) => {
    return data[condition] ? ifTemplate : '';
  });

  // Process simple loops
  const loopRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  result = result.replace(loopRegex, (match: string, arrayName: string, loopTemplate: string) => {
    const array = data[arrayName];
    if (Array.isArray(array)) {
      return array.map(item => {
        let itemResult = loopTemplate;
        
        // Replace item properties
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{{\\s*this\\.${key}\\s*}}`, 'g');
          itemResult = itemResult.replace(regex, String(value));
        });
        
        // Handle repeat within loops (for star ratings)
        const itemRepeatRegex = /{{#repeat\s+(\w+)}}([\s\S]*?){{\/repeat}}/g;
        itemResult = itemResult.replace(itemRepeatRegex, (m: string, cv: string, rt: string) => {
          const count = item[cv] || 0;
          return Array(count).fill(rt).join('');
        });
        
        return itemResult;
      }).join('');
    }
    return '';
  });

  // Replace remaining simple variables (outside loops) - LAST
  Object.entries(data).forEach(([key, value]) => {
    // Skip arrays and complex objects
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return;
    }
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  });

  return result;
}

/**
 * Evaluate condition against item
 */
export function evaluateCondition(
  item: any,
  field: string,
  operator: string,
  value: any
): boolean {
  const fieldValue = item[field];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'contains':
      return String(fieldValue).includes(String(value));
    case 'greaterThan':
      return Number(fieldValue) > Number(value);
    case 'lessThan':
      return Number(fieldValue) < Number(value);
    case 'exists':
      return fieldValue !== null && fieldValue !== undefined;
    default:
      return true;
  }
}

/**
 * Apply all conditions to item
 */
export function evaluateAllConditions(
  item: any,
  conditions?: Array<{ field: string; operator: string; value: any; logic?: 'AND' | 'OR' }>
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition, index) => {
    const result = evaluateCondition(item, condition.field, condition.operator, condition.value);
    
    // Handle OR logic
    if (index > 0 && conditions[index - 1]?.logic === 'OR') {
      return result;
    }
    
    return result;
  });
}
