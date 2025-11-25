import { Request } from 'express';
export interface TrackConversionOptions {
    orderId: string;
    saleAmount: number;
    request: Request;
    customerEmail?: string;
    conversionType?: string;
    currency?: string;
    metadata?: Record<string, any>;
}
export interface TrackConversionFromContextOptions {
    orderId: string;
    saleAmount: number;
    context: any;
    customerEmail?: string;
    conversionType?: string;
    currency?: string;
    metadata?: Record<string, any>;
}
export interface TrackConversionManualOptions {
    affiliateRef: string;
    orderId: string;
    saleAmount: number;
    customerEmail?: string;
    conversionType?: string;
    currency?: string;
    metadata?: Record<string, any>;
}
export declare function trackAffiliateConversion(options: TrackConversionOptions): Promise<{
    success: boolean;
    message: string;
    commission?: number;
}>;
export declare function trackAffiliateConversionFromContext(options: TrackConversionFromContextOptions): Promise<{
    success: boolean;
    message: string;
    commission?: number;
}>;
export declare function trackAffiliateConversionManual(options: TrackConversionManualOptions): Promise<{
    success: boolean;
    message: string;
    commission?: number;
}>;
