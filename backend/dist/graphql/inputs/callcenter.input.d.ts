import { CallCenterSyncMode, CallDirection, CallStatus } from '../models/callcenter.model';
export declare class CreateCallCenterConfigInput {
    apiUrl: string;
    domain: string;
    apiKey?: string;
    syncMode: CallCenterSyncMode;
    cronExpression?: string;
    isActive: boolean;
    defaultDaysBack: number;
    batchSize: number;
}
export declare class UpdateCallCenterConfigInput {
    apiUrl?: string;
    domain?: string;
    apiKey?: string;
    syncMode?: CallCenterSyncMode;
    cronExpression?: string;
    isActive?: boolean;
    defaultDaysBack?: number;
    batchSize?: number;
}
export declare class SyncCallCenterInput {
    configId?: string;
    fromDate?: Date;
    toDate?: Date;
    fullSync?: boolean;
}
export declare class CallCenterRecordFiltersInput {
    direction?: CallDirection;
    callStatus?: CallStatus;
    callerIdNumber?: string;
    destinationNumber?: string;
    domain?: string;
    startDateFrom?: Date;
    startDateTo?: Date;
    search?: string;
}
