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
exports.SchemaInspectorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SchemaInspectorService = class SchemaInspectorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllModels() {
        try {
            const dmmf = client_1.Prisma.dmmf;
            const models = dmmf.datamodel.models || [];
            console.log('[SchemaInspector] Found models:', models.map(m => m.name));
            return models.map((model) => model.name);
        }
        catch (error) {
            console.error('[SchemaInspector] Error getting models:', error);
            return [];
        }
    }
    async getModelSchema(modelName) {
        try {
            const dmmf = client_1.Prisma.dmmf;
            const models = dmmf.datamodel.models || [];
            const model = models.find((m) => m.name.toLowerCase() === modelName.toLowerCase());
            if (!model) {
                console.warn(`[SchemaInspector] Model ${modelName} not found`);
                return null;
            }
            const fields = model.fields.map((field) => ({
                name: field.name,
                type: this.mapFieldType(field.type, field.kind),
                isRequired: field.isRequired,
                isUnique: field.isUnique || false,
                isId: field.isId || false,
                hasDefaultValue: !!field.default,
                relationName: field.relationName,
                isList: field.isList || false,
            }));
            const primaryKeyField = fields.find(f => f.isId);
            return {
                name: model.name,
                fields,
                primaryKey: primaryKeyField?.name,
            };
        }
        catch (error) {
            console.error(`[SchemaInspector] Error getting schema for ${modelName}:`, error);
            return null;
        }
    }
    async getMappableFields(modelName) {
        const schema = await this.getModelSchema(modelName);
        if (!schema) {
            return [];
        }
        return schema.fields.filter(field => {
            if (field.relationName) {
                return false;
            }
            if (field.isId && field.hasDefaultValue) {
                return false;
            }
            if (['createdAt', 'updatedAt'].includes(field.name) && field.hasDefaultValue) {
                return false;
            }
            return true;
        });
    }
    async getRequiredFields(modelName) {
        const schema = await this.getModelSchema(modelName);
        if (!schema) {
            return [];
        }
        return schema.fields
            .filter(f => f.isRequired && !f.hasDefaultValue && !f.relationName)
            .map(f => f.name);
    }
    suggestMapping(sourceFields, targetFields) {
        const mapping = {};
        sourceFields.forEach(sourceField => {
            const normalizedSource = this.normalizeFieldName(sourceField);
            let targetField = targetFields.find(tf => this.normalizeFieldName(tf.name) === normalizedSource);
            if (!targetField) {
                targetField = targetFields.find(tf => {
                    const normalizedTarget = this.normalizeFieldName(tf.name);
                    return (normalizedTarget.includes(normalizedSource) ||
                        normalizedSource.includes(normalizedTarget));
                });
            }
            if (targetField) {
                mapping[sourceField] = targetField.name;
            }
        });
        return mapping;
    }
    async validateMapping(modelName, mapping) {
        const errors = [];
        const schema = await this.getModelSchema(modelName);
        if (!schema) {
            errors.push(`Model ${modelName} not found`);
            return { valid: false, errors };
        }
        const requiredFields = await this.getRequiredFields(modelName);
        const mappedTargetFields = Object.values(mapping);
        requiredFields.forEach(required => {
            if (!mappedTargetFields.includes(required)) {
                errors.push(`Required field "${required}" is not mapped`);
            }
        });
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
    mapFieldType(type, kind) {
        if (kind === 'object') {
            return 'relation';
        }
        const typeMap = {
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
    normalizeFieldName(name) {
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
};
exports.SchemaInspectorService = SchemaInspectorService;
exports.SchemaInspectorService = SchemaInspectorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchemaInspectorService);
//# sourceMappingURL=schema-inspector.service.js.map