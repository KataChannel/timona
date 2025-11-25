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
exports.TemplateShare = exports.CustomTemplate = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const client_1 = require("@prisma/client");
const user_model_1 = require("./user.model");
(0, graphql_1.registerEnumType)(client_1.TemplateCategory, {
    name: 'TemplateCategory',
    description: 'Template category for organization',
});
let CustomTemplate = class CustomTemplate {
};
exports.CustomTemplate = CustomTemplate;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CustomTemplate.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CustomTemplate.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CustomTemplate.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TemplateCategory),
    __metadata("design:type", String)
], CustomTemplate.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], CustomTemplate.prototype, "blocks", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CustomTemplate.prototype, "thumbnail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CustomTemplate.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], CustomTemplate.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CustomTemplate.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], CustomTemplate.prototype, "isArchived", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], CustomTemplate.prototype, "usageCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CustomTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], CustomTemplate.prototype, "updatedAt", void 0);
exports.CustomTemplate = CustomTemplate = __decorate([
    (0, graphql_1.ObjectType)()
], CustomTemplate);
let TemplateShare = class TemplateShare {
};
exports.TemplateShare = TemplateShare;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TemplateShare.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TemplateShare.prototype, "templateId", void 0);
__decorate([
    (0, graphql_1.Field)(() => CustomTemplate),
    __metadata("design:type", CustomTemplate)
], TemplateShare.prototype, "template", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TemplateShare.prototype, "sharedWith", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_model_1.User),
    __metadata("design:type", user_model_1.User)
], TemplateShare.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TemplateShare.prototype, "createdAt", void 0);
exports.TemplateShare = TemplateShare = __decorate([
    (0, graphql_1.ObjectType)()
], TemplateShare);
//# sourceMappingURL=custom-template.model.js.map