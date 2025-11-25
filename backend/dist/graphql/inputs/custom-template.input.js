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
exports.UpdateTemplatePublicityInput = exports.ShareTemplateInput = exports.UpdateCustomTemplateInput = exports.CreateCustomTemplateInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let CreateCustomTemplateInput = class CreateCustomTemplateInput {
};
exports.CreateCustomTemplateInput = CreateCustomTemplateInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomTemplateInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomTemplateInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TemplateCategory),
    (0, class_validator_1.IsEnum)(client_1.TemplateCategory),
    __metadata("design:type", String)
], CreateCustomTemplateInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], CreateCustomTemplateInput.prototype, "blocks", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomTemplateInput.prototype, "thumbnail", void 0);
exports.CreateCustomTemplateInput = CreateCustomTemplateInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCustomTemplateInput);
let UpdateCustomTemplateInput = class UpdateCustomTemplateInput {
};
exports.UpdateCustomTemplateInput = UpdateCustomTemplateInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomTemplateInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomTemplateInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomTemplateInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.TemplateCategory, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TemplateCategory),
    __metadata("design:type", String)
], UpdateCustomTemplateInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateCustomTemplateInput.prototype, "blocks", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCustomTemplateInput.prototype, "thumbnail", void 0);
exports.UpdateCustomTemplateInput = UpdateCustomTemplateInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCustomTemplateInput);
let ShareTemplateInput = class ShareTemplateInput {
};
exports.ShareTemplateInput = ShareTemplateInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShareTemplateInput.prototype, "templateId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], ShareTemplateInput.prototype, "userIds", void 0);
exports.ShareTemplateInput = ShareTemplateInput = __decorate([
    (0, graphql_1.InputType)()
], ShareTemplateInput);
let UpdateTemplatePublicityInput = class UpdateTemplatePublicityInput {
};
exports.UpdateTemplatePublicityInput = UpdateTemplatePublicityInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTemplatePublicityInput.prototype, "templateId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTemplatePublicityInput.prototype, "isPublic", void 0);
exports.UpdateTemplatePublicityInput = UpdateTemplatePublicityInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTemplatePublicityInput);
//# sourceMappingURL=custom-template.input.js.map