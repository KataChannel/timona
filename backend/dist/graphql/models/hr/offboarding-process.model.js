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
exports.OffboardingProcess = void 0;
const graphql_1 = require("@nestjs/graphql");
const enums_model_1 = require("./enums.model");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let OffboardingProcess = class OffboardingProcess {
};
exports.OffboardingProcess = OffboardingProcess;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "employeeProfileId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "lastWorkingDay", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "effectiveDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "exitReason", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.TerminationType),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "exitType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "resignationLetter", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], OffboardingProcess.prototype, "noticePeriodDays", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "noticeGivenDate", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: true }),
    __metadata("design:type", Boolean)
], OffboardingProcess.prototype, "noticeRequired", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "assetReturnChecklist", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "knowledgeTransferPlan", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "accessRevocationList", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], OffboardingProcess.prototype, "exitInterviewScheduled", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "exitInterviewDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "exitInterviewBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "exitInterviewNotes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "exitInterviewForm", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], OffboardingProcess.prototype, "finalSalaryAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], OffboardingProcess.prototype, "unusedLeaveDays", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], OffboardingProcess.prototype, "leavePayoutAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], OffboardingProcess.prototype, "bonusAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "deductions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], OffboardingProcess.prototype, "totalSettlement", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "paymentDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.ClearanceStatus, { defaultValue: enums_model_1.ClearanceStatus.PENDING }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "clearanceStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "clearanceSteps", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], OffboardingProcess.prototype, "referenceLetterRequested", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], OffboardingProcess.prototype, "referenceLetterProvided", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "experienceCertificate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], OffboardingProcess.prototype, "finalDocuments", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], OffboardingProcess.prototype, "eligibleForRehire", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "rehireNotes", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.OffboardingStatus, { defaultValue: enums_model_1.OffboardingStatus.INITIATED }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OffboardingProcess.prototype, "approvalWorkflow", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "finalApprovedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "finalApprovedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "initiatedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "processOwner", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "completedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "hrNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "managerComments", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OffboardingProcess.prototype, "employeeComments", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OffboardingProcess.prototype, "updatedAt", void 0);
exports.OffboardingProcess = OffboardingProcess = __decorate([
    (0, graphql_1.ObjectType)()
], OffboardingProcess);
//# sourceMappingURL=offboarding-process.model.js.map