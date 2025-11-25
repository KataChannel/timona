export declare enum CallDirection {
    INBOUND = "INBOUND",
    OUTBOUND = "OUTBOUND",
    LOCAL = "LOCAL"
}
export declare enum CallStatus {
    ANSWER = "ANSWER",
    CANCELED = "CANCELED",
    BUSY = "BUSY",
    NO_ANSWER = "NO_ANSWER",
    FAILED = "FAILED",
    UNKNOWN = "UNKNOWN"
}
export declare enum CallCenterSyncMode {
    MANUAL = "MANUAL",
    SCHEDULED = "SCHEDULED"
}
export declare class CallCenterRecord {
    id: string;
    externalUuid: string;
    direction: CallDirection;
    callerIdNumber?: string;
    outboundCallerIdNumber?: string;
    destinationNumber?: string;
    startEpoch?: string;
    endEpoch?: string;
    answerEpoch?: string;
    duration?: string;
    billsec?: string;
    sipHangupDisposition?: string;
    callStatus: CallStatus;
    recordPath?: string;
    domain?: string;
    rawData?: any;
    syncedAt: Date;
    updatedAt: Date;
}
export declare class CallCenterConfig {
    id: string;
    apiUrl: string;
    domain: string;
    apiKey?: string;
    syncMode: CallCenterSyncMode;
    cronExpression?: string;
    isActive: boolean;
    defaultDaysBack: number;
    batchSize: number;
    lastSyncAt?: Date;
    lastSyncStatus?: string;
    lastSyncError?: string;
    totalRecordsSynced: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CallCenterSyncLog {
    id: string;
    configId?: string;
    syncType: CallCenterSyncMode;
    status: string;
    fromDate: Date;
    toDate: Date;
    offset: number;
    recordsFetched: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsSkipped: number;
    errorMessage?: string;
    errorDetails?: any;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
}
export declare class CallCenterRecordPaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare class PaginatedCallCenterRecords {
    items: CallCenterRecord[];
    pagination: CallCenterRecordPaginationInfo;
}
export declare class SyncCallCenterResponse {
    success: boolean;
    message: string;
    syncLogId?: string;
    recordsFetched: number;
    recordsCreated: number;
    recordsUpdated: number;
    error?: string;
}
