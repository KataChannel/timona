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
exports.AuditLogStats = exports.ResourceTypeCount = exports.SeverityCount = exports.OperationTypeCount = exports.PaginatedAuditLogs = exports.PaginationInfo = exports.AuditLogFilter = exports.AuditLog = exports.AuditLogUser = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
let AuditLogUser = class AuditLogUser {
};
exports.AuditLogUser = AuditLogUser;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AuditLogUser.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogUser.prototype, "username", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogUser.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogUser.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogUser.prototype, "lastName", void 0);
exports.AuditLogUser = AuditLogUser = __decorate([
    (0, graphql_1.ObjectType)()
], AuditLogUser);
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "resourceId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "parentResourceType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "parentResourceId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "operationType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], AuditLog.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "batchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "batchSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "batchIndex", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "method", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "endpoint", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "oldValues", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "newValues", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "errorMessage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "errorCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "responseTime", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "requestSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "responseSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "dbQueryTime", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "dbQueryCount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "memoryUsage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "cpuUsage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "statusCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "performanceData", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "requiresReview", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AuditLog.prototype, "sensitiveData", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLog.prototype, "retentionPeriod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "correlationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "sessionInfo", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "clientInfo", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => AuditLogUser, { nullable: true }),
    __metadata("design:type", AuditLogUser)
], AuditLog.prototype, "user", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, graphql_1.ObjectType)()
], AuditLog);
let AuditLogFilter = class AuditLogFilter {
};
exports.AuditLogFilter = AuditLogFilter;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "resourceType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "resourceId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "operationType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], AuditLogFilter.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AuditLogFilter.prototype, "dateFrom", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], AuditLogFilter.prototype, "dateTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "correlationId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLogFilter.prototype, "batchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], AuditLogFilter.prototype, "sensitiveData", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], AuditLogFilter.prototype, "requiresReview", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AuditLogFilter.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], AuditLogFilter.prototype, "limit", void 0);
exports.AuditLogFilter = AuditLogFilter = __decorate([
    (0, graphql_1.InputType)()
], AuditLogFilter);
let PaginationInfo = class PaginationInfo {
};
exports.PaginationInfo = PaginationInfo;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginationInfo.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginationInfo.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginationInfo.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginationInfo.prototype, "totalPages", void 0);
exports.PaginationInfo = PaginationInfo = __decorate([
    (0, graphql_1.ObjectType)()
], PaginationInfo);
let PaginatedAuditLogs = class PaginatedAuditLogs {
};
exports.PaginatedAuditLogs = PaginatedAuditLogs;
__decorate([
    (0, graphql_1.Field)(() => [AuditLog]),
    __metadata("design:type", Array)
], PaginatedAuditLogs.prototype, "logs", void 0);
__decorate([
    (0, graphql_1.Field)(() => PaginationInfo),
    __metadata("design:type", PaginationInfo)
], PaginatedAuditLogs.prototype, "pagination", void 0);
exports.PaginatedAuditLogs = PaginatedAuditLogs = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedAuditLogs);
let OperationTypeCount = class OperationTypeCount {
};
exports.OperationTypeCount = OperationTypeCount;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OperationTypeCount.prototype, "operationType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Object)
], OperationTypeCount.prototype, "_count", void 0);
exports.OperationTypeCount = OperationTypeCount = __decorate([
    (0, graphql_1.ObjectType)()
], OperationTypeCount);
let SeverityCount = class SeverityCount {
};
exports.SeverityCount = SeverityCount;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SeverityCount.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Object)
], SeverityCount.prototype, "_count", void 0);
exports.SeverityCount = SeverityCount = __decorate([
    (0, graphql_1.ObjectType)()
], SeverityCount);
let ResourceTypeCount = class ResourceTypeCount {
};
exports.ResourceTypeCount = ResourceTypeCount;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ResourceTypeCount.prototype, "resourceType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Object)
], ResourceTypeCount.prototype, "_count", void 0);
exports.ResourceTypeCount = ResourceTypeCount = __decorate([
    (0, graphql_1.ObjectType)()
], ResourceTypeCount);
let AuditLogStats = class AuditLogStats {
};
exports.AuditLogStats = AuditLogStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AuditLogStats.prototype, "totalLogs", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], AuditLogStats.prototype, "successRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OperationTypeCount]),
    __metadata("design:type", Array)
], AuditLogStats.prototype, "operationsByType", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SeverityCount]),
    __metadata("design:type", Array)
], AuditLogStats.prototype, "severityBreakdown", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ResourceTypeCount]),
    __metadata("design:type", Array)
], AuditLogStats.prototype, "topResources", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AuditLogStats.prototype, "averageResponseTime", void 0);
exports.AuditLogStats = AuditLogStats = __decorate([
    (0, graphql_1.ObjectType)()
], AuditLogStats);
//# sourceMappingURL=audit-log.types.js.map