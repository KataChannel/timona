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
var InvoiceResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const client_1 = require("@prisma/client");
const invoice_service_1 = require("../../services/invoice.service");
const invoice_import_service_1 = require("../../services/invoice-import.service");
const invoice_model_1 = require("../models/invoice.model");
const invoice_input_1 = require("../inputs/invoice.input");
let InvoiceResolver = InvoiceResolver_1 = class InvoiceResolver {
    constructor(invoiceService, invoiceImportService) {
        this.invoiceService = invoiceService;
        this.invoiceImportService = invoiceImportService;
        this.logger = new common_1.Logger(InvoiceResolver_1.name);
    }
    async createInvoice(input) {
        this.logger.log('Creating invoice with data:', JSON.stringify(input));
        return this.invoiceService.createInvoice(input);
    }
    async createInvoiceDetails(invoiceId, details) {
        this.logger.log(`Creating ${details.length} details for invoice ${invoiceId}`);
        return this.invoiceService.createInvoiceDetails(invoiceId, details);
    }
    async getInvoice(id) {
        this.logger.log(`Getting invoice: ${id}`);
        return this.invoiceService.getInvoiceById(id);
    }
    async searchInvoices(input) {
        this.logger.log('Searching invoices with filters:', JSON.stringify(input));
        return this.invoiceService.searchInvoices(input);
    }
    async invoiceExists(idServer, nbmst, khmshdon, shdon) {
        return this.invoiceService.invoiceExists(idServer, nbmst, khmshdon, shdon);
    }
    async bulkCreateInvoices(input) {
        const tokenInfo = input.bearerToken ?
            `with Bearer Token from frontend (${input.bearerToken.substring(0, 10)}...)` :
            'using environment token (if configured)';
        this.logger.log(`Bulk creating ${input.invoices.length} invoices ${tokenInfo}`);
        this.logger.log(`Include details: ${input.includeDetails}, Skip existing: ${input.skipExisting}`);
        return this.invoiceService.bulkCreateInvoices(input, undefined);
    }
    async getInvoiceStats() {
        this.logger.log('Getting invoice statistics');
        return this.invoiceService.getStats();
    }
    async updateInvoice(id, input) {
        this.logger.log(`Updating invoice: ${id}`);
        return this.invoiceService.updateInvoice(id, input);
    }
    async deleteInvoice(id) {
        this.logger.log(`Deleting invoice: ${id}`);
        return this.invoiceService.deleteInvoice(id);
    }
};
exports.InvoiceResolver = InvoiceResolver;
__decorate([
    (0, graphql_1.Mutation)(() => invoice_model_1.ExtListhoadon),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_input_1.CreateInvoiceInput]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "createInvoice", null);
__decorate([
    (0, graphql_1.Mutation)(() => [invoice_model_1.ExtDetailhoadon]),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('invoiceId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('details', { type: () => [invoice_input_1.CreateInvoiceDetailInput] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "createInvoiceDetails", null);
__decorate([
    (0, graphql_1.Query)(() => invoice_model_1.ExtListhoadon),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "getInvoice", null);
__decorate([
    (0, graphql_1.Query)(() => invoice_model_1.InvoiceSearchResult),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_input_1.InvoiceSearchInput]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "searchInvoices", null);
__decorate([
    (0, graphql_1.Query)(() => Boolean),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('idServer')),
    __param(1, (0, graphql_1.Args)('nbmst')),
    __param(2, (0, graphql_1.Args)('khmshdon')),
    __param(3, (0, graphql_1.Args)('shdon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "invoiceExists", null);
__decorate([
    (0, graphql_1.Mutation)(() => invoice_model_1.DatabaseSyncResult),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_input_1.BulkInvoiceInput]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "bulkCreateInvoices", null);
__decorate([
    (0, graphql_1.Query)(() => invoice_model_1.InvoiceStats),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "getInvoiceStats", null);
__decorate([
    (0, graphql_1.Mutation)(() => invoice_model_1.ExtListhoadon),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoice_input_1.CreateInvoiceInput]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "updateInvoice", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceResolver.prototype, "deleteInvoice", null);
exports.InvoiceResolver = InvoiceResolver = InvoiceResolver_1 = __decorate([
    (0, graphql_1.Resolver)(() => invoice_model_1.ExtListhoadon),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService,
        invoice_import_service_1.InvoiceImportService])
], InvoiceResolver);
//# sourceMappingURL=invoice.resolver.js.map