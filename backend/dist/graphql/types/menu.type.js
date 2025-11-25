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
exports.MenuType = exports.MenuLinkTypeEnum = exports.MenuTargetEnum = exports.MenuTypeEnum = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
var MenuTypeEnum;
(function (MenuTypeEnum) {
    MenuTypeEnum["SIDEBAR"] = "SIDEBAR";
    MenuTypeEnum["HEADER"] = "HEADER";
    MenuTypeEnum["FOOTER"] = "FOOTER";
    MenuTypeEnum["MOBILE"] = "MOBILE";
    MenuTypeEnum["CUSTOM"] = "CUSTOM";
})(MenuTypeEnum || (exports.MenuTypeEnum = MenuTypeEnum = {}));
var MenuTargetEnum;
(function (MenuTargetEnum) {
    MenuTargetEnum["SELF"] = "SELF";
    MenuTargetEnum["BLANK"] = "BLANK";
    MenuTargetEnum["MODAL"] = "MODAL";
})(MenuTargetEnum || (exports.MenuTargetEnum = MenuTargetEnum = {}));
var MenuLinkTypeEnum;
(function (MenuLinkTypeEnum) {
    MenuLinkTypeEnum["URL"] = "URL";
    MenuLinkTypeEnum["PRODUCT_LIST"] = "PRODUCT_LIST";
    MenuLinkTypeEnum["PRODUCT_DETAIL"] = "PRODUCT_DETAIL";
    MenuLinkTypeEnum["BLOG_LIST"] = "BLOG_LIST";
    MenuLinkTypeEnum["BLOG_DETAIL"] = "BLOG_DETAIL";
    MenuLinkTypeEnum["PAGE"] = "PAGE";
    MenuLinkTypeEnum["CATEGORY"] = "CATEGORY";
    MenuLinkTypeEnum["BLOG_CATEGORY"] = "BLOG_CATEGORY";
})(MenuLinkTypeEnum || (exports.MenuLinkTypeEnum = MenuLinkTypeEnum = {}));
(0, graphql_1.registerEnumType)(MenuTypeEnum, {
    name: 'MenuTypeEnum',
    description: 'Loại menu',
});
(0, graphql_1.registerEnumType)(MenuTargetEnum, {
    name: 'MenuTargetEnum',
    description: 'Target khi click menu',
});
(0, graphql_1.registerEnumType)(MenuLinkTypeEnum, {
    name: 'MenuLinkTypeEnum',
    description: 'Loại liên kết động',
});
let MenuType = class MenuType {
};
exports.MenuType = MenuType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MenuType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuType.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuType.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MenuType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MenuType], { nullable: true }),
    __metadata("design:type", Array)
], MenuType.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuType.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuType.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "path", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "route", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "externalUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MenuType.prototype, "target", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "linkType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "blogPostId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "blogCategoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], MenuType.prototype, "queryConditions", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "iconType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "badge", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "badgeColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], MenuType.prototype, "requiredPermissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], MenuType.prototype, "requiredRoles", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuType.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuType.prototype, "isVisible", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuType.prototype, "isProtected", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], MenuType.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "cssClass", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], MenuType.prototype, "customData", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MenuType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MenuType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "updatedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuType.prototype, "finalUrl", void 0);
exports.MenuType = MenuType = __decorate([
    (0, graphql_1.ObjectType)()
], MenuType);
//# sourceMappingURL=menu.type.js.map