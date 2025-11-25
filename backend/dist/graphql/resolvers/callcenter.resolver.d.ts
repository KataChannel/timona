import { CallCenterRecord, CallCenterConfig, PaginatedCallCenterRecords, SyncCallCenterResponse } from '../models/callcenter.model';
import { CreateCallCenterConfigInput, UpdateCallCenterConfigInput, SyncCallCenterInput, CallCenterRecordFiltersInput } from '../inputs/callcenter.input';
import { PaginationInput } from '../models/pagination.model';
import { CallCenterService } from '../../services/callcenter.service';
export declare class CallCenterResolver {
    private readonly callCenterService;
    constructor(callCenterService: CallCenterService);
    getConfig(): Promise<CallCenterConfig>;
    createConfig(input: CreateCallCenterConfigInput): Promise<CallCenterConfig>;
    updateConfig(id: string, input: UpdateCallCenterConfigInput): Promise<CallCenterConfig>;
    deleteConfig(id: string): Promise<CallCenterConfig>;
    syncData(input?: SyncCallCenterInput): Promise<SyncCallCenterResponse>;
    getRecords(pagination: PaginationInput, filters?: CallCenterRecordFiltersInput): Promise<PaginatedCallCenterRecords>;
    getRecordById(id: string): Promise<CallCenterRecord>;
    getSyncLogs(pagination: PaginationInput): Promise<{
        id: string;
        errorMessage: string | null;
        status: string;
        completedAt: Date | null;
        fromDate: Date;
        toDate: Date;
        offset: number;
        duration: number | null;
        configId: string | null;
        syncType: import("@prisma/client").$Enums.CallCenterSyncMode;
        recordsFetched: number;
        recordsCreated: number;
        recordsUpdated: number;
        recordsSkipped: number;
        errorDetails: import("@prisma/client/runtime/library").JsonValue | null;
        startedAt: Date;
    }[]>;
}
