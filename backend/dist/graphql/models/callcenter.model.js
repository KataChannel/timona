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
exports.SyncCallCenterResponse = exports.PaginatedCallCenterRecords = exports.CallCenterRecordPaginationInfo = exports.CallCenterSyncLog = exports.CallCenterConfig = exports.CallCenterRecord = exports.CallCenterSyncMode = exports.CallStatus = exports.CallDirection = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
var CallDirection;
(function (CallDirection) {
    CallDirection["INBOUND"] = "INBOUND";
    CallDirection["OUTBOUND"] = "OUTBOUND";
    CallDirection["LOCAL"] = "LOCAL";
})(CallDirection || (exports.CallDirection = CallDirection = {}));
var CallStatus;
(function (CallStatus) {
    CallStatus["ANSWER"] = "ANSWER";
    CallStatus["CANCELED"] = "CANCELED";
    CallStatus["BUSY"] = "BUSY";
    CallStatus["NO_ANSWER"] = "NO_ANSWER";
    CallStatus["FAILED"] = "FAILED";
    CallStatus["UNKNOWN"] = "UNKNOWN";
})(CallStatus || (exports.CallStatus = CallStatus = {}));
var CallCenterSyncMode;
(function (CallCenterSyncMode) {
    CallCenterSyncMode["MANUAL"] = "MANUAL";
    CallCenterSyncMode["SCHEDULED"] = "SCHEDULED";
})(CallCenterSyncMode || (exports.CallCenterSyncMode = CallCenterSyncMode = {}));
(0, graphql_1.registerEnumType)(CallDirection, {
    name: 'CallDirection',
    description: 'Direction of the call',
});
(0, graphql_1.registerEnumType)(CallStatus, {
    name: 'CallStatus',
    description: 'Status of the call',
});
(0, graphql_1.registerEnumType)(CallCenterSyncMode, {
    name: 'CallCenterSyncMode',
    description: 'Sync mode for call center data',
});
let CallCenterRecord = class CallCenterRecord {
};
exports.CallCenterRecord = CallCenterRecord;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "externalUuid", void 0);
__decorate([
    (0, graphql_1.Field)(() => CallDirection),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "direction", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "callerIdNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "outboundCallerIdNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "destinationNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "startEpoch", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "endEpoch", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "answerEpoch", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "billsec", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "sipHangupDisposition", void 0);
__decorate([
    (0, graphql_1.Field)(() => CallStatus),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "callStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "recordPath", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecord.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], CallCenterRecord.prototype, "rawData", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterRecord.prototype, "syncedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterRecord.prototype, "updatedAt", void 0);
exports.CallCenterRecord = CallCenterRecord = __decorate([
    (0, graphql_1.ObjectType)()
], CallCenterRecord);
let CallCenterConfig = class CallCenterConfig {
};
exports.CallCenterConfig = CallCenterConfig;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "apiUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)(() => CallCenterSyncMode),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "syncMode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "cronExpression", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CallCenterConfig.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterConfig.prototype, "defaultDaysBack", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterConfig.prototype, "batchSize", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], CallCenterConfig.prototype, "lastSyncAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "lastSyncStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterConfig.prototype, "lastSyncError", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterConfig.prototype, "totalRecordsSynced", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterConfig.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterConfig.prototype, "updatedAt", void 0);
exports.CallCenterConfig = CallCenterConfig = __decorate([
    (0, graphql_1.ObjectType)()
], CallCenterConfig);
let CallCenterSyncLog = class CallCenterSyncLog {
};
exports.CallCenterSyncLog = CallCenterSyncLog;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CallCenterSyncLog.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterSyncLog.prototype, "configId", void 0);
__decorate([
    (0, graphql_1.Field)(() => CallCenterSyncMode),
    __metadata("design:type", String)
], CallCenterSyncLog.prototype, "syncType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CallCenterSyncLog.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterSyncLog.prototype, "fromDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterSyncLog.prototype, "toDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterSyncLog.prototype, "offset", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterSyncLog.prototype, "recordsFetched", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterSyncLog.prototype, "recordsCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterSyncLog.prototype, "recordsUpdated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterSyncLog.prototype, "recordsSkipped", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterSyncLog.prototype, "errorMessage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSONObject, { nullable: true }),
    __metadata("design:type", Object)
], CallCenterSyncLog.prototype, "errorDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CallCenterSyncLog.prototype, "startedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], CallCenterSyncLog.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CallCenterSyncLog.prototype, "duration", void 0);
exports.CallCenterSyncLog = CallCenterSyncLog = __decorate([
    (0, graphql_1.ObjectType)()
], CallCenterSyncLog);
let CallCenterRecordPaginationInfo = class CallCenterRecordPaginationInfo {
};
exports.CallCenterRecordPaginationInfo = CallCenterRecordPaginationInfo;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterRecordPaginationInfo.prototype, "currentPage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterRecordPaginationInfo.prototype, "totalPages", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CallCenterRecordPaginationInfo.prototype, "totalItems", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CallCenterRecordPaginationInfo.prototype, "hasNextPage", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], CallCenterRecordPaginationInfo.prototype, "hasPreviousPage", void 0);
exports.CallCenterRecordPaginationInfo = CallCenterRecordPaginationInfo = __decorate([
    (0, graphql_1.ObjectType)()
], CallCenterRecordPaginationInfo);
let PaginatedCallCenterRecords = class PaginatedCallCenterRecords {
};
exports.PaginatedCallCenterRecords = PaginatedCallCenterRecords;
__decorate([
    (0, graphql_1.Field)(() => [CallCenterRecord]),
    __metadata("design:type", Array)
], PaginatedCallCenterRecords.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => CallCenterRecordPaginationInfo),
    __metadata("design:type", CallCenterRecordPaginationInfo)
], PaginatedCallCenterRecords.prototype, "pagination", void 0);
exports.PaginatedCallCenterRecords = PaginatedCallCenterRecords = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedCallCenterRecords);
let SyncCallCenterResponse = class SyncCallCenterResponse {
};
exports.SyncCallCenterResponse = SyncCallCenterResponse;
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], SyncCallCenterResponse.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SyncCallCenterResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SyncCallCenterResponse.prototype, "syncLogId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SyncCallCenterResponse.prototype, "recordsFetched", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SyncCallCenterResponse.prototype, "recordsCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SyncCallCenterResponse.prototype, "recordsUpdated", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SyncCallCenterResponse.prototype, "error", void 0);
exports.SyncCallCenterResponse = SyncCallCenterResponse = __decorate([
    (0, graphql_1.ObjectType)()
], SyncCallCenterResponse);
//# sourceMappingURL=callcenter.model.js.map