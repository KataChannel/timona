import { ConfigService } from '@nestjs/config';
export declare class GrokService {
    private readonly configService;
    private readonly logger;
    private readonly httpClient;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    generateSummary(content: string, maxLength?: number): Promise<string>;
    generatePostExcerpt(title: string, content: string): Promise<string>;
    generateTags(content: string, maxTags?: number): Promise<string[]>;
    improveContent(content: string, instruction: string): Promise<string>;
}
