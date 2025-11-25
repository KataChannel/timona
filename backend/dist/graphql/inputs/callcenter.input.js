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
exports.CallCenterRecordFiltersInput = exports.SyncCallCenterInput = exports.UpdateCallCenterConfigInput = exports.CreateCallCenterConfigInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const callcenter_model_1 = require("../models/callcenter.model");
let CreateCallCenterConfigInput = class CreateCallCenterConfigInput {
};
exports.CreateCallCenterConfigInput = CreateCallCenterConfigInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateCallCenterConfigInput.prototype, "apiUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateCallCenterConfigInput.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateCallCenterConfigInput.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)(() => callcenter_model_1.CallCenterSyncMode, { defaultValue: callcenter_model_1.CallCenterSyncMode.MANUAL }),
    __metadata("design:type", String)
], CreateCallCenterConfigInput.prototype, "syncMode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateCallCenterConfigInput.prototype, "cronExpression", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: true }),
    __metadata("design:type", Boolean)
], CreateCallCenterConfigInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 30 }),
    __metadata("design:type", Number)
], CreateCallCenterConfigInput.prototype, "defaultDaysBack", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { defaultValue: 200 }),
    __metadata("design:type", Number)
], CreateCallCenterConfigInput.prototype, "batchSize", void 0);
exports.CreateCallCenterConfigInput = CreateCallCenterConfigInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCallCenterConfigInput);
let UpdateCallCenterConfigInput = class UpdateCallCenterConfigInput {
};
exports.UpdateCallCenterConfigInput = UpdateCallCenterConfigInput;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateCallCenterConfigInput.prototype, "apiUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateCallCenterConfigInput.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateCallCenterConfigInput.prototype, "apiKey", void 0);
__decorate([
    (0, graphql_1.Field)(() => callcenter_model_1.CallCenterSyncMode, { nullable: true }),
    __metadata("design:type", String)
], UpdateCallCenterConfigInput.prototype, "syncMode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UpdateCallCenterConfigInput.prototype, "cronExpression", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], UpdateCallCenterConfigInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCallCenterConfigInput.prototype, "defaultDaysBack", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpdateCallCenterConfigInput.prototype, "batchSize", void 0);
exports.UpdateCallCenterConfigInput = UpdateCallCenterConfigInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCallCenterConfigInput);
let SyncCallCenterInput = class SyncCallCenterInput {
};
exports.SyncCallCenterInput = SyncCallCenterInput;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SyncCallCenterInput.prototype, "configId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], SyncCallCenterInput.prototype, "fromDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], SyncCallCenterInput.prototype, "toDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], SyncCallCenterInput.prototype, "fullSync", void 0);
exports.SyncCallCenterInput = SyncCallCenterInput = __decorate([
    (0, graphql_1.InputType)()
], SyncCallCenterInput);
let CallCenterRecordFiltersInput = class CallCenterRecordFiltersInput {
};
exports.CallCenterRecordFiltersInput = CallCenterRecordFiltersInput;
__decorate([
    (0, graphql_1.Field)(() => callcenter_model_1.CallDirection, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecordFiltersInput.prototype, "direction", void 0);
__decorate([
    (0, graphql_1.Field)(() => callcenter_model_1.CallStatus, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecordFiltersInput.prototype, "callStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecordFiltersInput.prototype, "callerIdNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecordFiltersInput.prototype, "destinationNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecordFiltersInput.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], CallCenterRecordFiltersInput.prototype, "startDateFrom", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], CallCenterRecordFiltersInput.prototype, "startDateTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CallCenterRecordFiltersInput.prototype, "search", void 0);
exports.CallCenterRecordFiltersInput = CallCenterRecordFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], CallCenterRecordFiltersInput);
//# sourceMappingURL=callcenter.input.js.map