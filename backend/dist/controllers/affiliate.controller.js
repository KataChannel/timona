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
exports.AffiliateController = void 0;
const common_1 = require("@nestjs/common");
const affiliate_tracking_service_1 = require("../services/affiliate-tracking.service");
let AffiliateController = class AffiliateController {
    constructor(affiliateTrackingService) {
        this.affiliateTrackingService = affiliateTrackingService;
    }
    async handleTrackingLink(trackingCode, request, response) {
        try {
            const result = await this.affiliateTrackingService.trackClickFromRequest(trackingCode, request);
            response.cookie('aff_visitor_id', result.visitorId, {
                maxAge: 90 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            response.redirect(common_1.HttpStatus.FOUND, result.redirectUrl);
        }
        catch (error) {
            response.status(common_1.HttpStatus.NOT_FOUND).json({
                message: 'Tracking link not found or expired',
                error: error.message,
            });
        }
    }
    async trackingPixel(trackingCode, request, response) {
        try {
            await this.affiliateTrackingService.trackClickFromRequest(trackingCode, request);
            const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
            response.setHeader('Content-Type', 'image/png');
            response.setHeader('Content-Length', pixel.length);
            response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Expires', '0');
            response.send(pixel);
        }
        catch (error) {
            const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
            response.setHeader('Content-Type', 'image/png');
            response.send(pixel);
        }
    }
};
exports.AffiliateController = AffiliateController;
__decorate([
    (0, common_1.Get)(':trackingCode'),
    __param(0, (0, common_1.Param)('trackingCode')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "handleTrackingLink", null);
__decorate([
    (0, common_1.Get)('pixel/:trackingCode'),
    __param(0, (0, common_1.Param)('trackingCode')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AffiliateController.prototype, "trackingPixel", null);
exports.AffiliateController = AffiliateController = __decorate([
    (0, common_1.Controller)('aff'),
    __metadata("design:paramtypes", [affiliate_tracking_service_1.AffiliateTrackingService])
], AffiliateController);
//# sourceMappingURL=affiliate.controller.js.map