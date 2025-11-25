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
var InvoiceController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const invoice_service_1 = require("../services/invoice.service");
const invoice_input_1 = require("../graphql/inputs/invoice.input");
let InvoiceController = InvoiceController_1 = class InvoiceController {
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
        this.logger = new common_1.Logger(InvoiceController_1.name);
    }
    async createInvoice(input) {
        try {
            this.logger.log('REST: Creating invoice');
            return await this.invoiceService.createInvoice(input);
        }
        catch (error) {
            this.logger.error('REST: Error creating invoice:', error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createInvoiceDetails(invoiceId, details) {
        try {
            this.logger.log(`REST: Creating details for invoice ${invoiceId}`);
            return await this.invoiceService.createInvoiceDetails(invoiceId, details);
        }
        catch (error) {
            this.logger.error('REST: Error creating invoice details:', error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getInvoice(id) {
        try {
            this.logger.log(`REST: Getting invoice ${id}`);
            return await this.invoiceService.getInvoiceById(id);
        }
        catch (error) {
            this.logger.error(`REST: Error getting invoice ${id}:`, error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async searchInvoices(query) {
        try {
            const parseDate = (dateString) => {
                if (!dateString || dateString.trim() === '') {
                    return undefined;
                }
                if (dateString.includes('/')) {
                    const parts = dateString.split('/');
                    if (parts.length === 3) {
                        const [day, month, year] = parts;
                        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                        const parsed = new Date(isoDate);
                        return isNaN(parsed.getTime()) ? undefined : parsed;
                    }
                }
                const parsed = new Date(dateString);
                return isNaN(parsed.getTime()) ? undefined : parsed;
            };
            const input = {
                page: parseInt(query.page) || 0,
                size: parseInt(query.size) || 20,
                sortBy: query.sortBy || 'tdlap',
                sortOrder: query.sortOrder || 'desc',
                nbmst: query.nbmst,
                nmmst: query.nmmst,
                khmshdon: query.khmshdon,
                shdon: query.shdon,
                tthai: query.tthai,
                fromDate: parseDate(query.fromDate),
                toDate: parseDate(query.toDate),
            };
            this.logger.log('REST: Searching invoices with params:', {
                page: input.page,
                size: input.size,
                sortBy: input.sortBy,
                sortOrder: input.sortOrder,
                fromDate: input.fromDate?.toISOString(),
                toDate: input.toDate?.toISOString(),
                filters: { nbmst: query.nbmst, nmmst: query.nmmst, shdon: query.shdon }
            });
            return await this.invoiceService.searchInvoices(input);
        }
        catch (error) {
            this.logger.error('REST: Error searching invoices:', error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async bulkCreateInvoices(input) {
        try {
            this.logger.log(`REST: Bulk creating ${input.invoices.length} invoices`);
            return await this.invoiceService.bulkCreateInvoices(input);
        }
        catch (error) {
            this.logger.error('REST: Error in bulk create:', error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async syncInvoices(body) {
        try {
            const startTime = Date.now();
            this.logger.log('REST: Starting invoice sync from external API');
            this.logger.log(`Total invoices to sync: ${body.invoiceData?.length || 0}`);
            if (body.brandname) {
                this.logger.log(`Using brandname filter: ${body.brandname}`);
            }
            const { invoiceData, detailsData, bearerToken, brandname } = body;
            const convertedInvoices = invoiceData.map(invoice => ({
                idServer: invoice.id,
                nbmst: invoice.nbmst,
                khmshdon: invoice.khmshdon,
                khhdon: invoice.khhdon,
                shdon: invoice.shdon,
                cqt: invoice.cqt,
                hdon: invoice.hdon,
                hthdon: invoice.hthdon,
                htttoan: invoice.htttoan,
                idtbao: invoice.idtbao,
                khdon: invoice.khdon,
                khhdgoc: invoice.khhdgoc,
                khmshdgoc: invoice.khmshdgoc,
                lhdgoc: invoice.lhdgoc,
                mhdon: invoice.mhdon,
                mtdiep: invoice.mtdiep,
                mtdtchieu: invoice.mtdtchieu,
                nbdchi: invoice.nbdchi,
                chma: invoice.chma,
                chten: invoice.chten,
                nbhdktngay: invoice.nbhdktngay ? new Date(invoice.nbhdktngay) : undefined,
                nbhdktso: invoice.nbhdktso,
                nbhdso: invoice.nbhdso,
                nblddnbo: invoice.nblddnbo,
                nbptvchuyen: invoice.nbptvchuyen,
                nbstkhoan: invoice.nbstkhoan,
                nbten: invoice.nbten,
                nbtnhang: invoice.nbtnhang,
                nbtnvchuyen: invoice.nbtnvchuyen,
                ncma: invoice.ncma,
                ncnhat: invoice.ncnhat,
                nky: invoice.nky,
                nmdchi: invoice.nmdchi,
                nmmst: invoice.nmmst,
                nmstkhoan: invoice.nmstkhoan,
                nmten: invoice.nmten,
                nmtnhang: invoice.nmtnhang,
                nmtnmua: invoice.nmtnmua,
                nmttkhac: invoice.nmttkhac,
                ntao: invoice.ntao,
                ntnhan: invoice.ntnhan,
                pban: invoice.pban,
                ptgui: invoice.ptgui,
                shdgoc: invoice.shdgoc,
                tchat: invoice.tchat,
                tdlap: invoice.tdlap ? new Date(invoice.tdlap) : undefined,
                tgia: invoice.tgia || 0,
                tgtcthue: invoice.tgtcthue || 0,
                tgtthue: invoice.tgtthue || 0,
                tgtttbchu: invoice.tgtttbchu || 0,
                tgtttbso: invoice.tgtttbso || 0,
                thdon: invoice.thdon,
                thlap: invoice.thlap,
                tlhdon: invoice.tlhdon,
                ttcktmai: invoice.ttcktmai,
                tthai: invoice.tthai,
                tttbao: invoice.tttbao,
                ttxly: invoice.ttxly,
                tvandnkntt: invoice.tvandnkntt,
                mhso: invoice.mhso,
                mkhang: invoice.mkhang,
                nbsdthoai: invoice.nbsdthoai,
                nbdctdtu: invoice.nbdctdtu,
                nbfax: invoice.nbfax,
                nbwebsite: invoice.nbwebsite,
                nmsdthoai: invoice.nmsdthoai,
                nmdctdtu: invoice.nmdctdtu,
                nmcmnd: invoice.nmcmnd,
                nmcks: invoice.nmcks,
                bhphap: invoice.bhphap,
                hddunlap: invoice.hddunlap,
                gchdgoc: invoice.gchdgoc,
                tbhgtngay: invoice.tbhgtngay ? new Date(invoice.tbhgtngay) : undefined,
                bhpldo: invoice.bhpldo,
                bhpcbo: invoice.bhpcbo,
                bhpngay: invoice.bhpngay ? new Date(invoice.bhpngay) : undefined,
                tdlhdgoc: invoice.tdlhdgoc ? new Date(invoice.tdlhdgoc) : undefined,
                tgtphi: invoice.tgtphi || 0,
                unhiem: invoice.unhiem,
                mstdvnunlhdon: invoice.mstdvnunlhdon,
                tdvnunlhdon: invoice.tdvnunlhdon,
                nbmdvqhnsach: invoice.nbmdvqhnsach,
                nbsqdinh: invoice.nbsqdinh,
                nbncqdinh: invoice.nbncqdinh,
                nbcqcqdinh: invoice.nbcqcqdinh,
                nbhtban: invoice.nbhtban,
                nmmdvqhnsach: invoice.nmmdvqhnsach,
                nmddvchden: invoice.nmddvchden,
                nmtgvchdtu: invoice.nmtgvchdtu ? new Date(invoice.nmtgvchdtu) : undefined,
                nmtgvchdden: invoice.nmtgvchdden ? new Date(invoice.nmtgvchdden) : undefined,
                nbtnban: invoice.nbtnban,
                dcdvnunlhdon: invoice.dcdvnunlhdon,
                dksbke: invoice.dksbke ? new Date(invoice.dksbke) : undefined,
                dknlbke: invoice.dknlbke ? new Date(invoice.dknlbke) : undefined,
                thtttoan: invoice.thtttoan,
                msttcgp: invoice.msttcgp,
                gchu: invoice.gchu,
                kqcht: invoice.kqcht,
                hdntgia: invoice.hdntgia,
                tgtkcthue: invoice.tgtkcthue || 0,
                tgtkhac: invoice.tgtkhac || 0,
                nmshchieu: invoice.nmshchieu,
                nmnchchieu: invoice.nmnchchieu,
                nmnhhhchieu: invoice.nmnhhhchieu,
                nmqtich: invoice.nmqtich,
                ktkhthue: invoice.ktkhthue,
                nmstttoan: invoice.nmstttoan,
                nmttttoan: invoice.nmttttoan,
                hdhhdvu: invoice.hdhhdvu,
                qrcode: invoice.qrcode,
                ttmstten: invoice.ttmstten,
                ladhddtten: invoice.ladhddtten,
                hdxkhau: invoice.hdxkhau,
                hdxkptquan: invoice.hdxkptquan,
                hdgktkhthue: invoice.hdgktkhthue,
                hdonLquans: invoice.hdonLquans,
                tthdclquan: invoice.tthdclquan,
                pdndungs: invoice.pdndungs,
                hdtbssrses: invoice.hdtbssrses,
                hdTrung: invoice.hdTrung,
                isHDTrung: invoice.isHDTrung,
                hdcttchinh: invoice.hdcttchinh,
                mst: invoice.mst,
                nban: invoice.nban,
                nlap: invoice.nlap,
                nmua: invoice.nmua,
                nnt: invoice.nnt,
                shddauky: invoice.shddauky,
                shdkmdauky: invoice.shdkmdauky,
                nmsdt: invoice.nmsdt,
                brandname: brandname || invoice.brandname,
            }));
            this.logger.log('Starting bulk invoice creation with detailed progress tracking...');
            let lastProgressLog = 0;
            const progressCallback = (progress) => {
                const progressPercent = (progress.processed / progress.total) * 100;
                if (progressPercent - lastProgressLog >= 10 || progress.processed % 5 === 0) {
                    this.logger.log(`📊 Progress: ${progress.processed}/${progress.total} (${progressPercent.toFixed(1)}%) | Saved: ${progress.saved} | Details: ${progress.detailsSaved}`);
                    lastProgressLog = progressPercent;
                }
            };
            const syncResult = await this.invoiceService.bulkCreateInvoices({
                invoices: convertedInvoices,
                skipExisting: true,
                includeDetails: true,
                bearerToken: bearerToken,
            }, progressCallback);
            const duration = Date.now() - startTime;
            const durationMinutes = (duration / 1000 / 60).toFixed(2);
            this.logger.log('='.repeat(80));
            this.logger.log('SYNC OPERATION COMPLETED');
            this.logger.log('='.repeat(80));
            this.logger.log(`Total Duration: ${durationMinutes} minutes (${(duration / 1000).toFixed(2)}s)`);
            this.logger.log(`Invoices Processed: ${syncResult.invoicesSaved}/${convertedInvoices.length}`);
            this.logger.log(`Details Fetched: ${syncResult.detailsSaved}`);
            this.logger.log(`Errors: ${syncResult.errors.length}`);
            this.logger.log(`Success Rate: ${((syncResult.invoicesSaved / convertedInvoices.length) * 100).toFixed(2)}%`);
            this.logger.log('='.repeat(80));
            return {
                ...syncResult,
                metadata: {
                    totalProcessed: convertedInvoices.length,
                    durationMs: duration,
                    durationMinutes: parseFloat(durationMinutes),
                    successRate: parseFloat(((syncResult.invoicesSaved / convertedInvoices.length) * 100).toFixed(2)),
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date().toISOString(),
                }
            };
        }
        catch (error) {
            this.logger.error('REST: Error syncing invoices:', error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getStats() {
        try {
            this.logger.log('REST: Getting invoice statistics');
            return await this.invoiceService.getStats();
        }
        catch (error) {
            this.logger.error('REST: Error getting stats:', error.message);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_input_1.CreateInvoiceInput]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)(':id/details'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "createInvoiceDetails", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "searchInvoices", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoice_input_1.BulkInvoiceInput]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "bulkCreateInvoices", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "syncInvoices", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    (0, roles_decorator_1.Roles)(client_1.$Enums.UserRoleType.ADMIN, client_1.$Enums.UserRoleType.USER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getStats", null);
exports.InvoiceController = InvoiceController = InvoiceController_1 = __decorate([
    (0, common_1.Controller)('api/invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService])
], InvoiceController);
//# sourceMappingURL=invoice.controller.js.map