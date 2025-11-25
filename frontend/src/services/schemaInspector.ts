/**
 * Schema Inspector Service - Frontend
 * Lấy thông tin về database schema để phục vụ mapping
 */

import apolloClient from '@/lib/apollo-client';
import { gql } from '@apollo/client';

export interface FieldInfo {
  name: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  hasDefaultValue: boolean;
  relationName?: string;
  isList?: boolean;
}

export interface ModelSchema {
  name: string;
  fields: FieldInfo[];
  primaryKey?: string;
}

export interface MappingValidation {
  valid: boolean;
  errors: string[];
}

class SchemaInspectorService {
  /**
   * Lấy danh sách tất cả models
   */
  async getAllModels(): Promise<string[]> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query GetAllModels {
            getAllModels
          }
        `,
        fetchPolicy: 'network-only',
      });

      return data.getAllModels || [];
    } catch (error) {
      console.error('[SchemaInspector] Error getting models:', error);
      return [];
    }
  }

  /**
   * Lấy schema chi tiết của model
   */
  async getModelSchema(modelName: string): Promise<ModelSchema | null> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query GetModelSchema($modelName: String!) {
            getModelSchema(modelName: $modelName)
          }
        `,
        variables: { modelName },
        fetchPolicy: 'network-only',
      });

      return data.getModelSchema;
    } catch (error) {
      console.error(`[SchemaInspector] Error getting schema for ${modelName}:`, error);
      return null;
    }
  }

  /**
   * Lấy các fields có thể map
   */
  async getMappableFields(modelName: string): Promise<FieldInfo[]> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query GetMappableFields($modelName: String!) {
            getMappableFields(modelName: $modelName)
          }
        `,
        variables: { modelName },
        fetchPolicy: 'network-only',
      });

      return data.getMappableFields || [];
    } catch (error) {
      console.error(`[SchemaInspector] Error getting mappable fields for ${modelName}:`, error);
      return [];
    }
  }

  /**
   * Lấy required fields
   */
  async getRequiredFields(modelName: string): Promise<string[]> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query GetRequiredFields($modelName: String!) {
            getRequiredFields(modelName: $modelName)
          }
        `,
        variables: { modelName },
        fetchPolicy: 'network-only',
      });

      return data.getRequiredFields || [];
    } catch (error) {
      console.error(`[SchemaInspector] Error getting required fields for ${modelName}:`, error);
      return [];
    }
  }

  /**
   * Suggest mapping tự động
   */
  async suggestMapping(
    sourceFields: string[],
    modelName: string
  ): Promise<Record<string, string>> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query SuggestMapping($sourceFields: [String!]!, $modelName: String!) {
            suggestMapping(sourceFields: $sourceFields, modelName: $modelName)
          }
        `,
        variables: { sourceFields, modelName },
        fetchPolicy: 'network-only',
      });

      return data.suggestMapping || {};
    } catch (error) {
      console.error('[SchemaInspector] Error suggesting mapping:', error);
      return {};
    }
  }

  /**
   * Validate mapping configuration
   */
  async validateMapping(
    modelName: string,
    mapping: Record<string, string>
  ): Promise<MappingValidation> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query ValidateMapping($modelName: String!, $mapping: JSON!) {
            validateMapping(modelName: $modelName, mapping: $mapping)
          }
        `,
        variables: { modelName, mapping },
        fetchPolicy: 'network-only',
      });

      return data.validateMapping || { valid: false, errors: ['Unknown error'] };
    } catch (error) {
      console.error('[SchemaInspector] Error validating mapping:', error);
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
      };
    }
  }

  /**
   * Format field type cho hiển thị
   */
  formatFieldType(field: FieldInfo): string {
    let typeStr = field.type;

    if (field.isList) {
      typeStr += '[]';
    }

    if (field.isRequired && !field.hasDefaultValue) {
      typeStr += ' *';
    }

    if (field.isUnique) {
      typeStr += ' (unique)';
    }

    return typeStr;
  }

  /**
   * Format field display name
   */
  formatFieldName(field: FieldInfo): string {
    let name = field.name;

    if (field.isId) {
      name += ' 🔑';
    }

    return name;
  }
}

export default new SchemaInspectorService();
