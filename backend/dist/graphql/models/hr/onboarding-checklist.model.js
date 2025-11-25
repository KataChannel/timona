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
exports.OnboardingChecklist = void 0;
const graphql_1 = require("@nestjs/graphql");
const enums_model_1 = require("./enums.model");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
let OnboardingChecklist = class OnboardingChecklist {
};
exports.OnboardingChecklist = OnboardingChecklist;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "employeeProfileId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "checklistTemplate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], OnboardingChecklist.prototype, "tasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], OnboardingChecklist.prototype, "totalTasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], OnboardingChecklist.prototype, "completedTasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { defaultValue: 0 }),
    __metadata("design:type", Number)
], OnboardingChecklist.prototype, "progressPercentage", void 0);
__decorate([
    (0, graphql_1.Field)(() => enums_model_1.OnboardingStatus, { defaultValue: enums_model_1.OnboardingStatus.PENDING }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OnboardingChecklist.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OnboardingChecklist.prototype, "targetDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OnboardingChecklist.prototype, "actualCompletionDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "assignedTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "buddyId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], OnboardingChecklist.prototype, "remindersSent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], OnboardingChecklist.prototype, "lastReminderAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "employeeFeedback", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "managerFeedback", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "hrNotes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OnboardingChecklist.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OnboardingChecklist.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], OnboardingChecklist.prototype, "createdBy", void 0);
exports.OnboardingChecklist = OnboardingChecklist = __decorate([
    (0, graphql_1.ObjectType)()
], OnboardingChecklist);
//# sourceMappingURL=onboarding-checklist.model.js.map