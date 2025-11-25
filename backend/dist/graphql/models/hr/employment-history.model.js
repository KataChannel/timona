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
exports.EmploymentHistory = void 0;
const graphql_1 = require("@nestjs/graphql");
const enums_model_1 = require("./enums.model");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let EmploymentHistory = class EmploymentHistory {
};
exports.EmploymentHistory = EmploymentHistory;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "employeeProfileId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.EmploymentEventType),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "eventType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "eventDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "effectiveDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], EmploymentHistory.prototype, "previousValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], EmploymentHistory.prototype, "newValue", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "fromPosition", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "toPosition", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "fromDepartment", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "toDepartment", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "fromLevel", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "toLevel", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.ContractType, { nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "contractType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "contractNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "contractStartDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "contractEndDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], EmploymentHistory.prototype, "salaryChangePercentage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "newSalaryGrade", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.TerminationType, { nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "terminationType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "terminationReason", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "lastWorkingDay", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], EmploymentHistory.prototype, "noticePeriodDays", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], EmploymentHistory.prototype, "documentIds", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "approvalStatus", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "approvedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "approvedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "internalNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmploymentHistory.prototype, "processedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmploymentHistory.prototype, "updatedAt", void 0);
exports.EmploymentHistory = EmploymentHistory = __decorate([
    (0, graphql_1.ObjectType)()
], EmploymentHistory);
//# sourceMappingURL=employment-history.model.js.map