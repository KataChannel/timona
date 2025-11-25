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
exports.SystemReleaseWhereInput = exports.UpdateSystemReleaseInput = exports.CreateSystemReleaseInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
let CreateSystemReleaseInput = class CreateSystemReleaseInput {
};
exports.CreateSystemReleaseInput = CreateSystemReleaseInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "version", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "versionNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.ReleaseType),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "releaseType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "summary", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "improvements", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "bugfixes", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "breakingChanges", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "releaseNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "upgradeGuide", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "deprecations", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateSystemReleaseInput.prototype, "deploymentDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], CreateSystemReleaseInput.prototype, "releaseDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "screenshotUrls", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateSystemReleaseInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreateSystemReleaseInput.prototype, "keywords", void 0);
exports.CreateSystemReleaseInput = CreateSystemReleaseInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSystemReleaseInput);
let UpdateSystemReleaseInput = class UpdateSystemReleaseInput {
};
exports.UpdateSystemReleaseInput = UpdateSystemReleaseInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "version", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "versionNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.ReleaseType, { nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "releaseType", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.ReleaseStatus, { nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "summary", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "improvements", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "bugfixes", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "breakingChanges", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "releaseNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "upgradeGuide", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "deprecations", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateSystemReleaseInput.prototype, "deploymentDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], UpdateSystemReleaseInput.prototype, "releaseDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "screenshotUrls", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "metaTitle", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateSystemReleaseInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateSystemReleaseInput.prototype, "keywords", void 0);
exports.UpdateSystemReleaseInput = UpdateSystemReleaseInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateSystemReleaseInput);
let SystemReleaseWhereInput = class SystemReleaseWhereInput {
};
exports.SystemReleaseWhereInput = SystemReleaseWhereInput;
__decorate([
    (0, graphql_1.Field)(() => client_1.ReleaseStatus, { nullable: true }),
    __metadata("design:type", String)
], SystemReleaseWhereInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.ReleaseType, { nullable: true }),
    __metadata("design:type", String)
], SystemReleaseWhereInput.prototype, "releaseType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SystemReleaseWhereInput.prototype, "search", void 0);
exports.SystemReleaseWhereInput = SystemReleaseWhereInput = __decorate([
    (0, graphql_1.InputType)()
], SystemReleaseWhereInput);
//# sourceMappingURL=system-release.input.js.map