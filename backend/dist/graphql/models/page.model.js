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
exports.PaginatedPages = exports.PagePaginationInfo = exports.Page = exports.PageBlock = exports.BlockType = exports.PageStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
var PageStatus;
(function (PageStatus) {
    PageStatus["DRAFT"] = "DRAFT";
    PageStatus["PUBLISHED"] = "PUBLISHED";
    PageStatus["ARCHIVED"] = "ARCHIVED";
})(PageStatus || (exports.PageStatus = PageStatus = {}));
var BlockType;
(function (BlockType) {
    BlockType["TEXT"] = "TEXT";
    BlockType["RICH_TEXT"] = "RICH_TEXT";
    BlockType["IMAGE"] = "IMAGE";
    BlockType["VIDEO"] = "VIDEO";
    BlockType["CAROUSEL"] = "CAROUSEL";
    BlockType["HERO"] = "HERO";
    BlockType["BUTTON"] = "BUTTON";
    BlockType["DIVIDER"] = "DIVIDER";
    BlockType["SPACER"] = "SPACER";
    BlockType["TEAM"] = "TEAM";
    BlockType["STATS"] = "STATS";
    BlockType["CONTACT_INFO"] = "CONTACT_INFO";
    BlockType["GALLERY"] = "GALLERY";
    BlockType["CARD"] = "CARD";
    BlockType["TESTIMONIAL"] = "TESTIMONIAL";
    BlockType["FAQ"] = "FAQ";
    BlockType["CONTACT_FORM"] = "CONTACT_FORM";
    BlockType["COMPLETED_TASKS"] = "COMPLETED_TASKS";
    BlockType["SEARCH"] = "SEARCH";
    BlockType["BOOKMARK"] = "BOOKMARK";
    BlockType["CONTAINER"] = "CONTAINER";
    BlockType["SECTION"] = "SECTION";
    BlockType["GRID"] = "GRID";
    BlockType["FLEX_ROW"] = "FLEX_ROW";
    BlockType["FLEX_COLUMN"] = "FLEX_COLUMN";
    BlockType["COLUMN"] = "COLUMN";
    BlockType["ROW"] = "ROW";
    BlockType["DYNAMIC"] = "DYNAMIC";
    BlockType["PRODUCT_LIST"] = "PRODUCT_LIST";
    BlockType["PRODUCT_DETAIL"] = "PRODUCT_DETAIL";
    BlockType["PRODUCT_CAROUSEL"] = "PRODUCT_CAROUSEL";
    BlockType["BLOG_CAROUSEL"] = "BLOG_CAROUSEL";
})(BlockType || (exports.BlockType = BlockType = {}));
(0, graphql_1.registerEnumType)(PageStatus, {
    name: 'PageStatus',
    description: 'The status of a page',
});
(0, graphql_1.registerEnumType)(BlockType, {
    name: 'BlockType',
    description: 'The type of a page block',
});
let PageBlock = class PageBlock {
};
exports.PageBlock = PageBlock;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], PageBlock.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => BlockType),
    __metadata("design:type", String)
], PageBlock.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject),
    __metadata("design:type", Object)
], PageBlock.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], PageBlock.prototype, "style", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PageBlock.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PageBlock.prototype, "isVisible", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PageBlock.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PageBlock.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [PageBlock], { nullable: true }),
    __metadata("design:type", Array)
], PageBlock.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], PageBlock.prototype, "depth", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], PageBlock.prototype, "config", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], PageBlock.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], PageBlock.prototype, "updatedAt", void 0);
exports.PageBlock = PageBlock = __decorate([
    (0, graphql_1.ObjectType)()
], PageBlock);
let Page = class Page {
};
exports.Page = Page;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Page.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Page.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Page.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], Page.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageStatus),
    __metadata("design:type", String)
], Page.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "seoTitle", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "seoDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Page.prototype, "seoKeywords", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "ogImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], Page.prototype, "isHomepage", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], Page.prototype, "isDynamic", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], Page.prototype, "dynamicConfig", void 0);
__decorate([
    (0, graphql_1.Field)(() => [PageBlock]),
    __metadata("design:type", Array)
], Page.prototype, "blocks", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Page.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Page.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], Page.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Page.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Page.prototype, "updatedBy", void 0);
exports.Page = Page = __decorate([
    (0, graphql_1.ObjectType)()
], Page);
let PagePaginationInfo = class PagePaginationInfo {
};
exports.PagePaginationInfo = PagePaginationInfo;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PagePaginationInfo.prototype, "currentPage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PagePaginationInfo.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PagePaginationInfo.prototype, "totalItems", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PagePaginationInfo.prototype, "hasNextPage", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], PagePaginationInfo.prototype, "hasPreviousPage", void 0);
exports.PagePaginationInfo = PagePaginationInfo = __decorate([
    (0, graphql_1.ObjectType)()
], PagePaginationInfo);
let PaginatedPages = class PaginatedPages {
};
exports.PaginatedPages = PaginatedPages;
__decorate([
    (0, graphql_1.Field)(() => [Page]),
    __metadata("design:type", Array)
], PaginatedPages.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => PagePaginationInfo),
    __metadata("design:type", PagePaginationInfo)
], PaginatedPages.prototype, "pagination", void 0);
exports.PaginatedPages = PaginatedPages = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedPages);
//# sourceMappingURL=page.model.js.map