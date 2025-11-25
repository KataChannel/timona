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
exports.PaginatedBlogs = exports.BlogType = exports.BlogCategoryType = exports.BlogTagType = exports.BlogAuthorType = exports.BlogSortBy = exports.BlogStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var BlogStatus;
(function (BlogStatus) {
    BlogStatus["DRAFT"] = "DRAFT";
    BlogStatus["PUBLISHED"] = "PUBLISHED";
    BlogStatus["ARCHIVED"] = "ARCHIVED";
})(BlogStatus || (exports.BlogStatus = BlogStatus = {}));
var BlogSortBy;
(function (BlogSortBy) {
    BlogSortBy["LATEST"] = "LATEST";
    BlogSortBy["OLDEST"] = "OLDEST";
    BlogSortBy["POPULAR"] = "POPULAR";
    BlogSortBy["FEATURED"] = "FEATURED";
})(BlogSortBy || (exports.BlogSortBy = BlogSortBy = {}));
(0, graphql_1.registerEnumType)(BlogStatus, {
    name: 'BlogStatus',
    description: 'Trạng thái bài viết',
});
(0, graphql_1.registerEnumType)(BlogSortBy, {
    name: 'BlogSortBy',
    description: 'Sắp xếp bài viết',
});
let BlogAuthorType = class BlogAuthorType {
};
exports.BlogAuthorType = BlogAuthorType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BlogAuthorType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogAuthorType.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogAuthorType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogAuthorType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogAuthorType.prototype, "email", void 0);
exports.BlogAuthorType = BlogAuthorType = __decorate([
    (0, graphql_1.ObjectType)()
], BlogAuthorType);
let BlogTagType = class BlogTagType {
};
exports.BlogTagType = BlogTagType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BlogTagType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogTagType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogTagType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BlogTagType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BlogTagType.prototype, "updatedAt", void 0);
exports.BlogTagType = BlogTagType = __decorate([
    (0, graphql_1.ObjectType)()
], BlogTagType);
let BlogCategoryType = class BlogCategoryType {
};
exports.BlogCategoryType = BlogCategoryType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BlogCategoryType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogCategoryType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogCategoryType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogCategoryType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogCategoryType.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], BlogCategoryType.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], BlogCategoryType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BlogCategoryType.prototype, "postCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BlogCategoryType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BlogCategoryType.prototype, "updatedAt", void 0);
exports.BlogCategoryType = BlogCategoryType = __decorate([
    (0, graphql_1.ObjectType)()
], BlogCategoryType);
let BlogType = class BlogType {
};
exports.BlogType = BlogType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], BlogType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogType.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BlogType.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "shortDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)(() => BlogAuthorType),
    __metadata("design:type", BlogAuthorType)
], BlogType.prototype, "author", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "bannerUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], BlogType.prototype, "images", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'DRAFT' }),
    __metadata("design:type", String)
], BlogType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 'PUBLIC' }),
    __metadata("design:type", String)
], BlogType.prototype, "visibility", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], BlogType.prototype, "viewCount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], BlogType.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BlogType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", BlogCategoryType)
], BlogType.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => [BlogTagType], { nullable: true }),
    __metadata("design:type", Array)
], BlogType.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], BlogType.prototype, "isFeatured", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], BlogType.prototype, "isPinned", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], BlogType.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], BlogType.prototype, "metaKeywords", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], BlogType.prototype, "canonicalUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], BlogType.prototype, "commentsEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], BlogType.prototype, "readingTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], BlogType.prototype, "createdAt", void 0);
exports.BlogType = BlogType = __decorate([
    (0, graphql_1.ObjectType)()
], BlogType);
let PaginatedBlogs = class PaginatedBlogs {
};
exports.PaginatedBlogs = PaginatedBlogs;
__decorate([
    (0, graphql_1.Field)(() => [BlogType]),
    __metadata("design:type", Array)
], PaginatedBlogs.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedBlogs.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedBlogs.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedBlogs.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedBlogs.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedBlogs.prototype, "hasMore", void 0);
exports.PaginatedBlogs = PaginatedBlogs = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedBlogs);
//# sourceMappingURL=blog.type.js.map