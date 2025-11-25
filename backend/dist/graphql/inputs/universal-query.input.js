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
exports.RawQueryInput = exports.GroupByInput = exports.AggregateInput = exports.CountInput = exports.DeleteManyInput = exports.DeleteInput = exports.UpsertInput = exports.UpdateManyInput = exports.UpdateInput = exports.CreateManyInput = exports.CreateInput = exports.FindUniqueInput = exports.FindManyInput = exports.PaginationQueryInput = exports.UniversalQueryInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const class_validator_1 = require("class-validator");
let UniversalQueryInput = class UniversalQueryInput {
};
exports.UniversalQueryInput = UniversalQueryInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UniversalQueryInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UniversalQueryInput.prototype, "operation", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UniversalQueryInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UniversalQueryInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UniversalQueryInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UniversalQueryInput.prototype, "include", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UniversalQueryInput.prototype, "orderBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UniversalQueryInput.prototype, "skip", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UniversalQueryInput.prototype, "take", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], UniversalQueryInput.prototype, "cursor", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UniversalQueryInput.prototype, "distinct", void 0);
exports.UniversalQueryInput = UniversalQueryInput = __decorate([
    (0, graphql_1.InputType)()
], UniversalQueryInput);
let PaginationQueryInput = class PaginationQueryInput {
};
exports.PaginationQueryInput = PaginationQueryInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 1 }),
    __metadata("design:type", Number)
], PaginationQueryInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 20 }),
    __metadata("design:type", Number)
], PaginationQueryInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PaginationQueryInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { defaultValue: 'desc' }),
    __metadata("design:type", String)
], PaginationQueryInput.prototype, "sortOrder", void 0);
exports.PaginationQueryInput = PaginationQueryInput = __decorate([
    (0, graphql_1.InputType)()
], PaginationQueryInput);
let FindManyInput = class FindManyInput {
};
exports.FindManyInput = FindManyInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindManyInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindManyInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindManyInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindManyInput.prototype, "include", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindManyInput.prototype, "orderBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaginationQueryInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", PaginationQueryInput)
], FindManyInput.prototype, "pagination", void 0);
exports.FindManyInput = FindManyInput = __decorate([
    (0, graphql_1.InputType)()
], FindManyInput);
let FindUniqueInput = class FindUniqueInput {
};
exports.FindUniqueInput = FindUniqueInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindUniqueInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindUniqueInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindUniqueInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FindUniqueInput.prototype, "include", void 0);
exports.FindUniqueInput = FindUniqueInput = __decorate([
    (0, graphql_1.InputType)()
], FindUniqueInput);
let CreateInput = class CreateInput {
};
exports.CreateInput = CreateInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateInput.prototype, "include", void 0);
exports.CreateInput = CreateInput = __decorate([
    (0, graphql_1.InputType)()
], CreateInput);
let CreateManyInput = class CreateManyInput {
};
exports.CreateManyInput = CreateManyInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateManyInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSONObject]),
    (0, class_validator_1.IsObject)({ each: true }),
    __metadata("design:type", Array)
], CreateManyInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateManyInput.prototype, "skipDuplicates", void 0);
exports.CreateManyInput = CreateManyInput = __decorate([
    (0, graphql_1.InputType)()
], CreateManyInput);
let UpdateInput = class UpdateInput {
};
exports.UpdateInput = UpdateInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateInput.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateInput.prototype, "include", void 0);
exports.UpdateInput = UpdateInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateInput);
let UpdateManyInput = class UpdateManyInput {
};
exports.UpdateManyInput = UpdateManyInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateManyInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateManyInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateManyInput.prototype, "data", void 0);
exports.UpdateManyInput = UpdateManyInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateManyInput);
let UpsertInput = class UpsertInput {
};
exports.UpsertInput = UpsertInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpsertInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpsertInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpsertInput.prototype, "create", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpsertInput.prototype, "update", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpsertInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpsertInput.prototype, "include", void 0);
exports.UpsertInput = UpsertInput = __decorate([
    (0, graphql_1.InputType)()
], UpsertInput);
let DeleteInput = class DeleteInput {
};
exports.DeleteInput = DeleteInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DeleteInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DeleteInput.prototype, "select", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DeleteInput.prototype, "include", void 0);
exports.DeleteInput = DeleteInput = __decorate([
    (0, graphql_1.InputType)()
], DeleteInput);
let DeleteManyInput = class DeleteManyInput {
};
exports.DeleteManyInput = DeleteManyInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeleteManyInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], DeleteManyInput.prototype, "where", void 0);
exports.DeleteManyInput = DeleteManyInput = __decorate([
    (0, graphql_1.InputType)()
], DeleteManyInput);
let CountInput = class CountInput {
};
exports.CountInput = CountInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CountInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CountInput.prototype, "where", void 0);
exports.CountInput = CountInput = __decorate([
    (0, graphql_1.InputType)()
], CountInput);
let AggregateInput = class AggregateInput {
};
exports.AggregateInput = AggregateInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AggregateInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AggregateInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AggregateInput.prototype, "_count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AggregateInput.prototype, "_sum", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AggregateInput.prototype, "_avg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AggregateInput.prototype, "_min", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AggregateInput.prototype, "_max", void 0);
exports.AggregateInput = AggregateInput = __decorate([
    (0, graphql_1.InputType)()
], AggregateInput);
let GroupByInput = class GroupByInput {
};
exports.GroupByInput = GroupByInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GroupByInput.prototype, "model", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GroupByInput.prototype, "by", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "having", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "orderBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GroupByInput.prototype, "skip", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GroupByInput.prototype, "take", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "_count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "_sum", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "_avg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "_min", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], GroupByInput.prototype, "_max", void 0);
exports.GroupByInput = GroupByInput = __decorate([
    (0, graphql_1.InputType)()
], GroupByInput);
let RawQueryInput = class RawQueryInput {
};
exports.RawQueryInput = RawQueryInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RawQueryInput.prototype, "query", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSONObject], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RawQueryInput.prototype, "params", void 0);
exports.RawQueryInput = RawQueryInput = __decorate([
    (0, graphql_1.InputType)()
], RawQueryInput);
//# sourceMappingURL=universal-query.input.js.map