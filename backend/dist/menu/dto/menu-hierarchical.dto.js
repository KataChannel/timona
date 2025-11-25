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
var MenuHierarchicalDto_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuHierarchicalDto = void 0;
const graphql_1 = require("@nestjs/graphql");
let MenuHierarchicalDto = MenuHierarchicalDto_1 = class MenuHierarchicalDto {
    static fromEntity(menu) {
        const dto = new MenuHierarchicalDto_1();
        const { children, ...rest } = menu;
        Object.assign(dto, rest);
        if (children && Array.isArray(children)) {
            dto.children = children.map((child) => MenuHierarchicalDto_1.fromEntity(child));
        }
        return dto;
    }
    static fromEntities(menus) {
        return menus.map((menu) => MenuHierarchicalDto_1.fromEntity(menu));
    }
};
exports.MenuHierarchicalDto = MenuHierarchicalDto;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuHierarchicalDto.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MenuHierarchicalDto.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "path", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "route", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "externalUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "target", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "iconType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "badge", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "badgeColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "image", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], MenuHierarchicalDto.prototype, "requiredPermissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], MenuHierarchicalDto.prototype, "requiredRoles", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuHierarchicalDto.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuHierarchicalDto.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuHierarchicalDto.prototype, "isVisible", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], MenuHierarchicalDto.prototype, "isProtected", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MenuHierarchicalDto.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MenuHierarchicalDto.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MenuHierarchicalDto.prototype, "updatedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MenuHierarchicalDto], { nullable: true }),
    __metadata("design:type", Array)
], MenuHierarchicalDto.prototype, "children", void 0);
exports.MenuHierarchicalDto = MenuHierarchicalDto = MenuHierarchicalDto_1 = __decorate([
    (0, graphql_1.ObjectType)()
], MenuHierarchicalDto);
//# sourceMappingURL=menu-hierarchical.dto.js.map