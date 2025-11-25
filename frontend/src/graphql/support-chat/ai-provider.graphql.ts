import { gql } from '@apollo/client';

// ==================== QUERIES ====================

export const GET_AI_PROVIDERS = gql`
  query GetAIProviders {
    getAIProviders {
      id
      provider
      name
      apiKey
      model
      temperature
      maxTokens
      systemPrompt
      isActive
      priority
      isDefault
      description
      tags
      totalRequests
      successCount
      failureCount
      avgResponseTime
      lastUsedAt
      lastError
      createdAt
      updatedAt
      createdBy
      creator {
        id
        username
        avatar
      }
    }
  }
`;

export const GET_AI_PROVIDER = gql`
  query GetAIProvider($id: String!) {
    getAIProvider(id: $id) {
      id
      provider
      name
      apiKey
      model
      temperature
      maxTokens
      systemPrompt
      isActive
      priority
      isDefault
      description
      tags
      totalRequests
      successCount
      failureCount
      avgResponseTime
      lastUsedAt
      lastError
      createdAt
      updatedAt
      createdBy
      creator {
        id
        username
        avatar
      }
    }
  }
`;

export const GET_ACTIVE_AI_PROVIDER = gql`
  query GetActiveAIProvider($providerType: AIProviderType) {
    getActiveAIProvider(providerType: $providerType) {
      id
      provider
      name
      model
      isActive
      priority
      totalRequests
      successCount
      failureCount
      avgResponseTime
      lastUsedAt
    }
  }
`;

export const GET_AI_PROVIDER_STATS = gql`
  query GetAIProviderStats {
    getAIProviderStats {
      totalProviders
      activeProviders
      totalRequests
      successRate
      avgResponseTime
    }
  }
`;

// ==================== MUTATIONS ====================

export const CREATE_AI_PROVIDER = gql`
  mutation CreateAIProvider($input: CreateAIProviderInput!) {
    createAIProvider(input: $input) {
      id
      provider
      name
      model
      isActive
      priority
      isDefault
      createdAt
    }
  }
`;

export const UPDATE_AI_PROVIDER = gql`
  mutation UpdateAIProvider($id: String!, $input: UpdateAIProviderInput!) {
    updateAIProvider(id: $id, input: $input) {
      id
      provider
      name
      model
      temperature
      maxTokens
      systemPrompt
      isActive
      priority
      isDefault
      description
      tags
      updatedAt
    }
  }
`;

export const DELETE_AI_PROVIDER = gql`
  mutation DeleteAIProvider($id: String!) {
    deleteAIProvider(id: $id)
  }
`;

export const TEST_AI_PROVIDER = gql`
  mutation TestAIProvider($input: TestAIProviderInput!) {
    testAIProvider(input: $input) {
      success
      response
      error
      responseTime
      tokensUsed
    }
  }
`;

export const SET_DEFAULT_AI_PROVIDER = gql`
  mutation SetDefaultAIProvider($id: String!) {
    setDefaultAIProvider(id: $id) {
      id
      provider
      name
      isDefault
      updatedAt
    }
  }
`;

export const TOGGLE_AI_PROVIDER_STATUS = gql`
  mutation ToggleAIProviderStatus($id: String!, $isActive: Boolean!) {
    toggleAIProviderStatus(id: $id, isActive: $isActive) {
      id
      provider
      name
      isActive
      updatedAt
    }
  }
`;

// ==================== TYPES ====================

export enum AIProviderType {
  CHATGPT = 'CHATGPT',
  GROK = 'GROK',
  GEMINI = 'GEMINI',
}

export interface AIProvider {
  id: string;
  provider: AIProviderType;
  name: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  isActive: boolean;
  priority: number;
  isDefault: boolean;
  description?: string;
  tags?: string[];
  totalRequests: number;
  successCount: number;
  failureCount: number;
  avgResponseTime?: number;
  lastUsedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  creator?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

export interface AIProviderStats {
  totalProviders: number;
  activeProviders: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
}

export interface AIProviderTestResult {
  success: boolean;
  response?: string;
  error?: string;
  responseTime: number;
  tokensUsed: number;
}
