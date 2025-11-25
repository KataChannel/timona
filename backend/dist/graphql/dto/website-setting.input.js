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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWebsiteSettingInput = exports.CreateWebsiteSettingInput = exports.SettingType = exports.SettingCategory = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
var SettingCategory;
(function (SettingCategory) {
    SettingCategory["GENERAL"] = "GENERAL";
    SettingCategory["HEADER"] = "HEADER";
    SettingCategory["FOOTER"] = "FOOTER";
    SettingCategory["SEO"] = "SEO";
    SettingCategory["SOCIAL"] = "SOCIAL";
    SettingCategory["CONTACT"] = "CONTACT";
    SettingCategory["APPEARANCE"] = "APPEARANCE";
    SettingCategory["ANALYTICS"] = "ANALYTICS";
    SettingCategory["PAYMENT"] = "PAYMENT";
    SettingCategory["SHIPPING"] = "SHIPPING";
    SettingCategory["SUPPORT_CHAT"] = "SUPPORT_CHAT";
    SettingCategory["AUTH"] = "AUTH";
})(SettingCategory || (exports.SettingCategory = SettingCategory = {}));
var SettingType;
(function (SettingType) {
    SettingType["TEXT"] = "TEXT";
    SettingType["TEXTAREA"] = "TEXTAREA";
    SettingType["NUMBER"] = "NUMBER";
    SettingType["BOOLEAN"] = "BOOLEAN";
    SettingType["SELECT"] = "SELECT";
    SettingType["JSON"] = "JSON";
    SettingType["COLOR"] = "COLOR";
    SettingType["IMAGE"] = "IMAGE";
    SettingType["URL"] = "URL";
})(SettingType || (exports.SettingType = SettingType = {}));
let CreateWebsiteSettingInput = class CreateWebsiteSettingInput {
};
exports.CreateWebsiteSettingInput = CreateWebsiteSettingInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(SettingType),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(SettingCategory),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "group", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateWebsiteSettingInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWebsiteSettingInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateWebsiteSettingInput.prototype, "validation", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateWebsiteSettingInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateWebsiteSettingInput.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebsiteSettingInput.prototype, "updatedBy", void 0);
exports.CreateWebsiteSettingInput = CreateWebsiteSettingInput = __decorate([
    (0, graphql_1.InputType)()
], CreateWebsiteSettingInput);
let UpdateWebsiteSettingInput = class UpdateWebsiteSettingInput {
};
exports.UpdateWebsiteSettingInput = UpdateWebsiteSettingInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(SettingType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(SettingCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "group", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateWebsiteSettingInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateWebsiteSettingInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateWebsiteSettingInput.prototype, "validation", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateWebsiteSettingInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateWebsiteSettingInput.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebsiteSettingInput.prototype, "updatedBy", void 0);
exports.UpdateWebsiteSettingInput = UpdateWebsiteSettingInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateWebsiteSettingInput);
//# sourceMappingURL=website-setting.input.js.map