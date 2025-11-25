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
exports.ImportResult = exports.InvoiceCreated = exports.ImportStatistics = exports.ImportError = exports.DatabaseSyncResult = exports.InvoiceSearchResult = exports.InvoiceStats = exports.ExtDetailhoadon = exports.ExtListhoadon = void 0;
const graphql_1 = require("@nestjs/graphql");
let ExtListhoadon = class ExtListhoadon {
};
exports.ExtListhoadon = ExtListhoadon;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "idServer", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbmst", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "khmshdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "khhdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "shdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "cqt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "hdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "hthdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "htttoan", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbdchi", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbten", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbstkhoan", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbsdthoai", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbdctdtu", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbfax", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nbwebsite", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmdchi", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmmst", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmten", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmstkhoan", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmsdthoai", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmdctdtu", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "nmcmnd", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], ExtListhoadon.prototype, "tdlap", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgia", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgtcthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgtthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "tgtttbchu", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgtttbso", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgtphi", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgtkcthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtListhoadon.prototype, "tgtkhac", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "thdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "thlap", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "tlhdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "tthai", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "tttbao", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "ttxly", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "mhso", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ExtListhoadon.prototype, "ladhddt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "mkhang", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "qrcode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "gchu", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "msttcgp", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "brandname", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtListhoadon.prototype, "hdTrung", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], ExtListhoadon.prototype, "isHDTrung", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ExtListhoadon.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ExtListhoadon.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ExtDetailhoadon], { nullable: true }),
    __metadata("design:type", Array)
], ExtListhoadon.prototype, "details", void 0);
exports.ExtListhoadon = ExtListhoadon = __decorate([
    (0, graphql_1.ObjectType)()
], ExtListhoadon);
let ExtDetailhoadon = class ExtDetailhoadon {
};
exports.ExtDetailhoadon = ExtDetailhoadon;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "idhdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "dgia", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "dvtinh", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "ltsuat", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "sluong", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "stbchu", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "stckhau", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "stt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "tchat", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "ten", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "thtcthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "thtien", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "tlckhau", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "tsuat", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "tthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "sxep", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "dvtte", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], ExtDetailhoadon.prototype, "tgia", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ExtDetailhoadon.prototype, "tthhdtrung", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ExtDetailhoadon.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ExtDetailhoadon.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => ExtListhoadon, { nullable: true }),
    __metadata("design:type", ExtListhoadon)
], ExtDetailhoadon.prototype, "invoice", void 0);
exports.ExtDetailhoadon = ExtDetailhoadon = __decorate([
    (0, graphql_1.ObjectType)()
], ExtDetailhoadon);
let InvoiceStats = class InvoiceStats {
};
exports.InvoiceStats = InvoiceStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceStats.prototype, "totalInvoices", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceStats.prototype, "totalDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceStats.prototype, "lastSyncDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], InvoiceStats.prototype, "totalAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], InvoiceStats.prototype, "totalTax", void 0);
exports.InvoiceStats = InvoiceStats = __decorate([
    (0, graphql_1.ObjectType)()
], InvoiceStats);
let InvoiceSearchResult = class InvoiceSearchResult {
};
exports.InvoiceSearchResult = InvoiceSearchResult;
__decorate([
    (0, graphql_1.Field)(() => [ExtListhoadon]),
    __metadata("design:type", Array)
], InvoiceSearchResult.prototype, "invoices", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceSearchResult.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceSearchResult.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceSearchResult.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceSearchResult.prototype, "totalPages", void 0);
exports.InvoiceSearchResult = InvoiceSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], InvoiceSearchResult);
let DatabaseSyncResult = class DatabaseSyncResult {
};
exports.DatabaseSyncResult = DatabaseSyncResult;
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], DatabaseSyncResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DatabaseSyncResult.prototype, "invoicesSaved", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DatabaseSyncResult.prototype, "detailsSaved", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], DatabaseSyncResult.prototype, "errors", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], DatabaseSyncResult.prototype, "message", void 0);
exports.DatabaseSyncResult = DatabaseSyncResult = __decorate([
    (0, graphql_1.ObjectType)()
], DatabaseSyncResult);
let ImportError = class ImportError {
};
exports.ImportError = ImportError;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportError.prototype, "row", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ImportError.prototype, "error", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ImportError.prototype, "data", void 0);
exports.ImportError = ImportError = __decorate([
    (0, graphql_1.ObjectType)()
], ImportError);
let ImportStatistics = class ImportStatistics {
};
exports.ImportStatistics = ImportStatistics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportStatistics.prototype, "totalInvoices", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportStatistics.prototype, "totalDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportStatistics.prototype, "invoicesCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportStatistics.prototype, "detailsCreated", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportStatistics.prototype, "duplicatesSkipped", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportStatistics.prototype, "validationErrors", void 0);
exports.ImportStatistics = ImportStatistics = __decorate([
    (0, graphql_1.ObjectType)()
], ImportStatistics);
let InvoiceCreated = class InvoiceCreated {
};
exports.InvoiceCreated = InvoiceCreated;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], InvoiceCreated.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], InvoiceCreated.prototype, "shdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], InvoiceCreated.prototype, "khhdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], InvoiceCreated.prototype, "nbten", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], InvoiceCreated.prototype, "nmten", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], InvoiceCreated.prototype, "tgtttbso", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], InvoiceCreated.prototype, "detailsCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], InvoiceCreated.prototype, "status", void 0);
exports.InvoiceCreated = InvoiceCreated = __decorate([
    (0, graphql_1.ObjectType)()
], InvoiceCreated);
let ImportResult = class ImportResult {
};
exports.ImportResult = ImportResult;
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], ImportResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportResult.prototype, "totalRows", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportResult.prototype, "successCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ImportResult.prototype, "errorCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ImportError]),
    __metadata("design:type", Array)
], ImportResult.prototype, "errors", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], ImportResult.prototype, "invoiceIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ImportResult.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => ImportStatistics),
    __metadata("design:type", ImportStatistics)
], ImportResult.prototype, "statistics", void 0);
__decorate([
    (0, graphql_1.Field)(() => [InvoiceCreated]),
    __metadata("design:type", Array)
], ImportResult.prototype, "invoicesCreated", void 0);
exports.ImportResult = ImportResult = __decorate([
    (0, graphql_1.ObjectType)()
], ImportResult);
//# sourceMappingURL=invoice.model.js.map