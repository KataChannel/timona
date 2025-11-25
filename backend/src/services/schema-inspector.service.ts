import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Schema Inspector Service
 * Lấy thông tin về các model và fields trong database
 * Phục vụ cho tính năng drag-drop mapping
 */

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

@Injectable()
export class SchemaInspectorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả models trong database
   */
  async getAllModels(): Promise<string[]> {
    try {
      // Lấy từ Prisma DMMF (Data Model Meta Format)
      const dmmf = Prisma.dmmf;
      const models = dmmf.datamodel.models || [];
      
      console.log('[SchemaInspector] Found models:', models.map(m => m.name));
      
      return models.map((model) => model.name);
    } catch (error) {
      console.error('[SchemaInspector] Error getting models:', error);
      return [];
    }
  }

  /**
   * Lấy schema chi tiết của một model
   */
  async getModelSchema(modelName: string): Promise<ModelSchema | null> {
    try {
      const dmmf = Prisma.dmmf;
      const models = dmmf.datamodel.models || [];
      const model = models.find((m) => m.name.toLowerCase() === modelName.toLowerCase());

      if (!model) {
        console.warn(`[SchemaInspector] Model ${modelName} not found`);
        return null;
      }

      const fields: FieldInfo[] = model.fields.map((field) => ({
        name: field.name,
        type: this.mapFieldType(field.type, field.kind),
        isRequired: field.isRequired,
        isUnique: field.isUnique || false,
        isId: field.isId || false,
        hasDefaultValue: !!field.default,
        relationName: field.relationName,
        isList: field.isList || false,
      }));

      // Tìm primary key
      const primaryKeyField = fields.find(f => f.isId);

      return {
        name: model.name,
        fields,
        primaryKey: primaryKeyField?.name,
      };
    } catch (error) {
      console.error(`[SchemaInspector] Error getting schema for ${modelName}:`, error);
      return null;
    }
  }

  /**
   * Lấy chỉ các fields có thể map (không phải relation, không phải auto-generated)
   */
  async getMappableFields(modelName: string): Promise<FieldInfo[]> {
    const schema = await this.getModelSchema(modelName);
    if (!schema) {
      return [];
    }

    // Filter các fields có thể map
    return schema.fields.filter(field => {
      // Loại bỏ relations
      if (field.relationName) {
        return false;
      }

      // Loại bỏ auto-generated fields (trừ khi cần map thủ công)
      if (field.isId && field.hasDefaultValue) {
        return false;
      }

      // Loại bỏ timestamps tự động (createdAt, updatedAt)
      if (['createdAt', 'updatedAt'].includes(field.name) && field.hasDefaultValue) {
        return false;
      }

      return true;
    });
  }

  /**
   * Lấy required fields của model
   */
  async getRequiredFields(modelName: string): Promise<string[]> {
    const schema = await this.getModelSchema(modelName);
    if (!schema) {
      return [];
    }

    return schema.fields
      .filter(f => f.isRequired && !f.hasDefaultValue && !f.relationName)
      .map(f => f.name);
  }

  /**
   * Suggest mapping dựa trên tên field
   */
  suggestMapping(sourceFields: string[], targetFields: FieldInfo[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    sourceFields.forEach(sourceField => {
      const normalizedSource = this.normalizeFieldName(sourceField);

      // Tìm exact match
      let targetField = targetFields.find(
        tf => this.normalizeFieldName(tf.name) === normalizedSource
      );

      // Nếu không có exact match, tìm similar match
      if (!targetField) {
        targetField = targetFields.find(tf => {
          const normalizedTarget = this.normalizeFieldName(tf.name);
          return (
            normalizedTarget.includes(normalizedSource) ||
            normalizedSource.includes(normalizedTarget)
          );
        });
      }

      if (targetField) {
        mapping[sourceField] = targetField.name;
      }
    });

    return mapping;
  }

  /**
   * Validate mapping configuration
   */
  async validateMapping(
    modelName: string,
    mapping: Record<string, string>
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const schema = await this.getModelSchema(modelName);

    if (!schema) {
      errors.push(`Model ${modelName} not found`);
      return { valid: false, errors };
    }

    const requiredFields = await this.getRequiredFields(modelName);
    const mappedTargetFields = Object.values(mapping);

    // Check required fields được map
    requiredFields.forEach(required => {
      if (!mappedTargetFields.includes(required)) {
        errors.push(`Required field "${required}" is not mapped`);
      }
    });

    // Check target fields tồn tại
    Object.entries(mapping).forEach(([source, target]) => {
      const field = schema.fields.find(f => f.name === target);
      if (!field) {
        errors.push(`Target field "${target}" does not exist in model ${modelName}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Map field type từ Prisma sang readable type
   */
  private mapFieldType(type: string, kind: string): string {
    if (kind === 'object') {
      return 'relation';
    }

    const typeMap: Record<string, string> = {
      String: 'text',
      Int: 'number',
      Float: 'decimal',
      Boolean: 'boolean',
      DateTime: 'datetime',
      Json: 'json',
      Bytes: 'binary',
    };

    return typeMap[type] || type.toLowerCase();
  }

  /**
   * Normalize field name để so sánh
   */
  private normalizeFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[_\s-]/g, '')
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd');
  }
}
