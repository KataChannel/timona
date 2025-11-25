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
var TrackingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const affiliate_tracking_service_1 = require("../services/affiliate-tracking.service");
let TrackingController = TrackingController_1 = class TrackingController {
    constructor(trackingService) {
        this.trackingService = trackingService;
        this.logger = new common_1.Logger(TrackingController_1.name);
    }
    async trackClick(trackingCode, req, res) {
        try {
            this.logger.log(`Click tracking request: ${trackingCode}`);
            const link = await this.trackingService.findLinkByCode(trackingCode);
            if (!link || !link.isActive) {
                this.logger.warn(`Link not found or inactive: ${trackingCode}`);
                return res.status(404).send('Link not found or inactive');
            }
            if (link.campaign.status !== 'ACTIVE') {
                this.logger.warn(`Campaign not active: ${link.campaign.id}`);
                return res.status(410).send('Campaign is not active');
            }
            if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
                this.logger.warn(`Link expired: ${trackingCode}`);
                return res.status(410).send('Link has expired');
            }
            const ipAddress = (req.headers['x-forwarded-for'] ||
                req.headers['x-real-ip'] ||
                req.socket.remoteAddress ||
                'unknown').split(',')[0].trim();
            const refererHeader = req.headers['referer'] || req.headers['referrer'];
            const clickData = {
                linkId: link.id,
                ipAddress,
                userAgent: req.headers['user-agent'] || 'unknown',
                referer: Array.isArray(refererHeader) ? refererHeader[0] : (refererHeader || null),
                device: this.parseDevice(req.headers['user-agent']),
                browser: this.parseBrowser(req.headers['user-agent']),
                country: req.headers['cf-ipcountry'] || null,
            };
            await this.trackingService.trackClick(clickData);
            this.logger.log(`Click tracked successfully: ${trackingCode}`);
            const cookieDuration = 30;
            res.cookie('aff_ref', trackingCode, {
                maxAge: cookieDuration * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                domain: process.env.COOKIE_DOMAIN || undefined,
            });
            this.logger.log(`Cookie set: aff_ref=${trackingCode}, duration=${cookieDuration} days`);
            return res.redirect(302, link.originalUrl);
        }
        catch (error) {
            this.logger.error(`Click tracking error: ${error.message}`, error.stack);
            return res.status(500).send('Internal server error');
        }
    }
    parseDevice(userAgent) {
        if (!userAgent)
            return 'unknown';
        const ua = userAgent.toLowerCase();
        if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
            return 'mobile';
        }
        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            return 'tablet';
        }
        return 'desktop';
    }
    parseBrowser(userAgent) {
        if (!userAgent)
            return 'unknown';
        const ua = userAgent.toLowerCase();
        if (/edg/i.test(ua))
            return 'edge';
        if (/chrome|crios/i.test(ua))
            return 'chrome';
        if (/firefox|fxios/i.test(ua))
            return 'firefox';
        if (/safari/i.test(ua) && !/chrome/i.test(ua))
            return 'safari';
        if (/opera|opr/i.test(ua))
            return 'opera';
        if (/trident|msie/i.test(ua))
            return 'ie';
        return 'other';
    }
    health() {
        return {
            status: 'ok',
            service: 'tracking',
            timestamp: new Date().toISOString()
        };
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Get)('click/:trackingCode'),
    __param(0, (0, common_1.Param)('trackingCode')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackClick", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrackingController.prototype, "health", null);
exports.TrackingController = TrackingController = TrackingController_1 = __decorate([
    (0, common_1.Controller)('track'),
    __metadata("design:paramtypes", [affiliate_tracking_service_1.AffiliateTrackingService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map