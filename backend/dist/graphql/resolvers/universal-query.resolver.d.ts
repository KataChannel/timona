import { DynamicQueryGeneratorService } from '../services/dynamic-query-generator.service';
import { UniversalQueryInput, FindManyInput, FindUniqueInput, CreateInput, CreateManyInput, UpdateInput, UpdateManyInput, UpsertInput, DeleteInput, DeleteManyInput, CountInput, AggregateInput, GroupByInput } from '../inputs/universal-query.input';
export declare class UniversalQueryResolver {
    private readonly dynamicQueryService;
    private readonly logger;
    constructor(dynamicQueryService: DynamicQueryGeneratorService);
    universalQuery(input: UniversalQueryInput): Promise<any>;
    universalMutation(input: UniversalQueryInput): Promise<any>;
    dynamicFindMany(input: FindManyInput): Promise<any>;
    dynamicFindUnique(input: FindUniqueInput): Promise<any>;
    dynamicFindFirst(input: FindManyInput): Promise<any>;
    dynamicCreate(input: CreateInput): Promise<any>;
    dynamicCreateMany(input: CreateManyInput): Promise<any>;
    dynamicUpdate(input: UpdateInput): Promise<any>;
    dynamicUpdateMany(input: UpdateManyInput): Promise<any>;
    dynamicUpsert(input: UpsertInput): Promise<any>;
    dynamicDelete(input: DeleteInput): Promise<any>;
    dynamicDeleteMany(input: DeleteManyInput): Promise<any>;
    dynamicCount(input: CountInput): Promise<any>;
    dynamicAggregate(input: AggregateInput): Promise<any>;
    dynamicGroupBy(input: GroupByInput): Promise<any>;
    listAvailableModels(): Promise<string[]>;
}
