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
exports.BulkInvoiceInput = exports.InvoiceSearchInput = exports.CreateInvoiceDetailInput = exports.CreateInvoiceInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let CreateInvoiceInput = class CreateInvoiceInput {
};
exports.CreateInvoiceInput = CreateInvoiceInput;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "idServer", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nbmst", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "khmshdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "khhdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "shdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "cqt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "hthdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "htttoan", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nbdchi", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nbten", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nbstkhoan", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nbsdthoai", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nmdchi", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nmmst", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nmten", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "nmstkhoan", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], CreateInvoiceInput.prototype, "tdlap", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceInput.prototype, "tgtcthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceInput.prototype, "tgtthue", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "tgtttbchu", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceInput.prototype, "tgtttbso", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "tthai", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "gchu", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], CreateInvoiceInput.prototype, "ladhddt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceInput.prototype, "brandname", void 0);
exports.CreateInvoiceInput = CreateInvoiceInput = __decorate([
    (0, graphql_1.InputType)()
], CreateInvoiceInput);
let CreateInvoiceDetailInput = class CreateInvoiceDetailInput {
};
exports.CreateInvoiceDetailInput = CreateInvoiceDetailInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CreateInvoiceDetailInput.prototype, "idhdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceDetailInput.prototype, "dgia", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceDetailInput.prototype, "dvtinh", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceDetailInput.prototype, "sluong", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceDetailInput.prototype, "stt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CreateInvoiceDetailInput.prototype, "ten", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceDetailInput.prototype, "thtien", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceDetailInput.prototype, "tsuat", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], CreateInvoiceDetailInput.prototype, "tthue", void 0);
exports.CreateInvoiceDetailInput = CreateInvoiceDetailInput = __decorate([
    (0, graphql_1.InputType)()
], CreateInvoiceDetailInput);
let InvoiceSearchInput = class InvoiceSearchInput {
};
exports.InvoiceSearchInput = InvoiceSearchInput;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "nbmst", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "nmmst", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "khmshdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "shdon", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceSearchInput.prototype, "fromDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], InvoiceSearchInput.prototype, "toDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "tthai", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    __metadata("design:type", Number)
], InvoiceSearchInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    __metadata("design:type", Number)
], InvoiceSearchInput.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, defaultValue: 'tdlap' }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true, defaultValue: 'desc' }),
    __metadata("design:type", String)
], InvoiceSearchInput.prototype, "sortOrder", void 0);
exports.InvoiceSearchInput = InvoiceSearchInput = __decorate([
    (0, graphql_1.InputType)()
], InvoiceSearchInput);
let BulkInvoiceInput = class BulkInvoiceInput {
};
exports.BulkInvoiceInput = BulkInvoiceInput;
__decorate([
    (0, graphql_1.Field)(() => [CreateInvoiceInput]),
    __metadata("design:type", Array)
], BulkInvoiceInput.prototype, "invoices", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: false }),
    __metadata("design:type", Boolean)
], BulkInvoiceInput.prototype, "skipExisting", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true, defaultValue: true }),
    __metadata("design:type", Boolean)
], BulkInvoiceInput.prototype, "includeDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BulkInvoiceInput.prototype, "bearerToken", void 0);
exports.BulkInvoiceInput = BulkInvoiceInput = __decorate([
    (0, graphql_1.InputType)()
], BulkInvoiceInput);
//# sourceMappingURL=invoice.input.js.map