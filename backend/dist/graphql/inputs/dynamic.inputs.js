"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldConfigGenerator = exports.CommonFieldConfigs = exports.DynamicInputTypesManager = exports.FilterOperatorsInput = exports.SortInput = exports.PaginationInput = exports.DynamicUpsertInput = exports.DynamicBulkDeleteInput = exports.DynamicBulkUpdateInput = exports.DynamicBulkCreateInput = exports.DynamicFilterInput = exports.DynamicUpdateInput = exports.DynamicCreateInput = void 0;
exports.createDynamicInputs = createDynamicInputs;
exports.setupCommonInputTypes = setupCommonInputTypes;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const class_validator_1 = require("class-validator");
let DynamicCreateInput = class DynamicCreateInput {
};
exports.DynamicCreateInput = DynamicCreateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Dynamic data object for creation' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicCreateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicCreateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicCreateInput.prototype, "include", void 0);
exports.DynamicCreateInput = DynamicCreateInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicCreateInput);
let DynamicUpdateInput = class DynamicUpdateInput {
};
exports.DynamicUpdateInput = DynamicUpdateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'ID of the record to update' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DynamicUpdateInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Dynamic data object for update' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpdateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpdateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpdateInput.prototype, "include", void 0);
exports.DynamicUpdateInput = DynamicUpdateInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicUpdateInput);
let DynamicFilterInput = class DynamicFilterInput {
};
exports.DynamicFilterInput = DynamicFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Filter conditions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicFilterInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Sort order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicFilterInput.prototype, "orderBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DynamicFilterInput.prototype, "skip", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DynamicFilterInput.prototype, "take", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicFilterInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicFilterInput.prototype, "include", void 0);
exports.DynamicFilterInput = DynamicFilterInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicFilterInput);
let DynamicBulkCreateInput = class DynamicBulkCreateInput {
};
exports.DynamicBulkCreateInput = DynamicBulkCreateInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSONObject], { description: 'Array of data objects for bulk creation' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DynamicBulkCreateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false, description: 'Skip duplicate entries' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DynamicBulkCreateInput.prototype, "skipDuplicates", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkCreateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkCreateInput.prototype, "include", void 0);
exports.DynamicBulkCreateInput = DynamicBulkCreateInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicBulkCreateInput);
let DynamicBulkUpdateInput = class DynamicBulkUpdateInput {
};
exports.DynamicBulkUpdateInput = DynamicBulkUpdateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Conditions to match records for update' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkUpdateInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data to update matching records' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkUpdateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkUpdateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkUpdateInput.prototype, "include", void 0);
exports.DynamicBulkUpdateInput = DynamicBulkUpdateInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicBulkUpdateInput);
let DynamicBulkDeleteInput = class DynamicBulkDeleteInput {
};
exports.DynamicBulkDeleteInput = DynamicBulkDeleteInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Conditions to match records for deletion' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkDeleteInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkDeleteInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicBulkDeleteInput.prototype, "include", void 0);
exports.DynamicBulkDeleteInput = DynamicBulkDeleteInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicBulkDeleteInput);
let DynamicUpsertInput = class DynamicUpsertInput {
};
exports.DynamicUpsertInput = DynamicUpsertInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Unique conditions to find existing record' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpsertInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for creating new record if not exists' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpsertInput.prototype, "create", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for updating existing record if exists' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpsertInput.prototype, "update", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpsertInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DynamicUpsertInput.prototype, "include", void 0);
exports.DynamicUpsertInput = DynamicUpsertInput = __decorate([
    (0, graphql_1.InputType)()
], DynamicUpsertInput);
let PaginationInput = class PaginationInput {
};
exports.PaginationInput = PaginationInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0, description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaginationInput.prototype, "skip", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 10, description: 'Number of records to take' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaginationInput.prototype, "take", void 0);
exports.PaginationInput = PaginationInput = __decorate([
    (0, graphql_1.InputType)()
], PaginationInput);
let SortInput = class SortInput {
};
exports.SortInput = SortInput;
__decorate([
    (0, graphql_1.Field)({ description: 'Field name to sort by' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SortInput.prototype, "field", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'asc', description: 'Sort direction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SortInput.prototype, "direction", void 0);
exports.SortInput = SortInput = __decorate([
    (0, graphql_1.InputType)()
], SortInput);
let FilterOperatorsInput = class FilterOperatorsInput {
};
exports.FilterOperatorsInput = FilterOperatorsInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Equals' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterOperatorsInput.prototype, "equals", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSONObject], { nullable: true, description: 'In array' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FilterOperatorsInput.prototype, "in", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSONObject], { nullable: true, description: 'Not in array' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], FilterOperatorsInput.prototype, "notIn", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Less than' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterOperatorsInput.prototype, "lt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Less than or equal' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterOperatorsInput.prototype, "lte", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Greater than' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterOperatorsInput.prototype, "gt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Greater than or equal' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterOperatorsInput.prototype, "gte", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, description: 'Contains text (case sensitive)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterOperatorsInput.prototype, "contains", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, description: 'Starts with text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterOperatorsInput.prototype, "startsWith", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, description: 'Ends with text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterOperatorsInput.prototype, "endsWith", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Not equals' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterOperatorsInput.prototype, "not", void 0);
exports.FilterOperatorsInput = FilterOperatorsInput = __decorate([
    (0, graphql_1.InputType)()
], FilterOperatorsInput);
function createDynamicInputs(modelName, fields) {
    let CreateInput = class CreateInput extends DynamicCreateInput {
        constructor() {
            super();
        }
    };
    CreateInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}CreateInput`),
        __metadata("design:paramtypes", [])
    ], CreateInput);
    let UpdateInput = class UpdateInput extends DynamicUpdateInput {
        constructor() {
            super();
        }
    };
    UpdateInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}UpdateInput`),
        __metadata("design:paramtypes", [])
    ], UpdateInput);
    let FilterInput = class FilterInput extends DynamicFilterInput {
        constructor() {
            super();
        }
    };
    FilterInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}FilterInput`),
        __metadata("design:paramtypes", [])
    ], FilterInput);
    let BulkCreateInput = class BulkCreateInput extends DynamicBulkCreateInput {
        constructor() {
            super();
        }
    };
    BulkCreateInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}BulkCreateInput`),
        __metadata("design:paramtypes", [])
    ], BulkCreateInput);
    let BulkUpdateInput = class BulkUpdateInput extends DynamicBulkUpdateInput {
        constructor() {
            super();
        }
    };
    BulkUpdateInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}BulkUpdateInput`),
        __metadata("design:paramtypes", [])
    ], BulkUpdateInput);
    let BulkDeleteInput = class BulkDeleteInput extends DynamicBulkDeleteInput {
        constructor() {
            super();
        }
    };
    BulkDeleteInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}BulkDeleteInput`),
        __metadata("design:paramtypes", [])
    ], BulkDeleteInput);
    let UpsertInput = class UpsertInput extends DynamicUpsertInput {
        constructor() {
            super();
        }
    };
    UpsertInput = __decorate([
        (0, graphql_1.InputType)(`${modelName}UpsertInput`),
        __metadata("design:paramtypes", [])
    ], UpsertInput);
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
class DynamicInputTypesManager {
    static registerInputTypes(modelName, fields) {
        const inputs = createDynamicInputs(modelName, fields);
        this.inputTypes.set(modelName, inputs);
        return inputs;
    }
    static getInputTypes(modelName) {
        return this.inputTypes.get(modelName);
    }
    static getAllInputTypes() {
        return Array.from(this.inputTypes.entries());
    }
    static hasInputTypes(modelName) {
        return this.inputTypes.has(modelName);
    }
}
exports.DynamicInputTypesManager = DynamicInputTypesManager;
DynamicInputTypesManager.inputTypes = new Map();
exports.CommonFieldConfigs = {
    id: { name: 'id', type: 'id', required: true },
    createdAt: { name: 'createdAt', type: 'date', required: false },
    updatedAt: { name: 'updatedAt', type: 'date', required: false },
    userId: { name: 'userId', type: 'id', required: false },
    createdBy: { name: 'createdBy', type: 'id', required: false },
    updatedBy: { name: 'updatedBy', type: 'id', required: false }
};
class FieldConfigGenerator {
    static generateFromModel(modelSchema) {
        const fields = [];
        for (const [fieldName, fieldDef] of Object.entries(modelSchema.fields || {})) {
            const field = {
                name: fieldName,
                type: this.mapPrismaTypeToGraphQL(fieldDef),
                required: fieldDef.required || false,
                description: fieldDef.description
            };
            fields.push(field);
        }
        return fields;
    }
    static mapPrismaTypeToGraphQL(fieldDef) {
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
    static generateBasicCRUDFields(additionalFields = []) {
        return [
            exports.CommonFieldConfigs.id,
            exports.CommonFieldConfigs.createdAt,
            exports.CommonFieldConfigs.updatedAt,
            exports.CommonFieldConfigs.userId,
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
exports.FieldConfigGenerator = FieldConfigGenerator;
function setupCommonInputTypes() {
    DynamicInputTypesManager.registerInputTypes('User', FieldConfigGenerator.generateBasicCRUDFields([
        { name: 'email', type: 'string', required: true },
        { name: 'username', type: 'string', required: true },
        { name: 'firstName', type: 'string', required: false },
        { name: 'lastName', type: 'string', required: false },
        { name: 'avatar', type: 'string', required: false },
        { name: 'role', type: 'string', required: false }
    ]));
    DynamicInputTypesManager.registerInputTypes('Post', FieldConfigGenerator.generateBasicCRUDFields([
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'string', required: true },
        { name: 'excerpt', type: 'string', required: false },
        { name: 'slug', type: 'string', required: true },
        { name: 'status', type: 'string', required: false },
        { name: 'publishedAt', type: 'date', required: false }
    ]));
    DynamicInputTypesManager.registerInputTypes('Task', FieldConfigGenerator.generateBasicCRUDFields([
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'string', required: false },
        { name: 'category', type: 'string', required: false },
        { name: 'priority', type: 'string', required: false },
        { name: 'status', type: 'string', required: false },
        { name: 'dueDate', type: 'date', required: false }
    ]));
    DynamicInputTypesManager.registerInputTypes('Comment', FieldConfigGenerator.generateBasicCRUDFields([
        { name: 'content', type: 'string', required: true },
        { name: 'postId', type: 'id', required: true },
        { name: 'parentId', type: 'id', required: false }
    ]));
}
//# sourceMappingURL=dynamic.inputs.js.map