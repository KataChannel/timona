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
exports.EmployeeDocument = void 0;
const graphql_1 = require("@nestjs/graphql");
const enums_model_1 = require("./enums.model");
let EmployeeDocument = class EmployeeDocument {
};
exports.EmployeeDocument = EmployeeDocument;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "employeeProfileId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.DocumentType),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], EmployeeDocument.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "fileMimeType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "documentNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "issueDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "expiryDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "issuingAuthority", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "verifiedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "verifiedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "verificationNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], EmployeeDocument.prototype, "isConfidential", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], EmployeeDocument.prototype, "accessibleBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeDocument.prototype, "uploadedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "uploadedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmployeeDocument.prototype, "updatedAt", void 0);
exports.EmployeeDocument = EmployeeDocument = __decorate([
    (0, graphql_1.ObjectType)()
], EmployeeDocument);
//# sourceMappingURL=employee-document.model.js.map