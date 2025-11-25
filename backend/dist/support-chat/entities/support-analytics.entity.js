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
exports.SupportAnalytics = exports.AgentPerformance = exports.PlatformBreakdown = void 0;
const graphql_1 = require("@nestjs/graphql");
let PlatformBreakdown = class PlatformBreakdown {
};
exports.PlatformBreakdown = PlatformBreakdown;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PlatformBreakdown.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PlatformBreakdown.prototype, "count", void 0);
exports.PlatformBreakdown = PlatformBreakdown = __decorate([
    (0, graphql_1.ObjectType)()
], PlatformBreakdown);
let AgentPerformance = class AgentPerformance {
};
exports.AgentPerformance = AgentPerformance;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AgentPerformance.prototype, "agentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AgentPerformance.prototype, "agentName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AgentPerformance.prototype, "conversationsHandled", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AgentPerformance.prototype, "averageResponseTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], AgentPerformance.prototype, "satisfactionScore", void 0);
exports.AgentPerformance = AgentPerformance = __decorate([
    (0, graphql_1.ObjectType)()
], AgentPerformance);
let SupportAnalytics = class SupportAnalytics {
};
exports.SupportAnalytics = SupportAnalytics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "totalConversations", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "activeConversations", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "waitingConversations", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "closedConversations", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "averageResponseTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "averageResolutionTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "customerSatisfactionScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "totalMessages", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportAnalytics.prototype, "aiGeneratedMessages", void 0);
__decorate([
    (0, graphql_1.Field)(() => [PlatformBreakdown]),
    __metadata("design:type", Array)
], SupportAnalytics.prototype, "platformBreakdown", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AgentPerformance]),
    __metadata("design:type", Array)
], SupportAnalytics.prototype, "agentPerformance", void 0);
exports.SupportAnalytics = SupportAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], SupportAnalytics);
//# sourceMappingURL=support-analytics.entity.js.map