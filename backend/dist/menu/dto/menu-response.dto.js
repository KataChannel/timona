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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MenuResponseDto_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuPaginationResponseDto = exports.MenuResponseDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let MenuResponseDto = MenuResponseDto_1 = class MenuResponseDto {
    static fromEntity(menu) {
        const dto = new MenuResponseDto_1();
        Object.assign(dto, menu);
        if (menu.children && menu.children.length > 0) {
            dto.children = menu.children.map(child => MenuResponseDto_1.fromEntity(child));
        }
        return dto;
    }
    static fromEntities(menus) {
        return menus.map(menu => MenuResponseDto_1.fromEntity(menu));
    }
};
exports.MenuResponseDto = MenuResponseDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuResponseDto.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuResponseDto.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "path", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "route", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "externalUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "target", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "iconType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "badge", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "badgeColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "cssClass", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "linkType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "blogPostId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "blogCategoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "queryConditions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "customData", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], MenuResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], MenuResponseDto.prototype, "requiredPermissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], MenuResponseDto.prototype, "requiredRoles", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuResponseDto.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuResponseDto.prototype, "isVisible", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuResponseDto.prototype, "isProtected", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MenuResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MenuResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuResponseDto.prototype, "updatedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MenuResponseDto], { nullable: true }),
    __metadata("design:type", Array)
], MenuResponseDto.prototype, "children", void 0);
exports.MenuResponseDto = MenuResponseDto = MenuResponseDto_1 = __decorate([
    (0, graphql_1.ObjectType)()
], MenuResponseDto);
let MenuPaginationResponseDto = class MenuPaginationResponseDto {
};
exports.MenuPaginationResponseDto = MenuPaginationResponseDto;
__decorate([
    (0, graphql_1.Field)(() => [MenuResponseDto]),
    __metadata("design:type", Array)
], MenuPaginationResponseDto.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuPaginationResponseDto.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuPaginationResponseDto.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuPaginationResponseDto.prototype, "pageSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuPaginationResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuPaginationResponseDto.prototype, "hasMore", void 0);
exports.MenuPaginationResponseDto = MenuPaginationResponseDto = __decorate([
    (0, graphql_1.ObjectType)()
], MenuPaginationResponseDto);
//# sourceMappingURL=menu-response.dto.js.map