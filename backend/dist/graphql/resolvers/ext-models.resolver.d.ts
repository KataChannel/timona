import { DynamicQueryGeneratorService } from '../services/dynamic-query-generator.service';
export declare class ExtModelsResolver {
    private readonly dynamicQueryService;
    private readonly logger;
    constructor(dynamicQueryService: DynamicQueryGeneratorService);
    getext_sanphamhoadons(filters?: any): Promise<any>;
    getext_sanphamhoadonsPaginated(filters?: any): Promise<any>;
    getext_sanphamhoadonById(id: string, options?: any): Promise<any>;
    createext_sanphamhoadon(data: any, options?: any): Promise<any>;
    updateext_sanphamhoadon(id: string, data: any, options?: any): Promise<any>;
    deleteext_sanphamhoadon(id: string, options?: any): Promise<any>;
    getext_listhoadons(filters?: any): Promise<any>;
    getext_detailhoadons(filters?: any): Promise<any>;
}
