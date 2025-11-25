import { Controller, Get, Param, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AffiliateTrackingService } from '../services/affiliate-tracking.service';

@Controller('track')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(
    private readonly trackingService: AffiliateTrackingService
  ) {}

  @Get('click/:trackingCode')
  async trackClick(
    @Param('trackingCode') trackingCode: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      this.logger.log(`Click tracking request: ${trackingCode}`);

      // 1. Find link by tracking code
      const link = await this.trackingService.findLinkByCode(trackingCode);
      
      if (!link || !link.isActive) {
        this.logger.warn(`Link not found or inactive: ${trackingCode}`);
        return res.status(404).send('Link not found or inactive');
      }

      // 2. Check if campaign is active
      if (link.campaign.status !== 'ACTIVE') {
        this.logger.warn(`Campaign not active: ${link.campaign.id}`);
        return res.status(410).send('Campaign is not active');
      }

      // 3. Check link expiry
      if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
        this.logger.warn(`Link expired: ${trackingCode}`);
        return res.status(410).send('Link has expired');
      }

      // 4. Extract IP address (handle proxy/load balancer)
      const ipAddress = (
        req.headers['x-forwarded-for'] as string ||
        req.headers['x-real-ip'] as string ||
        req.socket.remoteAddress ||
        'unknown'
      ).split(',')[0].trim();

      // 5. Record click with geo/device data
      const refererHeader = req.headers['referer'] || req.headers['referrer'];
      const clickData = {
        linkId: link.id,
        ipAddress,
        userAgent: req.headers['user-agent'] || 'unknown',
        referer: Array.isArray(refererHeader) ? refererHeader[0] : (refererHeader || null),
        device: this.parseDevice(req.headers['user-agent']),
        browser: this.parseBrowser(req.headers['user-agent']),
        country: req.headers['cf-ipcountry'] as string || null, // Cloudflare header
      };

      await this.trackingService.trackClick(clickData);
      this.logger.log(`Click tracked successfully: ${trackingCode}`);

      // 6. Set affiliate cookie (30 days default)
      const cookieDuration = 30; // Default cookie duration in days
      res.cookie('aff_ref', trackingCode, {
        maxAge: cookieDuration * 24 * 60 * 60 * 1000, // days to ms
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined, // Allow subdomain access
      });

      this.logger.log(`Cookie set: aff_ref=${trackingCode}, duration=${cookieDuration} days`);

      // 7. Redirect to original URL
      return res.redirect(302, link.originalUrl);
      
    } catch (error) {
      this.logger.error(`Click tracking error: ${error.message}`, error.stack);
      return res.status(500).send('Internal server error');
    }
  }

  /**
   * Parse device type from user agent
   */
  private parseDevice(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return 'mobile';
    }
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Parse browser from user agent
   */
  private parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    const ua = userAgent.toLowerCase();
    
    if (/edg/i.test(ua)) return 'edge';
    if (/chrome|crios/i.test(ua)) return 'chrome';
    if (/firefox|fxios/i.test(ua)) return 'firefox';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'safari';
    if (/opera|opr/i.test(ua)) return 'opera';
    if (/trident|msie/i.test(ua)) return 'ie';
    
    return 'other';
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'tracking',
      timestamp: new Date().toISOString()
    };
  }
}
