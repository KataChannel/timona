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
exports.UpdateTaskShareInput = exports.ShareTaskInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
let ShareTaskInput = class ShareTaskInput {
};
exports.ShareTaskInput = ShareTaskInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShareTaskInput.prototype, "taskId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShareTaskInput.prototype, "sharedWithId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SharePermission),
    (0, class_validator_1.IsEnum)(client_1.SharePermission),
    __metadata("design:type", String)
], ShareTaskInput.prototype, "permission", void 0);
exports.ShareTaskInput = ShareTaskInput = __decorate([
    (0, graphql_1.InputType)()
], ShareTaskInput);
let UpdateTaskShareInput = class UpdateTaskShareInput {
};
exports.UpdateTaskShareInput = UpdateTaskShareInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskShareInput.prototype, "shareId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SharePermission),
    (0, class_validator_1.IsEnum)(client_1.SharePermission),
    __metadata("design:type", String)
], UpdateTaskShareInput.prototype, "permission", void 0);
exports.UpdateTaskShareInput = UpdateTaskShareInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTaskShareInput);
//# sourceMappingURL=task-share.input.js.map