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
exports.PaginatedCategories = exports.CategoryType = void 0;
const graphql_1 = require("@nestjs/graphql");
const product_type_1 = require("./product.type");
let CategoryType = class CategoryType {
};
exports.CategoryType = CategoryType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CategoryType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CategoryType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CategoryType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => CategoryType, { nullable: true }),
    __metadata("design:type", CategoryType)
], CategoryType.prototype, "parent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CategoryType], { nullable: true }),
    __metadata("design:type", Array)
], CategoryType.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "metaKeywords", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CategoryType.prototype, "displayOrder", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CategoryType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CategoryType.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)(() => [product_type_1.ProductType], { nullable: true }),
    __metadata("design:type", Array)
], CategoryType.prototype, "products", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CategoryType.prototype, "productCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CategoryType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CategoryType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CategoryType.prototype, "updatedBy", void 0);
exports.CategoryType = CategoryType = __decorate([
    (0, graphql_1.ObjectType)()
], CategoryType);
let PaginatedCategories = class PaginatedCategories {
};
exports.PaginatedCategories = PaginatedCategories;
__decorate([
    (0, graphql_1.Field)(() => [CategoryType]),
    __metadata("design:type", Array)
], PaginatedCategories.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedCategories.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedCategories.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedCategories.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedCategories.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedCategories.prototype, "hasMore", void 0);
exports.PaginatedCategories = PaginatedCategories = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedCategories);
//# sourceMappingURL=category.type.js.map