import { OramaService } from '../../search/orama.service';
import { OramaSearchResult, UniversalSearchResult, OramaSearchInput, OramaHealthCheck, ReindexResult } from '../models/orama-search.model';
export declare class OramaSearchResolver {
    private readonly oramaService;
    constructor(oramaService: OramaService);
    searchTasks(input: OramaSearchInput, context: any): Promise<OramaSearchResult>;
    searchUsers(input: OramaSearchInput, context: any): Promise<OramaSearchResult>;
    searchProjects(input: OramaSearchInput, context: any): Promise<OramaSearchResult>;
    searchAffiliateCampaigns(input: OramaSearchInput, context: any): Promise<OramaSearchResult>;
    searchAffiliateLinks(input: OramaSearchInput, context: any): Promise<OramaSearchResult>;
    universalSearch(input: OramaSearchInput, context: any): Promise<UniversalSearchResult>;
    oramaHealthCheck(): Promise<OramaHealthCheck>;
    reindexAllData(context: any): Promise<ReindexResult>;
}
