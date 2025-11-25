import { AdvancedCacheService } from '../common/services/advanced-cache.service';
export interface EditOperation {
    type: 'insert' | 'delete' | 'retain';
    position: number;
    content?: string;
    length?: number;
}
export interface TransformedOperation extends EditOperation {
    version: number;
    userId: string;
    timestamp: Date;
}
export interface DocumentState {
    taskId: string;
    content: string;
    version: number;
    lastModified: Date;
    collaborators: Set<string>;
}
export declare class CollaborationService {
    private cacheService;
    private readonly logger;
    private documentStates;
    private operationHistory;
    private documentLocks;
    constructor(cacheService: AdvancedCacheService);
    startEditing(userId: string, taskId: string, field: string): Promise<void>;
    stopEditing(userId: string, taskId: string, field: string): Promise<void>;
    applyOperation(taskId: string, operation: EditOperation, version: number, userId: string): Promise<TransformedOperation>;
    private performOperation;
    private transformOperation;
    private transformAgainstOperation;
    private applyOperationToContent;
    private initializeDocumentState;
    private cleanupDocumentState;
    private cacheDocumentState;
    private loadDocumentStateFromCache;
    private loadInitialContent;
    private saveFinalContent;
    getDocumentState(taskId: string, field: string): Promise<DocumentState | null>;
    getCollaborators(taskId: string, field: string): Promise<string[]>;
    getOperationHistory(taskId: string, field: string, limit?: number): Promise<TransformedOperation[]>;
}
