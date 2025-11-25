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
exports.ReorderModulesInput = exports.UpdateModuleInput = exports.CreateModuleInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateModuleInput = class CreateModuleInput {
};
exports.CreateModuleInput = CreateModuleInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateModuleInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateModuleInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Course ID is required' }),
    __metadata("design:type", String)
], CreateModuleInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModuleInput.prototype, "order", void 0);
exports.CreateModuleInput = CreateModuleInput = __decorate([
    (0, graphql_1.InputType)()
], CreateModuleInput);
let UpdateModuleInput = class UpdateModuleInput {
};
exports.UpdateModuleInput = UpdateModuleInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Module ID is required' }),
    __metadata("design:type", String)
], UpdateModuleInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateModuleInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateModuleInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateModuleInput.prototype, "order", void 0);
exports.UpdateModuleInput = UpdateModuleInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateModuleInput);
let ReorderModulesInput = class ReorderModulesInput {
};
exports.ReorderModulesInput = ReorderModulesInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)({ message: 'Course ID is required' }),
    __metadata("design:type", String)
], ReorderModulesInput.prototype, "courseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsNotEmpty)({ message: 'Module order is required' }),
    __metadata("design:type", Array)
], ReorderModulesInput.prototype, "moduleIds", void 0);
exports.ReorderModulesInput = ReorderModulesInput = __decorate([
    (0, graphql_1.InputType)()
], ReorderModulesInput);
//# sourceMappingURL=module.input.js.map