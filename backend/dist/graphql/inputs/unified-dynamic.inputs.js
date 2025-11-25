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
exports.DateFilter = exports.NumberFilter = exports.StringFilter = exports.UnifiedAggregateInput = exports.UnifiedUpsertInput = exports.UnifiedBulkDeleteInput = exports.UnifiedBulkUpdateInput = exports.UnifiedBulkCreateInput = exports.UnifiedDeleteInput = exports.UnifiedUpdateInput = exports.UnifiedCreateInput = exports.UnifiedFindByIdInput = exports.UnifiedPaginatedInput = exports.UnifiedFindManyInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const class_validator_1 = require("class-validator");
let UnifiedFindManyInput = class UnifiedFindManyInput {
};
exports.UnifiedFindManyInput = UnifiedFindManyInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Filter conditions (Prisma where clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedFindManyInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Order by fields (Prisma orderBy clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedFindManyInput.prototype, "orderBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, description: 'Number of records to skip' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UnifiedFindManyInput.prototype, "skip", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, description: 'Maximum number of records to return' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UnifiedFindManyInput.prototype, "take", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedFindManyInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedFindManyInput.prototype, "include", void 0);
exports.UnifiedFindManyInput = UnifiedFindManyInput = __decorate([
    (0, graphql_1.InputType)('UnifiedFindManyInput')
], UnifiedFindManyInput);
let UnifiedPaginatedInput = class UnifiedPaginatedInput {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
};
exports.UnifiedPaginatedInput = UnifiedPaginatedInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Filter conditions (Prisma where clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedPaginatedInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Order by fields (Prisma orderBy clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedPaginatedInput.prototype, "orderBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1, description: 'Page number (starts from 1)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UnifiedPaginatedInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 10, description: 'Number of records per page' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UnifiedPaginatedInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedPaginatedInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedPaginatedInput.prototype, "include", void 0);
exports.UnifiedPaginatedInput = UnifiedPaginatedInput = __decorate([
    (0, graphql_1.InputType)('UnifiedPaginatedInput')
], UnifiedPaginatedInput);
let UnifiedFindByIdInput = class UnifiedFindByIdInput {
};
exports.UnifiedFindByIdInput = UnifiedFindByIdInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'Unique identifier of the record' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnifiedFindByIdInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedFindByIdInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedFindByIdInput.prototype, "include", void 0);
exports.UnifiedFindByIdInput = UnifiedFindByIdInput = __decorate([
    (0, graphql_1.InputType)('UnifiedFindByIdInput')
], UnifiedFindByIdInput);
let UnifiedCreateInput = class UnifiedCreateInput {
};
exports.UnifiedCreateInput = UnifiedCreateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for record creation (Prisma data clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedCreateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from result (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedCreateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data in result (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedCreateInput.prototype, "include", void 0);
exports.UnifiedCreateInput = UnifiedCreateInput = __decorate([
    (0, graphql_1.InputType)('UnifiedCreateInput')
], UnifiedCreateInput);
let UnifiedUpdateInput = class UnifiedUpdateInput {
};
exports.UnifiedUpdateInput = UnifiedUpdateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'Unique identifier of the record to update' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnifiedUpdateInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for record update (Prisma data clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpdateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from result (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpdateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data in result (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpdateInput.prototype, "include", void 0);
exports.UnifiedUpdateInput = UnifiedUpdateInput = __decorate([
    (0, graphql_1.InputType)('UnifiedUpdateInput')
], UnifiedUpdateInput);
let UnifiedDeleteInput = class UnifiedDeleteInput {
};
exports.UnifiedDeleteInput = UnifiedDeleteInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { description: 'Unique identifier of the record to delete' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UnifiedDeleteInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from deleted record (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedDeleteInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data from deleted record (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedDeleteInput.prototype, "include", void 0);
exports.UnifiedDeleteInput = UnifiedDeleteInput = __decorate([
    (0, graphql_1.InputType)('UnifiedDeleteInput')
], UnifiedDeleteInput);
let UnifiedBulkCreateInput = class UnifiedBulkCreateInput {
};
exports.UnifiedBulkCreateInput = UnifiedBulkCreateInput;
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSONObject], { description: 'Array of data objects for bulk creation' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UnifiedBulkCreateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false, description: 'Skip duplicate records during bulk creation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UnifiedBulkCreateInput.prototype, "skipDuplicates", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from results (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkCreateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data in results (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkCreateInput.prototype, "include", void 0);
exports.UnifiedBulkCreateInput = UnifiedBulkCreateInput = __decorate([
    (0, graphql_1.InputType)('UnifiedBulkCreateInput')
], UnifiedBulkCreateInput);
let UnifiedBulkUpdateInput = class UnifiedBulkUpdateInput {
};
exports.UnifiedBulkUpdateInput = UnifiedBulkUpdateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Filter conditions for records to update (Prisma where clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkUpdateInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for bulk update (Prisma data clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkUpdateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from results (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkUpdateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data in results (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkUpdateInput.prototype, "include", void 0);
exports.UnifiedBulkUpdateInput = UnifiedBulkUpdateInput = __decorate([
    (0, graphql_1.InputType)('UnifiedBulkUpdateInput')
], UnifiedBulkUpdateInput);
let UnifiedBulkDeleteInput = class UnifiedBulkDeleteInput {
};
exports.UnifiedBulkDeleteInput = UnifiedBulkDeleteInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Filter conditions for records to delete (Prisma where clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkDeleteInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from deleted records (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkDeleteInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data from deleted records (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedBulkDeleteInput.prototype, "include", void 0);
exports.UnifiedBulkDeleteInput = UnifiedBulkDeleteInput = __decorate([
    (0, graphql_1.InputType)('UnifiedBulkDeleteInput')
], UnifiedBulkDeleteInput);
let UnifiedUpsertInput = class UnifiedUpsertInput {
};
exports.UnifiedUpsertInput = UnifiedUpsertInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Conditions to find existing record (Prisma where clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpsertInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for creating new record if not found (Prisma create clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpsertInput.prototype, "create", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { description: 'Data for updating existing record if found (Prisma update clause)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpsertInput.prototype, "update", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Select specific fields from result (Prisma select clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpsertInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Include related data in result (Prisma include clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedUpsertInput.prototype, "include", void 0);
exports.UnifiedUpsertInput = UnifiedUpsertInput = __decorate([
    (0, graphql_1.InputType)('UnifiedUpsertInput')
], UnifiedUpsertInput);
let UnifiedAggregateInput = class UnifiedAggregateInput {
};
exports.UnifiedAggregateInput = UnifiedAggregateInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Filter conditions (Prisma where clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedAggregateInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Group by fields (Prisma groupBy clause)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedAggregateInput.prototype, "groupBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Aggregation operations (count, sum, avg, min, max)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedAggregateInput.prototype, "aggregate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true, description: 'Having conditions for grouped results' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UnifiedAggregateInput.prototype, "having", void 0);
exports.UnifiedAggregateInput = UnifiedAggregateInput = __decorate([
    (0, graphql_1.InputType)('UnifiedAggregateInput')
], UnifiedAggregateInput);
let StringFilter = class StringFilter {
};
exports.StringFilter = StringFilter;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], StringFilter.prototype, "equals", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], StringFilter.prototype, "in", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], StringFilter.prototype, "notIn", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], StringFilter.prototype, "contains", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], StringFilter.prototype, "startsWith", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], StringFilter.prototype, "endsWith", void 0);
exports.StringFilter = StringFilter = __decorate([
    (0, graphql_1.InputType)('StringFilter')
], StringFilter);
let NumberFilter = class NumberFilter {
};
exports.NumberFilter = NumberFilter;
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], NumberFilter.prototype, "equals", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Number], { nullable: true }),
    __metadata("design:type", Array)
], NumberFilter.prototype, "in", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Number], { nullable: true }),
    __metadata("design:type", Array)
], NumberFilter.prototype, "notIn", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], NumberFilter.prototype, "lt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], NumberFilter.prototype, "lte", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], NumberFilter.prototype, "gt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], NumberFilter.prototype, "gte", void 0);
exports.NumberFilter = NumberFilter = __decorate([
    (0, graphql_1.InputType)('NumberFilter')
], NumberFilter);
let DateFilter = class DateFilter {
};
exports.DateFilter = DateFilter;
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], DateFilter.prototype, "equals", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Date], { nullable: true }),
    __metadata("design:type", Array)
], DateFilter.prototype, "in", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Date], { nullable: true }),
    __metadata("design:type", Array)
], DateFilter.prototype, "notIn", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], DateFilter.prototype, "lt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], DateFilter.prototype, "lte", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], DateFilter.prototype, "gt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], DateFilter.prototype, "gte", void 0);
exports.DateFilter = DateFilter = __decorate([
    (0, graphql_1.InputType)('DateFilter')
], DateFilter);
//# sourceMappingURL=unified-dynamic.inputs.js.map