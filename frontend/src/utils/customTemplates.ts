import { BlockTemplate } from '@/data/blockTemplates';
import { gql, ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { PageBlock } from '@/types/page-builder';
import {
  GET_MY_CUSTOM_TEMPLATES,
  DUPLICATE_CUSTOM_TEMPLATE,
  SHARE_TEMPLATE,
  UNSHARE_TEMPLATE,
  UPDATE_TEMPLATE_PUBLICITY,
  INCREMENT_TEMPLATE_USAGE,
} from '@/lib/graphql/custom-templates.graphql';

/**
 * Unified Custom Templates Module
 * 
 * This module provides complete database operations for user-created templates via GraphQL.
 * Features:
 * - Basic CRUD operations (Create, Read, Update, Delete)
 * - Advanced operations (Duplicate, Share, Public/Private)
 * - Usage tracking and statistics
 * - Service class and convenience functions
 * - Backward compatibility with legacy localStorage functions
 * 
 * @module utils/customTemplates
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Custom template with database metadata
 */
export interface CustomTemplate extends BlockTemplate {
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

/**
 * Template with full metadata and sharing info
 */
export interface TemplateBlocksData {
  id: string;
  name: string;
  description: string;
  category: string;
  blocks: PageBlock[];
  thumbnail?: string;
  isPublic: boolean;
  isArchived: boolean;
  usageCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating a template
 */
export interface CreateTemplateInput {
  name: string;
  description: string;
  category: string;
  blocks: PageBlock[];
  thumbnail?: string;
}

/**
 * Input for updating a template
 */
export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  category?: string;
  blocks?: PageBlock[];
  thumbnail?: string;
  isArchived?: boolean;
}

/**
 * Statistics for custom templates
 */
export interface TemplateStats {
  total: number;
  byCategory: Record<string, number>;
  formattedSize?: string;
}

/**
 * Template operation response
 */
interface TemplateResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// GraphQL QUERIES & MUTATIONS
// ============================================================================

/**
 * Fetch all templates for a user
 */
export const GET_CUSTOM_TEMPLATES = gql`
  query GetCustomTemplates($userId: String!) {
    customTemplates(userId: $userId) {
      id
      name
      description
      category
      blocks
      thumbnail
      isCustom
      createdAt
      updatedAt
    }
  }
`;

/**
 * Fetch a single template by ID
 */
export const GET_CUSTOM_TEMPLATE = gql`
  query GetCustomTemplate($id: String!) {
    customTemplate(id: $id) {
      id
      name
      description
      category
      blocks
      thumbnail
      isCustom
      createdAt
      updatedAt
    }
  }
`;

/**
 * Create a new custom template
 */
export const CREATE_CUSTOM_TEMPLATE = gql`
  mutation CreateCustomTemplate($input: CreateTemplateInput!) {
    createCustomTemplate(input: $input) {
      id
      name
      description
      category
      blocks
      thumbnail
      isCustom
      createdAt
      updatedAt
    }
  }
`;

/**
 * Update an existing template
 */
export const UPDATE_CUSTOM_TEMPLATE = gql`
  mutation UpdateCustomTemplate($id: String!, $input: UpdateTemplateInput!) {
    updateCustomTemplate(id: $id, input: $input) {
      id
      name
      description
      category
      blocks
      thumbnail
      isCustom
      createdAt
      updatedAt
    }
  }
`;

/**
 * Delete a template
 */
export const DELETE_CUSTOM_TEMPLATE = gql`
  mutation DeleteCustomTemplate($id: String!) {
    deleteCustomTemplate(id: $id) {
      success
      message
    }
  }
`;

/**
 * Get all custom templates with advanced filtering
 */
export const GET_MY_CUSTOM_TEMPLATES_QUERY = GET_MY_CUSTOM_TEMPLATES;

// ============================================================================
// DATABASE OPERATIONS (Low-level)
// ============================================================================

// Basic CRUD operations moved below service class for organization

// ============================================================================
// CUSTOM TEMPLATES SERVICE CLASS
// ============================================================================

/**
 * Service class for managing custom templates
 * Provides object-oriented interface for template operations
 */
export class CustomTemplatesService {
  constructor(private client: ApolloClient<NormalizedCacheObject>) {}

  /**
   * Get all custom templates for current user
   */
  async getMyTemplates(category?: string, archived?: boolean): Promise<TemplateBlocksData[]> {
    try {
      const { data } = await this.client.query({
        query: GET_MY_CUSTOM_TEMPLATES,
        variables: { category, archived },
        fetchPolicy: 'network-only',
      });

      return data.getMyCustomTemplates || [];
    } catch (error) {
      console.error('[CustomTemplates] Error fetching custom templates:', error);
      throw error;
    }
  }

  /**
   * Get single custom template with blocks
   */
  async getTemplate(id: string): Promise<TemplateBlocksData | null> {
    try {
      const { data } = await this.client.query({
        query: GET_CUSTOM_TEMPLATE,
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      return data.getCustomTemplate || null;
    } catch (error) {
      console.error('[CustomTemplates] Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Create new custom template
   */
  async createTemplate(input: CreateTemplateInput): Promise<TemplateBlocksData> {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_CUSTOM_TEMPLATE,
        variables: { input },
        refetchQueries: [
          {
            query: GET_MY_CUSTOM_TEMPLATES,
            variables: { archived: false },
          },
        ],
      });

      return data.createCustomTemplate;
    } catch (error) {
      console.error('[CustomTemplates] Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update existing template
   */
  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<TemplateBlocksData> {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_CUSTOM_TEMPLATE,
        variables: { id, input },
      });

      return data.updateCustomTemplate;
    } catch (error) {
      console.error('[CustomTemplates] Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { data } = await this.client.mutate({
        mutation: DELETE_CUSTOM_TEMPLATE,
        variables: { id },
        refetchQueries: [
          {
            query: GET_MY_CUSTOM_TEMPLATES,
            variables: { archived: false },
          },
        ],
      });

      return data.deleteCustomTemplate.success;
    } catch (error) {
      console.error('[CustomTemplates] Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(id: string, newName?: string): Promise<TemplateBlocksData> {
    try {
      const { data } = await this.client.mutate({
        mutation: DUPLICATE_CUSTOM_TEMPLATE,
        variables: { id, newName },
        refetchQueries: [
          {
            query: GET_MY_CUSTOM_TEMPLATES,
            variables: { archived: false },
          },
        ],
      });

      return data.duplicateCustomTemplate;
    } catch (error) {
      console.error('[CustomTemplates] Error duplicating template:', error);
      throw error;
    }
  }

  /**
   * Share template with other users
   */
  async shareTemplate(templateId: string, userIds: string[]): Promise<any> {
    try {
      const { data } = await this.client.mutate({
        mutation: SHARE_TEMPLATE,
        variables: { templateId, userIds },
      });

      return data.shareTemplate;
    } catch (error) {
      console.error('[CustomTemplates] Error sharing template:', error);
      throw error;
    }
  }

  /**
   * Unshare template from user
   */
  async unshareTemplate(templateId: string, userId: string): Promise<boolean> {
    try {
      const { data } = await this.client.mutate({
        mutation: UNSHARE_TEMPLATE,
        variables: { templateId, userId },
      });

      return data.unshareTemplate.success;
    } catch (error) {
      console.error('[CustomTemplates] Error unsharing template:', error);
      throw error;
    }
  }

  /**
   * Update template publicity (public/private)
   */
  async updatePublicity(id: string, isPublic: boolean): Promise<TemplateBlocksData> {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_TEMPLATE_PUBLICITY,
        variables: { id, isPublic },
      });

      return data.updateTemplatePublicity;
    } catch (error) {
      console.error('[CustomTemplates] Error updating template publicity:', error);
      throw error;
    }
  }

  /**
   * Track template usage
   */
  async trackUsage(id: string): Promise<number> {
    try {
      const { data } = await this.client.mutate({
        mutation: INCREMENT_TEMPLATE_USAGE,
        variables: { id },
      });

      return data.incrementTemplateUsage.usageCount;
    } catch (error) {
      console.error('[CustomTemplates] Error tracking template usage:', error);
      throw error;
    }
  }
}

/**
 * Fetch all custom templates for a user
 * 
 * @param client - Apollo Client instance
 * @param userId - User ID to fetch templates for
 * @returns Array of custom templates, empty array on error
 * 
 * @example
 * const templates = await getCustomTemplatesFromDB(client, userId);
 */
export async function getCustomTemplatesFromDB(
  client: ApolloClient<NormalizedCacheObject> | any,
  userId: string
): Promise<CustomTemplate[]> {
  try {
    if (!client) {
      throw new Error('Apollo Client is required');
    }

    const { data } = await client.query({
      query: GET_CUSTOM_TEMPLATES,
      variables: { userId },
    });

    return data?.customTemplates || [];
  } catch (error) {
    console.error('[CustomTemplates] Error loading templates from database:', error);
    return [];
  }
}

/**
 * Fetch a single custom template by ID
 * 
 * @param client - Apollo Client instance
 * @param id - Template ID to fetch
 * @returns Custom template or null if not found
 * 
 * @example
 * const template = await getCustomTemplateFromDB(client, templateId);
 */
export async function getCustomTemplateFromDB(
  client: ApolloClient<NormalizedCacheObject> | any,
  id: string
): Promise<CustomTemplate | null> {
  try {
    if (!client) {
      throw new Error('Apollo Client is required');
    }

    const { data } = await client.query({
      query: GET_CUSTOM_TEMPLATE,
      variables: { id },
    });

    return data?.customTemplate || null;
  } catch (error) {
    console.error('[CustomTemplates] Error loading template from database:', error);
    return null;
  }
}

/**
 * Create and save a new custom template to database
 * 
 * @param client - Apollo Client instance
 * @param template - Template data (name, description, category, blocks)
 * @param userId - User ID creating the template
 * @returns Created template with ID and timestamps, or null on error
 * 
 * @example
 * const newTemplate = await saveCustomTemplateToDB(client, {
 *   name: 'My Template',
 *   description: 'Template description',
 *   category: 'hero',
 *   blocks: []
 * }, userId);
 */
export async function saveCustomTemplateToDB(
  client: ApolloClient<NormalizedCacheObject> | any,
  template: Omit<BlockTemplate, 'id' | 'thumbnail'>,
  userId: string
): Promise<CustomTemplate | null> {
  try {
    if (!client) {
      throw new Error('Apollo Client is required');
    }

    if (!template.name || !template.category) {
      throw new Error('Template name and category are required');
    }

    const { data } = await client.mutate({
      mutation: CREATE_CUSTOM_TEMPLATE,
      variables: {
        input: {
          name: template.name,
          description: template.description || '',
          category: template.category,
          blocks: template.blocks || [],
          userId,
        },
      },
      refetchQueries: [
        {
          query: GET_CUSTOM_TEMPLATES,
          variables: { userId },
        },
      ],
    });

    return data?.createCustomTemplate || null;
  } catch (error: any) {
    console.error('[CustomTemplates] Error saving template to database:', error?.message || error);
    throw error;
  }
}

/**
 * Update an existing custom template
 * 
 * @param client - Apollo Client instance
 * @param id - Template ID to update
 * @param updates - Partial template data to update
 * @param userId - User ID (for refetching)
 * @returns Updated template or null on error
 * 
 * @example
 * const updated = await updateCustomTemplateInDB(
 *   client,
 *   templateId,
 *   { name: 'New Name' },
 *   userId
 * );
 */
export async function updateCustomTemplateInDB(
  client: ApolloClient<NormalizedCacheObject> | any,
  id: string,
  updates: Partial<Omit<BlockTemplate, 'id' | 'thumbnail'>>,
  userId: string
): Promise<CustomTemplate | null> {
  try {
    if (!client) {
      throw new Error('Apollo Client is required');
    }

    if (!id) {
      throw new Error('Template ID is required');
    }

    const { data } = await client.mutate({
      mutation: UPDATE_CUSTOM_TEMPLATE,
      variables: {
        id,
        input: updates,
      },
      refetchQueries: [
        {
          query: GET_CUSTOM_TEMPLATES,
          variables: { userId },
        },
      ],
    });

    return data?.updateCustomTemplate || null;
  } catch (error: any) {
    console.error('[CustomTemplates] Error updating template in database:', error?.message || error);
    throw error;
  }
}

/**
 * Delete a custom template from database
 * 
 * @param client - Apollo Client instance
 * @param id - Template ID to delete
 * @param userId - User ID (for refetching)
 * @returns True if deletion was successful
 * 
 * @example
 * const success = await deleteCustomTemplateFromDB(client, templateId, userId);
 */
export async function deleteCustomTemplateFromDB(
  client: ApolloClient<NormalizedCacheObject> | any,
  id: string,
  userId: string
): Promise<boolean> {
  try {
    if (!client) {
      throw new Error('Apollo Client is required');
    }

    if (!id) {
      throw new Error('Template ID is required');
    }

    const { data } = await client.mutate({
      mutation: DELETE_CUSTOM_TEMPLATE,
      variables: { id },
      refetchQueries: [
        {
          query: GET_CUSTOM_TEMPLATES,
          variables: { userId },
        },
      ],
    });

    return data?.deleteCustomTemplate?.success || false;
  } catch (error: any) {
    console.error('[CustomTemplates] Error deleting template from database:', error?.message || error);
    throw error;
  }
}

/**
 * Get statistics about user's custom templates
 * 
 * @param client - Apollo Client instance
 * @param userId - User ID to get stats for
 * @returns Template statistics including count and breakdown by category
 * 
 * @example
 * const stats = await getCustomTemplateStatsFromDB(client, userId);
 * console.log(`Total templates: ${stats.total}`);
 * console.log(`By category:`, stats.byCategory);
 */
export async function getCustomTemplateStatsFromDB(
  client: ApolloClient<NormalizedCacheObject> | any,
  userId: string
): Promise<TemplateStats> {
  try {
    const templates = await getCustomTemplatesFromDB(client, userId);

    const byCategory = templates.reduce(
      (acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: templates.length,
      byCategory,
    };
  } catch (error) {
    console.error('[CustomTemplates] Error getting template stats from database:', error);
    return {
      total: 0,
      byCategory: {},
    };
  }
}

// ============================================================================
// LEGACY STORAGE-BASED FUNCTIONS (for backward compatibility)
// ============================================================================

/**
 * Initialize the service with Apollo client
 * @deprecated Use CustomTemplatesService class directly
 */
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

export function initCustomTemplatesService(client: ApolloClient<NormalizedCacheObject>) {
  apolloClient = client;
}

/**
 * Get service instance (requires initialization)
 * @deprecated Use CustomTemplatesService class directly
 */
function getService(): CustomTemplatesService {
  if (!apolloClient) {
    throw new Error('CustomTemplatesService not initialized. Call initCustomTemplatesService() first.');
  }
  return new CustomTemplatesService(apolloClient);
}

/**
 * Convenience function - Get all templates
 * @deprecated Use CustomTemplatesService or getCustomTemplatesFromDB instead
 */
export async function getCustomTemplates(category?: string, archived?: boolean): Promise<TemplateBlocksData[]> {
  return getService().getMyTemplates(category, archived);
}

/**
 * Convenience function - Get single template
 * @deprecated Use CustomTemplatesService or getCustomTemplateFromDB instead
 */
export async function getCustomTemplate(id: string): Promise<TemplateBlocksData | null> {
  return getService().getTemplate(id);
}

/**
 * Convenience function - Create template
 * @deprecated Use CustomTemplatesService or saveCustomTemplateToDB instead
 */
export async function saveCustomTemplate(input: CreateTemplateInput): Promise<TemplateBlocksData> {
  return getService().createTemplate(input);
}

/**
 * Convenience function - Update template
 * @deprecated Use CustomTemplatesService or updateCustomTemplateInDB instead
 */
export async function updateCustomTemplate(id: string, input: UpdateTemplateInput): Promise<TemplateBlocksData> {
  return getService().updateTemplate(id, input);
}

/**
 * Convenience function - Delete template
 * @deprecated Use CustomTemplatesService or deleteCustomTemplateFromDB instead
 */
export async function deleteCustomTemplate(id: string): Promise<boolean> {
  return getService().deleteTemplate(id);
}

/**
 * Convenience function - Duplicate template
 * @deprecated Use CustomTemplatesService instead
 */
export async function duplicateCustomTemplate(id: string, newName?: string): Promise<TemplateBlocksData> {
  return getService().duplicateTemplate(id, newName);
}

/**
 * Convenience function - Share template
 * @deprecated Use CustomTemplatesService instead
 */
export async function shareTemplate(templateId: string, userIds: string[]): Promise<any> {
  return getService().shareTemplate(templateId, userIds);
}

/**
 * Convenience function - Unshare template
 * @deprecated Use CustomTemplatesService instead
 */
export async function unshareTemplate(templateId: string, userId: string): Promise<boolean> {
  return getService().unshareTemplate(templateId, userId);
}

/**
 * Convenience function - Update template publicity
 * @deprecated Use CustomTemplatesService instead
 */
export async function updateTemplatePublicity(id: string, isPublic: boolean): Promise<TemplateBlocksData> {
  return getService().updatePublicity(id, isPublic);
}

/**
 * Convenience function - Track template usage
 * @deprecated Use CustomTemplatesService instead
 */
export async function incrementTemplateUsage(id: string): Promise<number> {
  return getService().trackUsage(id);
}

// ============================================================================
// LEGACY LOCALSTORAGE FUNCTIONS (for backward compatibility)
// ============================================================================
export function getCustomTemplateStats(): TemplateStats {
  try {
    const stored = localStorage.getItem('customTemplates');
    if (!stored) return { total: 0, byCategory: {} };

    const templates = JSON.parse(stored) as CustomTemplate[];
    const byCategory = templates.reduce(
      (acc, template) => {
        acc[template.category] = (acc[template.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalSize = new Blob([stored]).size;

    return {
      total: templates.length,
      byCategory,
      formattedSize: formatBytes(totalSize),
    };
  } catch (error) {
    console.error('[CustomTemplates] Error getting template stats:', error);
    return { total: 0, byCategory: {} };
  }
}

/**
 * Clear all custom templates from localStorage
 * @deprecated Use database methods for production
 */
export function clearCustomTemplates(): void {
  try {
    localStorage.removeItem('customTemplates');
    console.log('[CustomTemplates] All custom templates cleared');
  } catch (error) {
    console.error('[CustomTemplates] Error clearing custom templates:', error);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate template data
 * @param template - Template to validate
 * @returns True if valid, false otherwise
 */
export function validateTemplate(
  template: Partial<BlockTemplate>
): boolean {
  return !!(
    template.name &&
    template.name.trim().length > 0 &&
    template.category &&
    Array.isArray(template.blocks)
  );
}

/**
 * Create a summary of template sizes
 * @param templates - Array of templates
 * @returns Summary with sizes and counts
 */
export function createTemplateSummary(
  templates: CustomTemplate[]
): {
  count: number;
  categories: Record<string, number>;
  approximateSize: string;
} {
  const summary = templates.reduce(
    (acc, template) => {
      acc.categories[template.category] = (acc.categories[template.category] || 0) + 1;
      return acc;
    },
    { categories: {} as Record<string, number> }
  );

  const totalSize = new Blob([JSON.stringify(templates)]).size;

  return {
    count: templates.length,
    categories: summary.categories,
    approximateSize: formatBytes(totalSize),
  };
}
