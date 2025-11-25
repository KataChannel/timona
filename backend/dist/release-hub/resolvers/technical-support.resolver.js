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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalSupportResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const technical_support_service_1 = require("../services/technical-support.service");
const technical_support_entity_1 = require("../entities/technical-support.entity");
const technical_support_input_1 = require("../dto/technical-support.input");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let TechnicalSupportResolver = class TechnicalSupportResolver {
    constructor(supportService) {
        this.supportService = supportService;
    }
    async getTechnicalSupportTickets(where, take, skip) {
        return this.supportService.findAll(where, take, skip);
    }
    async getTechnicalSupportTicket(id) {
        return this.supportService.findOne(id);
    }
    async getTechnicalSupportTicketByNumber(ticketNumber) {
        return this.supportService.findByTicketNumber(ticketNumber);
    }
    async getMyTechnicalSupportTickets(user, status) {
        return this.supportService.getMyTickets(user.id, status);
    }
    async createTechnicalSupportTicket(input) {
        return this.supportService.createTicket(input);
    }
    async updateTechnicalSupportTicket(id, input) {
        return this.supportService.update(id, input);
    }
    async assignTechnicalSupportTicket(ticketId, assignedToId) {
        return this.supportService.assignTicket(ticketId, assignedToId);
    }
    async resolveTechnicalSupportTicket(ticketId, resolution, user) {
        return this.supportService.resolveTicket(ticketId, resolution, user.id);
    }
    async createTechnicalSupportMessage(input) {
        return this.supportService.createMessage(input);
    }
    async rateTechnicalSupportTicket(input) {
        return this.supportService.rateTicket(input);
    }
};
exports.TechnicalSupportResolver = TechnicalSupportResolver;
__decorate([
    (0, graphql_1.Query)(() => [technical_support_entity_1.TechnicalSupportTicket], { name: 'technicalSupportTickets' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('where', { type: () => technical_support_input_1.TechnicalSupportTicketWhereInput, nullable: true })),
    __param(1, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true, defaultValue: 20 })),
    __param(2, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true, defaultValue: 0 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [technical_support_input_1.TechnicalSupportTicketWhereInput, Number, Number]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "getTechnicalSupportTickets", null);
__decorate([
    (0, graphql_1.Query)(() => technical_support_entity_1.TechnicalSupportTicket, { name: 'technicalSupportTicket', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "getTechnicalSupportTicket", null);
__decorate([
    (0, graphql_1.Query)(() => technical_support_entity_1.TechnicalSupportTicket, { name: 'technicalSupportTicketByNumber', nullable: true }),
    __param(0, (0, graphql_1.Args)('ticketNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "getTechnicalSupportTicketByNumber", null);
__decorate([
    (0, graphql_1.Query)(() => [technical_support_entity_1.TechnicalSupportTicket], { name: 'myTechnicalSupportTickets' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "getMyTechnicalSupportTickets", null);
__decorate([
    (0, graphql_1.Mutation)(() => technical_support_entity_1.TechnicalSupportTicket),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [technical_support_input_1.CreateTechnicalSupportTicketInput]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "createTechnicalSupportTicket", null);
__decorate([
    (0, graphql_1.Mutation)(() => technical_support_entity_1.TechnicalSupportTicket),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, technical_support_input_1.UpdateTechnicalSupportTicketInput]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "updateTechnicalSupportTicket", null);
__decorate([
    (0, graphql_1.Mutation)(() => technical_support_entity_1.TechnicalSupportTicket),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('ticketId')),
    __param(1, (0, graphql_1.Args)('assignedToId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "assignTechnicalSupportTicket", null);
__decorate([
    (0, graphql_1.Mutation)(() => technical_support_entity_1.TechnicalSupportTicket),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('ticketId')),
    __param(1, (0, graphql_1.Args)('resolution')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "resolveTechnicalSupportTicket", null);
__decorate([
    (0, graphql_1.Mutation)(() => technical_support_entity_1.TechnicalSupportMessage),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [technical_support_input_1.CreateTechnicalSupportMessageInput]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "createTechnicalSupportMessage", null);
__decorate([
    (0, graphql_1.Mutation)(() => technical_support_entity_1.TechnicalSupportTicket),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [technical_support_input_1.RateTicketInput]),
    __metadata("design:returntype", Promise)
], TechnicalSupportResolver.prototype, "rateTechnicalSupportTicket", null);
exports.TechnicalSupportResolver = TechnicalSupportResolver = __decorate([
    (0, graphql_1.Resolver)(() => technical_support_entity_1.TechnicalSupportTicket),
    __metadata("design:paramtypes", [technical_support_service_1.TechnicalSupportService])
], TechnicalSupportResolver);
//# sourceMappingURL=technical-support.resolver.js.map