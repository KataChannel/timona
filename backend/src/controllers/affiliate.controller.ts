import { Controller, Get, Param, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AffiliateTrackingService } from '../services/affiliate-tracking.service';

@Controller('aff')
export class AffiliateController {
  constructor(
    private readonly affiliateTrackingService: AffiliateTrackingService,
  ) {}

  @Get(':trackingCode')
  async handleTrackingLink(
    @Param('trackingCode') trackingCode: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const result = await this.affiliateTrackingService.trackClickFromRequest(trackingCode, request);
      
      // Set visitor ID cookie for future tracking
      response.cookie('aff_visitor_id', result.visitorId, {
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      // Redirect to the original URL
      response.redirect(HttpStatus.FOUND, result.redirectUrl);
    } catch (error) {
      // If tracking fails, redirect to a fallback URL or show error page
      response.status(HttpStatus.NOT_FOUND).json({
        message: 'Tracking link not found or expired',
        error: error.message,
      });
    }
  }

  @Get('pixel/:trackingCode')
  async trackingPixel(
    @Param('trackingCode') trackingCode: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      // Track the click/view
      await this.affiliateTrackingService.trackClickFromRequest(trackingCode, request);
      
      // Return 1x1 transparent pixel
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      
      response.setHeader('Content-Type', 'image/png');
      response.setHeader('Content-Length', pixel.length);
      response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('Expires', '0');
      
      response.send(pixel);
    } catch (error) {
      // Return empty pixel even on error to not break page loading
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      response.setHeader('Content-Type', 'image/png');
      response.send(pixel);
    }
  }
}