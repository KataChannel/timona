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
exports.GetCategoriesInput = exports.CategoryFiltersInput = exports.UpdateCategoryInput = exports.CreateCategoryInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let CreateCategoryInput = class CreateCategoryInput {
};
exports.CreateCategoryInput = CreateCategoryInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateCategoryInput.prototype, "metaKeywords", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], CreateCategoryInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], CreateCategoryInput.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], CreateCategoryInput.prototype, "displayOrder", void 0);
exports.CreateCategoryInput = CreateCategoryInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCategoryInput);
let UpdateCategoryInput = class UpdateCategoryInput {
};
exports.UpdateCategoryInput = UpdateCategoryInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateCategoryInput.prototype, "metaKeywords", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCategoryInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCategoryInput.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCategoryInput.prototype, "displayOrder", void 0);
exports.UpdateCategoryInput = UpdateCategoryInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCategoryInput);
let CategoryFiltersInput = class CategoryFiltersInput {
};
exports.CategoryFiltersInput = CategoryFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], CategoryFiltersInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CategoryFiltersInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CategoryFiltersInput.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CategoryFiltersInput.prototype, "hasProducts", void 0);
exports.CategoryFiltersInput = CategoryFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], CategoryFiltersInput);
let GetCategoriesInput = class GetCategoriesInput {
};
exports.GetCategoriesInput = GetCategoriesInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 1 }),
    __metadata("design:type", Number)
], GetCategoriesInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 50 }),
    __metadata("design:type", Number)
], GetCategoriesInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'displayOrder' }),
    __metadata("design:type", String)
], GetCategoriesInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'asc' }),
    __metadata("design:type", String)
], GetCategoriesInput.prototype, "sortOrder", void 0);
__decorate([
    (0, graphql_1.Field)(() => CategoryFiltersInput, { nullable: true }),
    __metadata("design:type", CategoryFiltersInput)
], GetCategoriesInput.prototype, "filters", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: false }),
    __metadata("design:type", Boolean)
], GetCategoriesInput.prototype, "includeChildren", void 0);
exports.GetCategoriesInput = GetCategoriesInput = __decorate([
    (0, graphql_1.InputType)()
], GetCategoriesInput);
//# sourceMappingURL=category.input.js.map