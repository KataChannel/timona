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
exports.SystemGuideEntity = exports.SystemGuide = exports.GuideType = void 0;
const graphql_1 = require("@nestjs/graphql");
var GuideType;
(function (GuideType) {
    GuideType["QUICK_START"] = "QUICK_START";
    GuideType["TUTORIAL"] = "TUTORIAL";
    GuideType["USER_GUIDE"] = "USER_GUIDE";
    GuideType["API_REFERENCE"] = "API_REFERENCE";
    GuideType["TROUBLESHOOTING"] = "TROUBLESHOOTING";
    GuideType["FAQ"] = "FAQ";
    GuideType["VIDEO_GUIDE"] = "VIDEO_GUIDE";
    GuideType["BEST_PRACTICES"] = "BEST_PRACTICES";
})(GuideType || (exports.GuideType = GuideType = {}));
(0, graphql_1.registerEnumType)(GuideType, { name: 'GuideType' });
let GuideAuthor = class GuideAuthor {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], GuideAuthor.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GuideAuthor.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GuideAuthor.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], GuideAuthor.prototype, "avatar", void 0);
GuideAuthor = __decorate([
    (0, graphql_1.ObjectType)('GuideAuthor')
], GuideAuthor);
let SystemGuide = class SystemGuide {
};
exports.SystemGuide = SystemGuide;
exports.SystemGuideEntity = SystemGuide;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SystemGuide.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SystemGuide.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SystemGuide.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => GuideType),
    __metadata("design:type", String)
], SystemGuide.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SystemGuide.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "difficulty", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SystemGuide.prototype, "attachmentUrls", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SystemGuide.prototype, "orderIndex", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SystemGuide.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => SystemGuide, { nullable: true }),
    __metadata("design:type", SystemGuide)
], SystemGuide.prototype, "parent", void 0);
__decorate([
    (0, graphql_1.Field)(() => [SystemGuide]),
    __metadata("design:type", Array)
], SystemGuide.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SystemGuide.prototype, "relatedGuideIds", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SystemGuide.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SystemGuide.prototype, "keywords", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SystemGuide.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SystemGuide.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SystemGuide.prototype, "viewCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SystemGuide.prototype, "helpfulCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SystemGuide.prototype, "notHelpfulCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], SystemGuide.prototype, "readingTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SystemGuide.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SystemGuide.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "authorId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemGuide.prototype, "updatedById", void 0);
__decorate([
    (0, graphql_1.Field)(() => GuideAuthor, { nullable: true }),
    __metadata("design:type", GuideAuthor)
], SystemGuide.prototype, "author", void 0);
__decorate([
    (0, graphql_1.Field)(() => GuideAuthor, { nullable: true }),
    __metadata("design:type", GuideAuthor)
], SystemGuide.prototype, "updatedBy", void 0);
exports.SystemGuideEntity = exports.SystemGuide = SystemGuide = __decorate([
    (0, graphql_1.ObjectType)()
], SystemGuide);
//# sourceMappingURL=system-guide.entity.js.map