import { InputType, Field, Int, Float, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { Type } from '@nestjs/common';
import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, IsObject } from 'class-validator';

// Base interfaces for dynamic input types
export interface DynamicFieldConfig {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'id' | 'json' | 'array' | 'object';
  required?: boolean;
  description?: string;
  defaultValue?: any;
  validation?: any;
}

// Generic create input
@InputType()
export class DynamicCreateInput {
  @Field(() => GraphQLJSONObject, { description: 'Dynamic data object for creation' })
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Generic update input
@InputType()
export class DynamicUpdateInput {
  @Field(() => ID, { description: 'ID of the record to update' })
  @IsString()
  id: string;

  @Field(() => GraphQLJSONObject, { description: 'Dynamic data object for update' })
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Generic filter input
@InputType()
export class DynamicFilterInput {
  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Filter conditions' })
  @IsOptional()
  @IsObject()
  where?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Sort order' })
  @IsOptional()
  @IsObject()
  orderBy?: Record<string, any>;

  @Field(() => Int, { nullable: true, description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @Field(() => Int, { nullable: true, description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  take?: number;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Generic bulk create input
@InputType()
export class DynamicBulkCreateInput {
  @Field(() => [GraphQLJSONObject], { description: 'Array of data objects for bulk creation' })
  @IsArray()
  data: Record<string, any>[];

  @Field(() => Boolean, { nullable: true, defaultValue: false, description: 'Skip duplicate entries' })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Generic bulk update input
@InputType()
export class DynamicBulkUpdateInput {
  @Field(() => GraphQLJSONObject, { description: 'Conditions to match records for update' })
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject, { description: 'Data to update matching records' })
  @IsObject()
  data: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Generic bulk delete input
@InputType()
export class DynamicBulkDeleteInput {
  @Field(() => GraphQLJSONObject, { description: 'Conditions to match records for deletion' })
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Upsert input
@InputType()
export class DynamicUpsertInput {
  @Field(() => GraphQLJSONObject, { description: 'Unique conditions to find existing record' })
  @IsObject()
  where: Record<string, any>;

  @Field(() => GraphQLJSONObject, { description: 'Data for creating new record if not exists' })
  @IsObject()
  create: Record<string, any>;

  @Field(() => GraphQLJSONObject, { description: 'Data for updating existing record if exists' })
  @IsObject()
  update: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Select specific fields' })
  @IsOptional()
  @IsObject()
  select?: Record<string, any>;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Include related data' })
  @IsOptional()
  @IsObject()
  include?: Record<string, any>;
}

// Pagination input
@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 0, description: 'Number of records to skip' })
  @IsOptional()
  @IsNumber()
  skip?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10, description: 'Number of records to take' })
  @IsOptional()
  @IsNumber()
  take?: number;
}

// Sort input
@InputType()
export class SortInput {
  @Field({ description: 'Field name to sort by' })
  @IsString()
  field: string;

  @Field({ nullable: true, defaultValue: 'asc', description: 'Sort direction' })
  @IsOptional()
  @IsString()
  direction?: 'asc' | 'desc';
}

// Advanced filter operators
@InputType()
export class FilterOperatorsInput {
  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Equals' })
  @IsOptional()
  equals?: any;

  @Field(() => [GraphQLJSONObject], { nullable: true, description: 'In array' })
  @IsOptional()
  @IsArray()
  in?: any[];

  @Field(() => [GraphQLJSONObject], { nullable: true, description: 'Not in array' })
  @IsOptional()
  @IsArray()
  notIn?: any[];

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Less than' })
  @IsOptional()
  lt?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Less than or equal' })
  @IsOptional()
  lte?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Greater than' })
  @IsOptional()
  gt?: any;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Greater than or equal' })
  @IsOptional()
  gte?: any;

  @Field(() => String, { nullable: true, description: 'Contains text (case sensitive)' })
  @IsOptional()
  @IsString()
  contains?: string;

  @Field(() => String, { nullable: true, description: 'Starts with text' })
  @IsOptional()
  @IsString()
  startsWith?: string;

  @Field(() => String, { nullable: true, description: 'Ends with text' })
  @IsOptional()
  @IsString()
  endsWith?: string;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Not equals' })
  @IsOptional()
  not?: any;
}

// Factory function to create typed input classes for specific models
export function createDynamicInputs<TModel>(modelName: string, fields: DynamicFieldConfig[]) {
  // Create typed create input
  @InputType(`${modelName}CreateInput`)
  class CreateInput extends DynamicCreateInput {
    constructor() {
      super();
      // Add model-specific validations if needed
    }
  }

  // Create typed update input
  @InputType(`${modelName}UpdateInput`)
  class UpdateInput extends DynamicUpdateInput {
    constructor() {
      super();
      // Add model-specific validations if needed
    }
  }

  // Create typed filter input
  @InputType(`${modelName}FilterInput`)
  class FilterInput extends DynamicFilterInput {
    constructor() {
      super();
      // Add model-specific filters if needed
    }
  }

  // Create typed bulk create input
  @InputType(`${modelName}BulkCreateInput`)
  class BulkCreateInput extends DynamicBulkCreateInput {
    constructor() {
      super();
    }
  }

  // Create typed bulk update input
  @InputType(`${modelName}BulkUpdateInput`)
  class BulkUpdateInput extends DynamicBulkUpdateInput {
    constructor() {
      super();
    }
  }

  // Create typed bulk delete input
  @InputType(`${modelName}BulkDeleteInput`)
  class BulkDeleteInput extends DynamicBulkDeleteInput {
    constructor() {
      super();
    }
  }

  // Create typed upsert input
  @InputType(`${modelName}UpsertInput`)
  class UpsertInput extends DynamicUpsertInput {
    constructor() {
      super();
    }
  }

  return {
    CreateInput,
    UpdateInput,
    FilterInput,
    BulkCreateInput,
    BulkUpdateInput,
    BulkDeleteInput,
    UpsertInput
  };
}

// Input types manager
export class DynamicInputTypesManager {
  private static inputTypes: Map<string, any> = new Map();

  // Register input types for a model
  static registerInputTypes<TModel>(modelName: string, fields: DynamicFieldConfig[]) {
    const inputs = createDynamicInputs<TModel>(modelName, fields);
    this.inputTypes.set(modelName, inputs);
    return inputs;
  }

  // Get input types for a model
  static getInputTypes(modelName: string) {
    return this.inputTypes.get(modelName);
  }

  // Get all registered input types
  static getAllInputTypes() {
    return Array.from(this.inputTypes.entries());
  }

  // Check if input types exist for a model
  static hasInputTypes(modelName: string): boolean {
    return this.inputTypes.has(modelName);
  }
}

// Common field configs for standard models
export const CommonFieldConfigs = {
  id: { name: 'id', type: 'id' as const, required: true },
  createdAt: { name: 'createdAt', type: 'date' as const, required: false },
  updatedAt: { name: 'updatedAt', type: 'date' as const, required: false },
  userId: { name: 'userId', type: 'id' as const, required: false },
  createdBy: { name: 'createdBy', type: 'id' as const, required: false },
  updatedBy: { name: 'updatedBy', type: 'id' as const, required: false }
};

// Utility to generate field configs from Prisma schema or model
export class FieldConfigGenerator {
  static generateFromModel(modelSchema: any): DynamicFieldConfig[] {
    const fields: DynamicFieldConfig[] = [];
    
    // This would typically parse Prisma schema or model definitions
    // For now, providing a basic structure
    for (const [fieldName, fieldDef] of Object.entries(modelSchema.fields || {})) {
      const field: DynamicFieldConfig = {
        name: fieldName,
        type: this.mapPrismaTypeToGraphQL(fieldDef as any),
        required: (fieldDef as any).required || false,
        description: (fieldDef as any).description
      };
      fields.push(field);
    }

    return fields;
  }

  private static mapPrismaTypeToGraphQL(fieldDef: any): DynamicFieldConfig['type'] {
    switch (fieldDef.type) {
      case 'String':
        return 'string';
      case 'Int':
      case 'Float':
        return 'number';
      case 'Boolean':
        return 'boolean';
      case 'DateTime':
        return 'date';
      case 'Json':
        return 'json';
      default:
        return 'string';
    }
  }

  // Generate basic CRUD field configs for any model
  static generateBasicCRUDFields(additionalFields: Partial<DynamicFieldConfig>[] = []): DynamicFieldConfig[] {
    return [
      CommonFieldConfigs.id,
      CommonFieldConfigs.createdAt,
      CommonFieldConfigs.updatedAt,
      CommonFieldConfigs.userId,
      ...additionalFields.map(field => ({
        name: field.name || 'unknown',
        type: field.type || 'string',
        required: field.required || false,
        description: field.description,
        defaultValue: field.defaultValue,
        validation: field.validation
      }))
    ];
  }
}

// Auto-register common input types
export function setupCommonInputTypes() {
  // Register User inputs
  DynamicInputTypesManager.registerInputTypes('User', 
    FieldConfigGenerator.generateBasicCRUDFields([
      { name: 'email', type: 'string', required: true },
      { name: 'username', type: 'string', required: true },
      { name: 'firstName', type: 'string', required: false },
      { name: 'lastName', type: 'string', required: false },
      { name: 'avatar', type: 'string', required: false },
      { name: 'role', type: 'string', required: false }
    ])
  );

  // Register Post inputs
  DynamicInputTypesManager.registerInputTypes('Post', 
    FieldConfigGenerator.generateBasicCRUDFields([
      { name: 'title', type: 'string', required: true },
      { name: 'content', type: 'string', required: true },
      { name: 'excerpt', type: 'string', required: false },
      { name: 'slug', type: 'string', required: true },
      { name: 'status', type: 'string', required: false },
      { name: 'publishedAt', type: 'date', required: false }
    ])
  );

  // Register Task inputs
  DynamicInputTypesManager.registerInputTypes('Task', 
    FieldConfigGenerator.generateBasicCRUDFields([
      { name: 'title', type: 'string', required: true },
      { name: 'description', type: 'string', required: false },
      { name: 'category', type: 'string', required: false },
      { name: 'priority', type: 'string', required: false },
      { name: 'status', type: 'string', required: false },
      { name: 'dueDate', type: 'date', required: false }
    ])
  );

  // Register Comment inputs
  DynamicInputTypesManager.registerInputTypes('Comment', 
    FieldConfigGenerator.generateBasicCRUDFields([
      { name: 'content', type: 'string', required: true },
      { name: 'postId', type: 'id', required: true },
      { name: 'parentId', type: 'id', required: false }
    ])
  );
}
