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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageUploadResolver = exports.DataImportExportResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const data_import_service_1 = require("../../services/data-import.service");
const image_upload_service_1 = require("../../services/image-upload.service");
const schema_inspector_service_1 = require("../../services/schema-inspector.service");
const graphql_upload_ts_1 = require("graphql-upload-ts");
const graphql_type_json_1 = require("graphql-type-json");
let DataImportExportResolver = class DataImportExportResolver {
    constructor(dataImportService, schemaInspectorService) {
        this.dataImportService = dataImportService;
        this.schemaInspectorService = schemaInspectorService;
    }
    async importExcelData(file, modelName, mappingConfig) {
        const { createReadStream } = await file;
        const stream = createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const data = this.dataImportService.parseExcel(buffer);
        const result = await this.dataImportService.importToDatabase(modelName, data, mappingConfig);
        return result;
    }
    async importJSONData(jsonString, modelName, mappingConfig) {
        const data = this.dataImportService.parseJSON(jsonString);
        const result = await this.dataImportService.importToDatabase(modelName, data, mappingConfig);
        return result;
    }
    async importTextData(text, modelName, delimiter, mappingConfig) {
        const data = this.dataImportService.parseText(text, delimiter);
        const result = await this.dataImportService.importToDatabase(modelName, data, mappingConfig);
        return result;
    }
    async bulkImportData(data, modelName, mappingConfig) {
        const result = await this.dataImportService.bulkImportToDatabase(modelName, data, mappingConfig);
        return result;
    }
    async validateImportData(data, requiredFields) {
        return this.dataImportService.validateData(data, requiredFields);
    }
    async exportDataToExcel(modelName, where, select) {
        const buffer = await this.dataImportService.exportToExcel(modelName, where, select);
        return buffer.toString('base64');
    }
};
exports.DataImportExportResolver = DataImportExportResolver;
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(1, (0, graphql_1.Args)('modelName')),
    __param(2, (0, graphql_1.Args)({ name: 'mappingConfig', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DataImportExportResolver.prototype, "importExcelData", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)('jsonString')),
    __param(1, (0, graphql_1.Args)('modelName')),
    __param(2, (0, graphql_1.Args)({ name: 'mappingConfig', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DataImportExportResolver.prototype, "importJSONData", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)('text')),
    __param(1, (0, graphql_1.Args)('modelName')),
    __param(2, (0, graphql_1.Args)({ name: 'delimiter', nullable: true, defaultValue: '\t' })),
    __param(3, (0, graphql_1.Args)({ name: 'mappingConfig', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], DataImportExportResolver.prototype, "importTextData", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'data', type: () => graphql_type_json_1.GraphQLJSON })),
    __param(1, (0, graphql_1.Args)('modelName')),
    __param(2, (0, graphql_1.Args)({ name: 'mappingConfig', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object]),
    __metadata("design:returntype", Promise)
], DataImportExportResolver.prototype, "bulkImportData", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'data', type: () => graphql_type_json_1.GraphQLJSON })),
    __param(1, (0, graphql_1.Args)({ name: 'requiredFields', type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Array]),
    __metadata("design:returntype", Promise)
], DataImportExportResolver.prototype, "validateImportData", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)({ name: 'where', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __param(2, (0, graphql_1.Args)({ name: 'select', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DataImportExportResolver.prototype, "exportDataToExcel", null);
exports.DataImportExportResolver = DataImportExportResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [data_import_service_1.DataImportService,
        schema_inspector_service_1.SchemaInspectorService])
], DataImportExportResolver);
let ImageUploadResolver = class ImageUploadResolver {
    constructor(imageUploadService, schemaInspectorService) {
        this.imageUploadService = imageUploadService;
        this.schemaInspectorService = schemaInspectorService;
    }
    async uploadImage(file, bucket, editOptions) {
        const { createReadStream, filename } = await file;
        const stream = createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const validation = await this.imageUploadService.validateImage(buffer);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        const result = await this.imageUploadService.uploadImage(buffer, filename, bucket, editOptions);
        return result;
    }
    async uploadAndMapImage(file, mappingConfig, editOptions) {
        const { createReadStream, filename } = await file;
        const stream = createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const validation = await this.imageUploadService.validateImage(buffer);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        const result = await this.imageUploadService.uploadAndMapImage(buffer, filename, mappingConfig, editOptions);
        return result;
    }
    async uploadMultipleImages(files, bucket, editOptions) {
        const images = [];
        for (const file of files) {
            const { createReadStream, filename } = await file;
            const stream = createReadStream();
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            images.push({ buffer, filename });
        }
        const results = await this.imageUploadService.uploadMultipleImages(images, bucket, editOptions);
        return results;
    }
    async copyImageFromUrl(imageUrl, filename, bucket, editOptions) {
        const result = await this.imageUploadService.copyImageFromUrl(imageUrl, filename, bucket, editOptions);
        return result;
    }
    async batchUploadAndMap(items) {
        const processedItems = [];
        for (const item of items) {
            const { createReadStream, filename } = await item.file;
            const stream = createReadStream();
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            processedItems.push({
                buffer,
                filename,
                mappingConfig: item.mappingConfig,
                editOptions: item.editOptions,
            });
        }
        const results = await this.imageUploadService.batchUploadAndMap(processedItems);
        return results;
    }
    async getAllModels() {
        return this.schemaInspectorService.getAllModels();
    }
    async getModelSchema(modelName) {
        return this.schemaInspectorService.getModelSchema(modelName);
    }
    async getMappableFields(modelName) {
        const fields = await this.schemaInspectorService.getMappableFields(modelName);
        return fields;
    }
    async getRequiredFields(modelName) {
        return this.schemaInspectorService.getRequiredFields(modelName);
    }
    async suggestMapping(sourceFields, modelName) {
        const targetFields = await this.schemaInspectorService.getMappableFields(modelName);
        const suggestions = this.schemaInspectorService.suggestMapping(sourceFields, targetFields);
        return suggestions;
    }
    async validateMapping(modelName, mapping) {
        return this.schemaInspectorService.validateMapping(modelName, mapping);
    }
};
exports.ImageUploadResolver = ImageUploadResolver;
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(1, (0, graphql_1.Args)({ name: 'bucket', nullable: true, defaultValue: 'images' })),
    __param(2, (0, graphql_1.Args)({ name: 'editOptions', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "uploadImage", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_ts_1.GraphQLUpload })),
    __param(1, (0, graphql_1.Args)({ name: 'mappingConfig', type: () => graphql_type_json_1.GraphQLJSON })),
    __param(2, (0, graphql_1.Args)({ name: 'editOptions', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "uploadAndMapImage", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'files', type: () => [graphql_upload_ts_1.GraphQLUpload] })),
    __param(1, (0, graphql_1.Args)({ name: 'bucket', nullable: true, defaultValue: 'images' })),
    __param(2, (0, graphql_1.Args)({ name: 'editOptions', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, Object]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "uploadMultipleImages", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)('imageUrl')),
    __param(1, (0, graphql_1.Args)('filename')),
    __param(2, (0, graphql_1.Args)({ name: 'bucket', nullable: true, defaultValue: 'images' })),
    __param(3, (0, graphql_1.Args)({ name: 'editOptions', type: () => graphql_type_json_1.GraphQLJSON, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "copyImageFromUrl", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'items', type: () => graphql_type_json_1.GraphQLJSON })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "batchUploadAndMap", null);
__decorate([
    (0, graphql_1.Query)(() => [String]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "getAllModels", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)('modelName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "getModelSchema", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)('modelName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "getMappableFields", null);
__decorate([
    (0, graphql_1.Query)(() => [String]),
    __param(0, (0, graphql_1.Args)('modelName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "getRequiredFields", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)({ name: 'sourceFields', type: () => [String] })),
    __param(1, (0, graphql_1.Args)('modelName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "suggestMapping", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __param(0, (0, graphql_1.Args)('modelName')),
    __param(1, (0, graphql_1.Args)({ name: 'mapping', type: () => graphql_type_json_1.GraphQLJSON })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ImageUploadResolver.prototype, "validateMapping", null);
exports.ImageUploadResolver = ImageUploadResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [image_upload_service_1.ImageUploadService,
        schema_inspector_service_1.SchemaInspectorService])
], ImageUploadResolver);
//# sourceMappingURL=data-import-export.resolver.js.map