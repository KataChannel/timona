/**
 * PageBuilder Template System - Local Storage Management
 * Phase 5.1: Template Data Layer
 */

import { PageTemplate, TemplateStorage, TemplateValidationResult, ValidationError } from '@/types/template';

const STORAGE_KEY = 'pagebuilder_templates';
const STORAGE_VERSION = '1.0.0';

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Get all templates from localStorage
 */
export function getAllTemplates(): PageTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const storage: TemplateStorage = JSON.parse(data);
    
    // Version migration logic here if needed
    if (storage.version !== STORAGE_VERSION) {
      console.warn(`Template storage version mismatch. Expected ${STORAGE_VERSION}, got ${storage.version}`);
    }

    return storage.templates || [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}

/**
 * Save all templates to localStorage
 */
export function saveAllTemplates(templates: PageTemplate[]): boolean {
  try {
    const storage: TemplateStorage = {
      templates,
      lastModified: new Date().toISOString(),
      version: STORAGE_VERSION,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    return true;
  } catch (error) {
    console.error('Error saving templates:', error);
    
    // Check if quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Consider using IndexedDB.');
    }
    
    return false;
  }
}

/**
 * Get a single template by ID
 */
export function getTemplateById(id: string): PageTemplate | null {
  const templates = getAllTemplates();
  return templates.find(t => t.id === id) || null;
}

/**
 * Save a single template (create or update)
 */
export function saveTemplate(template: PageTemplate): boolean {
  const templates = getAllTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  const updatedTemplate = {
    ...template,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Update existing
    templates[existingIndex] = updatedTemplate;
  } else {
    // Create new
    templates.push({
      ...updatedTemplate,
      createdAt: updatedTemplate.createdAt || new Date().toISOString(),
    });
  }

  return saveAllTemplates(templates);
}

/**
 * Delete a template by ID (prevents deletion of default templates)
 */
export function deleteTemplate(id: string): boolean {
  const templates = getAllTemplates();
  const template = templates.find(t => t.id === id);

  if (!template) {
    console.warn(`Template ${id} not found`);
    return false;
  }

  if (template.isDefault) {
    console.warn(`Cannot delete default template: ${template.name}`);
    return false;
  }

  const filtered = templates.filter(t => t.id !== id);
  return saveAllTemplates(filtered);
}

/**
 * Duplicate a template
 */
export function duplicateTemplate(id: string, newName?: string): PageTemplate | null {
  const template = getTemplateById(id);
  if (!template) {
    return null;
  }

  const duplicate: PageTemplate = {
    ...template,
    id: generateTemplateId(),
    name: newName || `${template.name} (Copy)`,
    isDefault: false, // Duplicates are always custom
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (saveTemplate(duplicate)) {
    return duplicate;
  }

  return null;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate template structure
 */
export function validateTemplate(template: PageTemplate): TemplateValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!template.id || template.id.trim() === '') {
    errors.push({ field: 'id', message: 'Template ID is required' });
  }

  if (!template.name || template.name.trim() === '') {
    errors.push({ field: 'name', message: 'Template name is required' });
  }

  if (!template.category) {
    errors.push({ field: 'category', message: 'Template category is required' });
  }

  if (!template.structure || !Array.isArray(template.structure)) {
    errors.push({ field: 'structure', message: 'Template structure must be an array' });
  }

  // Warnings
  if (!template.description || template.description.trim() === '') {
    warnings.push('Template description is recommended');
  }

  if (!template.thumbnail) {
    warnings.push('Template thumbnail is recommended');
  }

  if (template.structure && template.structure.length === 0) {
    warnings.push('Template has no elements');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate imported template data
 */
export function validateImportedTemplate(data: any): TemplateValidationResult {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push({ field: 'root', message: 'Invalid template data format' });
    return { valid: false, errors };
  }

  // Check for required export structure
  if ('template' in data && 'version' in data) {
    // This is an export format
    return validateTemplate(data.template);
  }

  // Assume it's a direct template object
  return validateTemplate(data);
}

// ============================================================================
// Import/Export
// ============================================================================

/**
 * Export template as JSON
 */
export function exportTemplate(template: PageTemplate): string {
  const exportData = {
    template,
    exportedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import template from JSON string
 */
export function importTemplate(jsonString: string): { success: boolean; template?: PageTemplate; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate
    const validation = validateImportedTemplate(data);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors?.map(e => e.message).join(', ') || 'Validation failed',
      };
    }

    // Extract template
    const template: PageTemplate = 'template' in data ? data.template : data;

    // Generate new ID to avoid conflicts
    const importedTemplate: PageTemplate = {
      ...template,
      id: generateTemplateId(),
      isDefault: false, // Imported templates are custom
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to storage
    if (saveTemplate(importedTemplate)) {
      return { success: true, template: importedTemplate };
    } else {
      return { success: false, error: 'Failed to save imported template' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
}

/**
 * Download template as JSON file
 */
export function downloadTemplate(template: PageTemplate): void {
  const json = exportTemplate(template);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate unique template ID
 */
export function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { used: number; total: number; percentage: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;
    const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  } catch (error) {
    return { used: 0, total: 5 * 1024 * 1024, percentage: 0 };
  }
}

/**
 * Clear all templates (dangerous!)
 */
export function clearAllTemplates(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing templates:', error);
    return false;
  }
}

/**
 * Clear PageBuilder cache (pagebuilder_templates localStorage)
 * Used to fix cache issues when templates are updated
 */
export function clearPageBuilderCache(): boolean {
  try {
    // Clear the main storage key
    localStorage.removeItem(STORAGE_KEY);
    
    // Also clear any other related cache keys that might exist
    const keys = Object.keys(localStorage);
    const cacheKeysToRemove = keys.filter(key => 
      key.includes('pagebuilder') || 
      key.includes('template') ||
      key.includes('dynamicblock')
    );
    
    cacheKeysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing PageBuilder cache:', error);
    return false;
  }
}

/**
 * Initialize storage with default templates
 */
export function initializeStorage(defaultTemplates: PageTemplate[]): boolean {
  const existing = getAllTemplates();
  
  // Only initialize if empty
  if (existing.length === 0) {
    return saveAllTemplates(defaultTemplates);
  }
  
  return true;
}
