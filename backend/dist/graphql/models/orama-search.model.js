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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReindexResult = exports.OramaHealthCheck = exports.OramaSearchInput = exports.OramaSortInput = exports.OramaSortOrder = exports.UniversalSearchResult = exports.OramaSearchResult = exports.OramaElapsed = exports.OramaSearchHit = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const class_validator_1 = require("class-validator");
let OramaSearchHit = class OramaSearchHit {
};
exports.OramaSearchHit = OramaSearchHit;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OramaSearchHit.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OramaSearchHit.prototype, "score", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], OramaSearchHit.prototype, "document", void 0);
exports.OramaSearchHit = OramaSearchHit = __decorate([
    (0, graphql_1.ObjectType)()
], OramaSearchHit);
let OramaElapsed = class OramaElapsed {
};
exports.OramaElapsed = OramaElapsed;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OramaElapsed.prototype, "formatted", void 0);
exports.OramaElapsed = OramaElapsed = __decorate([
    (0, graphql_1.ObjectType)()
], OramaElapsed);
let OramaSearchResult = class OramaSearchResult {
};
exports.OramaSearchResult = OramaSearchResult;
__decorate([
    (0, graphql_1.Field)(() => [OramaSearchHit]),
    __metadata("design:type", Array)
], OramaSearchResult.prototype, "hits", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OramaSearchResult.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaElapsed),
    __metadata("design:type", OramaElapsed)
], OramaSearchResult.prototype, "elapsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], OramaSearchResult.prototype, "facets", void 0);
exports.OramaSearchResult = OramaSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], OramaSearchResult);
let UniversalSearchResult = class UniversalSearchResult {
};
exports.UniversalSearchResult = UniversalSearchResult;
__decorate([
    (0, graphql_1.Field)(() => OramaSearchResult),
    __metadata("design:type", OramaSearchResult)
], UniversalSearchResult.prototype, "tasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaSearchResult),
    __metadata("design:type", OramaSearchResult)
], UniversalSearchResult.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaSearchResult),
    __metadata("design:type", OramaSearchResult)
], UniversalSearchResult.prototype, "projects", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaSearchResult),
    __metadata("design:type", OramaSearchResult)
], UniversalSearchResult.prototype, "affiliateCampaigns", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaSearchResult),
    __metadata("design:type", OramaSearchResult)
], UniversalSearchResult.prototype, "affiliateLinks", void 0);
exports.UniversalSearchResult = UniversalSearchResult = __decorate([
    (0, graphql_1.ObjectType)()
], UniversalSearchResult);
var OramaSortOrder;
(function (OramaSortOrder) {
    OramaSortOrder["ASC"] = "ASC";
    OramaSortOrder["DESC"] = "DESC";
})(OramaSortOrder || (exports.OramaSortOrder = OramaSortOrder = {}));
(0, graphql_1.registerEnumType)(OramaSortOrder, {
    name: 'OramaSortOrder',
    description: 'Sort order for search results',
});
let OramaSortInput = class OramaSortInput {
};
exports.OramaSortInput = OramaSortInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OramaSortInput.prototype, "property", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaSortOrder),
    (0, class_validator_1.IsEnum)(OramaSortOrder),
    __metadata("design:type", String)
], OramaSortInput.prototype, "order", void 0);
exports.OramaSortInput = OramaSortInput = __decorate([
    (0, graphql_1.InputType)()
], OramaSortInput);
let OramaSearchInput = class OramaSearchInput {
};
exports.OramaSearchInput = OramaSearchInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OramaSearchInput.prototype, "term", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], OramaSearchInput.prototype, "where", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], OramaSearchInput.prototype, "facets", void 0);
__decorate([
    (0, graphql_1.Field)(() => OramaSortInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", OramaSortInput)
], OramaSearchInput.prototype, "sortBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], OramaSearchInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], OramaSearchInput.prototype, "offset", void 0);
exports.OramaSearchInput = OramaSearchInput = __decorate([
    (0, graphql_1.InputType)()
], OramaSearchInput);
let OramaHealthCheck = class OramaHealthCheck {
};
exports.OramaHealthCheck = OramaHealthCheck;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OramaHealthCheck.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], OramaHealthCheck.prototype, "indexes", void 0);
exports.OramaHealthCheck = OramaHealthCheck = __decorate([
    (0, graphql_1.ObjectType)()
], OramaHealthCheck);
let ReindexResult = class ReindexResult {
};
exports.ReindexResult = ReindexResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ReindexResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ReindexResult.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], ReindexResult.prototype, "totalIndexed", void 0);
exports.ReindexResult = ReindexResult = __decorate([
    (0, graphql_1.ObjectType)()
], ReindexResult);
//# sourceMappingURL=orama-search.model.js.map