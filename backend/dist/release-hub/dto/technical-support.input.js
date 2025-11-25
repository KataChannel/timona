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
exports.TechnicalSupportTicketWhereInput = exports.RateTicketInput = exports.CreateTechnicalSupportMessageInput = exports.UpdateTechnicalSupportTicketInput = exports.CreateTechnicalSupportTicketInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
let CreateTechnicalSupportTicketInput = class CreateTechnicalSupportTicketInput {
};
exports.CreateTechnicalSupportTicketInput = CreateTechnicalSupportTicketInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketCategory),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketPriority, { defaultValue: 'MEDIUM' }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "customerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "environment", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "browserInfo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "osInfo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "deviceInfo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "errorLogs", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateTechnicalSupportTicketInput.prototype, "attachmentUrls", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateTechnicalSupportTicketInput.prototype, "screenshotUrls", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "relatedUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportTicketInput.prototype, "relatedOrderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateTechnicalSupportTicketInput.prototype, "tags", void 0);
exports.CreateTechnicalSupportTicketInput = CreateTechnicalSupportTicketInput = __decorate([
    (0, graphql_1.InputType)()
], CreateTechnicalSupportTicketInput);
let UpdateTechnicalSupportTicketInput = class UpdateTechnicalSupportTicketInput {
};
exports.UpdateTechnicalSupportTicketInput = UpdateTechnicalSupportTicketInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketCategory, { nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketPriority, { nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketStatus, { nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "assignedToId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTechnicalSupportTicketInput.prototype, "resolution", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateTechnicalSupportTicketInput.prototype, "tags", void 0);
exports.UpdateTechnicalSupportTicketInput = UpdateTechnicalSupportTicketInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTechnicalSupportTicketInput);
let CreateTechnicalSupportMessageInput = class CreateTechnicalSupportMessageInput {
};
exports.CreateTechnicalSupportMessageInput = CreateTechnicalSupportMessageInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTechnicalSupportMessageInput.prototype, "ticketId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTechnicalSupportMessageInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], CreateTechnicalSupportMessageInput.prototype, "isInternal", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateTechnicalSupportMessageInput.prototype, "attachmentUrls", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportMessageInput.prototype, "authorId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportMessageInput.prototype, "authorName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTechnicalSupportMessageInput.prototype, "authorEmail", void 0);
exports.CreateTechnicalSupportMessageInput = CreateTechnicalSupportMessageInput = __decorate([
    (0, graphql_1.InputType)()
], CreateTechnicalSupportMessageInput);
let RateTicketInput = class RateTicketInput {
};
exports.RateTicketInput = RateTicketInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RateTicketInput.prototype, "ticketId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RateTicketInput.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], RateTicketInput.prototype, "feedback", void 0);
exports.RateTicketInput = RateTicketInput = __decorate([
    (0, graphql_1.InputType)()
], RateTicketInput);
let TechnicalSupportTicketWhereInput = class TechnicalSupportTicketWhereInput {
};
exports.TechnicalSupportTicketWhereInput = TechnicalSupportTicketWhereInput;
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketStatus, { nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicketWhereInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketPriority, { nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicketWhereInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketCategory, { nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicketWhereInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicketWhereInput.prototype, "customerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicketWhereInput.prototype, "assignedToId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicketWhereInput.prototype, "search", void 0);
exports.TechnicalSupportTicketWhereInput = TechnicalSupportTicketWhereInput = __decorate([
    (0, graphql_1.InputType)()
], TechnicalSupportTicketWhereInput);
//# sourceMappingURL=technical-support.input.js.map