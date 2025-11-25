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
exports.EmployeeProfile = void 0;
const graphql_1 = require("@nestjs/graphql");
const enums_model_1 = require("./enums.model");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let EmployeeProfile = class EmployeeProfile {
};
exports.EmployeeProfile = EmployeeProfile;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "employeeCode", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "fullName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "displayName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "citizenId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "citizenIdIssueDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "citizenIdIssuePlace", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "passportNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "passportIssueDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "passportExpiryDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "dateOfBirth", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "placeOfBirth", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.Gender, { nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "gender", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.MaritalStatus, { nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "maritalStatus", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, defaultValue: 'Vietnam' }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "nationality", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "personalEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "personalPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "permanentAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "currentAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "district", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "ward", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "postalCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "emergencyContactName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "emergencyContactRelationship", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "emergencyContactAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], EmployeeProfile.prototype, "education", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], EmployeeProfile.prototype, "certifications", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], EmployeeProfile.prototype, "skills", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], EmployeeProfile.prototype, "languages", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "bankName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "bankAccountName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "bankBranch", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "taxCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "socialInsuranceNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "healthInsuranceNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "department", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "position", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "team", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "directManager", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "probationEndDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.ContractType, { nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "contractType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "workLocation", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "salaryGrade", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], EmployeeProfile.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "updatedBy", void 0);
exports.EmployeeProfile = EmployeeProfile = __decorate([
    (0, graphql_1.ObjectType)()
], EmployeeProfile);
//# sourceMappingURL=employee-profile.model.js.map