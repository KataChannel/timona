import { Request, Response } from 'express';
import { AffiliateTrackingService } from '../services/affiliate-tracking.service';
export declare class AffiliateController {
    private readonly affiliateTrackingService;
    constructor(affiliateTrackingService: AffiliateTrackingService);
    handleTrackingLink(trackingCode: string, request: Request, response: Response): Promise<void>;
    trackingPixel(trackingCode: string, request: Request, response: Response): Promise<void>;
}
