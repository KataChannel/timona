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
exports.AuditLog = exports.UserSession = exports.VerificationToken = exports.AuthMethod = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
(0, graphql_1.registerEnumType)(client_1.$Enums.UserRoleType, {
    name: 'UserRole',
});
(0, graphql_1.registerEnumType)(client_1.$Enums.AuthProvider, {
    name: 'AuthProvider',
});
(0, graphql_1.registerEnumType)(client_1.$Enums.TokenType, {
    name: 'TokenType',
});
let AuthMethod = class AuthMethod {
};
exports.AuthMethod = AuthMethod;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AuthMethod.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.AuthProvider),
    __metadata("design:type", String)
], AuthMethod.prototype, "provider", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuthMethod.prototype, "providerId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], AuthMethod.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AuthMethod.prototype, "createdAt", void 0);
exports.AuthMethod = AuthMethod = __decorate([
    (0, graphql_1.ObjectType)()
], AuthMethod);
let VerificationToken = class VerificationToken {
};
exports.VerificationToken = VerificationToken;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], VerificationToken.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], VerificationToken.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.$Enums.TokenType),
    __metadata("design:type", String)
], VerificationToken.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], VerificationToken.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], VerificationToken.prototype, "isUsed", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], VerificationToken.prototype, "createdAt", void 0);
exports.VerificationToken = VerificationToken = __decorate([
    (0, graphql_1.ObjectType)()
], VerificationToken);
let UserSession = class UserSession {
};
exports.UserSession = UserSession;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserSession.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], UserSession.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UserSession.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], UserSession.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserSession.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], UserSession.prototype, "createdAt", void 0);
exports.UserSession = UserSession = __decorate([
    (0, graphql_1.ObjectType)()
], UserSession);
let AuditLog = class AuditLog {
};
exports.AuditLog = AuditLog;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, graphql_1.ObjectType)()
], AuditLog);
//# sourceMappingURL=auth-extended.model.js.map