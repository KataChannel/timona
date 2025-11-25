export interface OptimizedImage {
    buffer: Buffer;
    format: 'webp' | 'jpeg' | 'png';
    width: number;
    height: number;
    size: number;
}
export interface ImageOptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
    progressive?: boolean;
}
export declare class ImageOptimizationService {
    private readonly logger;
    private readonly DEFAULT_OPTIONS;
    optimizeImage(buffer: Buffer, options?: ImageOptimizationOptions): Promise<OptimizedImage>;
    generateResponsiveImages(buffer: Buffer, sizes?: {
        name: string;
        width: number;
    }[]): Promise<Map<string, OptimizedImage>>;
    private selectBestFormat;
    private formatBytes;
    isImage(mimeType: string): boolean;
    getExtensionForFormat(format: 'webp' | 'jpeg' | 'png'): string;
}
