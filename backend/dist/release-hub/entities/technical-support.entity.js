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
exports.TechnicalSupportMessage = exports.TechnicalSupportTicket = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.SupportTicketStatus, { name: 'SupportTicketStatus' });
(0, graphql_1.registerEnumType)(client_1.SupportTicketPriority, { name: 'SupportTicketPriority' });
(0, graphql_1.registerEnumType)(client_1.SupportTicketCategory, { name: 'SupportTicketCategory' });
let TechnicalSupportTicket = class TechnicalSupportTicket {
};
exports.TechnicalSupportTicket = TechnicalSupportTicket;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "ticketNumber", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketCategory),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketPriority),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.SupportTicketStatus),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "customerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "customerPhone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "assignedToId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "environment", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "browserInfo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "osInfo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "deviceInfo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "errorLogs", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], TechnicalSupportTicket.prototype, "attachmentUrls", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], TechnicalSupportTicket.prototype, "screenshotUrls", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "relatedUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "relatedOrderId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "resolution", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "resolvedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "resolvedById", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], TechnicalSupportTicket.prototype, "customerRating", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportTicket.prototype, "customerFeedback", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], TechnicalSupportTicket.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "closedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "firstResponseAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TechnicalSupportTicket.prototype, "lastResponseAt", void 0);
exports.TechnicalSupportTicket = TechnicalSupportTicket = __decorate([
    (0, graphql_1.ObjectType)()
], TechnicalSupportTicket);
let TechnicalSupportMessage = class TechnicalSupportMessage {
};
exports.TechnicalSupportMessage = TechnicalSupportMessage;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], TechnicalSupportMessage.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TechnicalSupportMessage.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], TechnicalSupportMessage.prototype, "isInternal", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], TechnicalSupportMessage.prototype, "attachmentUrls", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TechnicalSupportMessage.prototype, "ticketId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportMessage.prototype, "authorId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportMessage.prototype, "authorName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TechnicalSupportMessage.prototype, "authorEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], TechnicalSupportMessage.prototype, "isRead", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], TechnicalSupportMessage.prototype, "readAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TechnicalSupportMessage.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], TechnicalSupportMessage.prototype, "updatedAt", void 0);
exports.TechnicalSupportMessage = TechnicalSupportMessage = __decorate([
    (0, graphql_1.ObjectType)()
], TechnicalSupportMessage);
//# sourceMappingURL=technical-support.entity.js.map