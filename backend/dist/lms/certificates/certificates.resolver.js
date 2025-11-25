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
exports.CertificatesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const certificates_service_1 = require("./certificates.service");
const certificate_entity_1 = require("./entities/certificate.entity");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/current-user.decorator");
let CertificatesResolver = class CertificatesResolver {
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    generateCertificate(user, enrollmentId) {
        return this.certificatesService.generateCertificate(enrollmentId, user.id);
    }
    getMyCertificates(user) {
        return this.certificatesService.getMyCertificates(user.id);
    }
    getCertificate(user, id) {
        return this.certificatesService.getCertificate(id, user.id);
    }
    verifyCertificate(certificateNumber) {
        return this.certificatesService.verifyCertificate(certificateNumber);
    }
    getCertificateStats(user) {
        return this.certificatesService.getCertificateStats(user.id);
    }
};
exports.CertificatesResolver = CertificatesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => certificate_entity_1.Certificate, { name: 'generateCertificate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('enrollmentId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CertificatesResolver.prototype, "generateCertificate", null);
__decorate([
    (0, graphql_1.Query)(() => [certificate_entity_1.Certificate], { name: 'myCertificates' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CertificatesResolver.prototype, "getMyCertificates", null);
__decorate([
    (0, graphql_1.Query)(() => certificate_entity_1.Certificate, { name: 'certificate' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CertificatesResolver.prototype, "getCertificate", null);
__decorate([
    (0, graphql_1.Query)(() => certificate_entity_1.CertificateVerification, { name: 'verifyCertificate' }),
    __param(0, (0, graphql_1.Args)('certificateNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificatesResolver.prototype, "verifyCertificate", null);
__decorate([
    (0, graphql_1.Query)(() => certificate_entity_1.CertificateStats, { name: 'certificateStats' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CertificatesResolver.prototype, "getCertificateStats", null);
exports.CertificatesResolver = CertificatesResolver = __decorate([
    (0, graphql_1.Resolver)(() => certificate_entity_1.Certificate),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesResolver);
//# sourceMappingURL=certificates.resolver.js.map