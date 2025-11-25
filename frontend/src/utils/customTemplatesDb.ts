import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GET_MY_CUSTOM_TEMPLATES,
  GET_CUSTOM_TEMPLATE,
  CREATE_CUSTOM_TEMPLATE,
  UPDATE_CUSTOM_TEMPLATE,
  DELETE_CUSTOM_TEMPLATE,
  DUPLICATE_CUSTOM_TEMPLATE,
  SHARE_TEMPLATE,
  UNSHARE_TEMPLATE,
  UPDATE_TEMPLATE_PUBLICITY,
  INCREMENT_TEMPLATE_USAGE,
} from '@/lib/graphql/custom-templates.graphql';
import { PageBlock } from '@/types/page-builder';

// ============================================================================
// TYPES
// ============================================================================

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

export interface CreateTemplateInput {
  name: string;
  description: string;
  category: string;
  blocks: PageBlock[];
  thumbnail?: string;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  category?: string;
  blocks?: PageBlock[];
  thumbnail?: string;
  isArchived?: boolean;
}

// ============================================================================
// CUSTOM TEMPLATES SERVICE
// ============================================================================

export class CustomTemplatesService {
  constructor(private client: ApolloClient<NormalizedCacheObject>) {}

  /**
   * Get all custom templates for current user
   */
  async getMyTemplates(category?: string, archived?: boolean) {
    try {
      const { data } = await this.client.query({
        query: GET_MY_CUSTOM_TEMPLATES,
        variables: { category, archived },
        fetchPolicy: 'network-only',
      });

      return data.getMyCustomTemplates || [];
    } catch (error) {
      console.error('Error fetching custom templates:', error);
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
      console.error('Error fetching template:', error);
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
      console.error('Error creating template:', error);
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
      console.error('Error updating template:', error);
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
      console.error('Error deleting template:', error);
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
      console.error('Error duplicating template:', error);
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
      console.error('Error sharing template:', error);
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
      console.error('Error unsharing template:', error);
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
      console.error('Error updating template publicity:', error);
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
      console.error('Error tracking template usage:', error);
      throw error;
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS (backward compatibility)
// ============================================================================

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

/**
 * Initialize the service with Apollo client
 */
export function initCustomTemplatesService(client: ApolloClient<NormalizedCacheObject>) {
  apolloClient = client;
}

/**
 * Get service instance (requires initialization)
 */
function getService(): CustomTemplatesService {
  if (!apolloClient) {
    throw new Error('CustomTemplatesService not initialized. Call initCustomTemplatesService() first.');
  }
  return new CustomTemplatesService(apolloClient);
}

// Convenience functions for backward compatibility
export async function getCustomTemplates(category?: string, archived?: boolean) {
  return getService().getMyTemplates(category, archived);
}

export async function getCustomTemplate(id: string) {
  return getService().getTemplate(id);
}

export async function saveCustomTemplate(input: CreateTemplateInput) {
  return getService().createTemplate(input);
}

export async function updateCustomTemplate(id: string, input: UpdateTemplateInput) {
  return getService().updateTemplate(id, input);
}

export async function deleteCustomTemplate(id: string) {
  return getService().deleteTemplate(id);
}

export async function duplicateCustomTemplate(id: string, newName?: string) {
  return getService().duplicateTemplate(id, newName);
}

export async function shareTemplate(templateId: string, userIds: string[]) {
  return getService().shareTemplate(templateId, userIds);
}

export async function unshareTemplate(templateId: string, userId: string) {
  return getService().unshareTemplate(templateId, userId);
}

export async function updateTemplatePublicity(id: string, isPublic: boolean) {
  return getService().updatePublicity(id, isPublic);
}

export async function incrementTemplateUsage(id: string) {
  return getService().trackUsage(id);
}
