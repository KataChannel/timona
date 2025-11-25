import { Request, Response } from 'express';
import { AffiliateTrackingService } from '../services/affiliate-tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    private readonly logger;
    constructor(trackingService: AffiliateTrackingService);
    trackClick(trackingCode: string, req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    private parseDevice;
    private parseBrowser;
    health(): {
        status: string;
        service: string;
        timestamp: string;
    };
}
