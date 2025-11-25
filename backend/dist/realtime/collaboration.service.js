"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CollaborationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborationService = void 0;
const common_1 = require("@nestjs/common");
const advanced_cache_service_1 = require("../common/services/advanced-cache.service");
let CollaborationService = CollaborationService_1 = class CollaborationService {
    constructor(cacheService) {
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(CollaborationService_1.name);
        this.documentStates = new Map();
        this.operationHistory = new Map();
        this.documentLocks = new Map();
    }
    async startEditing(userId, taskId, field) {
        try {
            const documentKey = `${taskId}:${field}`;
            if (!this.documentStates.has(documentKey)) {
                await this.initializeDocumentState(documentKey, taskId, field);
            }
            const docState = this.documentStates.get(documentKey);
            docState.collaborators.add(userId);
            await this.cacheService.set(`collaboration:editing:${documentKey}`, {
                collaborators: Array.from(docState.collaborators),
                version: docState.version,
                lastModified: docState.lastModified,
            }, { layer: 'L1_FAST', ttl: 300 });
            this.logger.debug(`User ${userId} started editing ${documentKey}`);
        }
        catch (error) {
            this.logger.error(`Error starting editing session: ${error.message}`);
            throw error;
        }
    }
    async stopEditing(userId, taskId, field) {
        try {
            const documentKey = `${taskId}:${field}`;
            const docState = this.documentStates.get(documentKey);
            if (docState) {
                docState.collaborators.delete(userId);
                if (docState.collaborators.size === 0) {
                    await this.cleanupDocumentState(documentKey);
                }
                else {
                    await this.cacheService.set(`collaboration:editing:${documentKey}`, {
                        collaborators: Array.from(docState.collaborators),
                        version: docState.version,
                        lastModified: docState.lastModified,
                    }, { layer: 'L1_FAST', ttl: 300 });
                }
            }
            this.logger.debug(`User ${userId} stopped editing ${documentKey}`);
        }
        catch (error) {
            this.logger.error(`Error stopping editing session: ${error.message}`);
            throw error;
        }
    }
    async applyOperation(taskId, operation, version, userId) {
        const documentKey = `${taskId}:content`;
        if (this.documentLocks.has(documentKey)) {
            await this.documentLocks.get(documentKey);
        }
        const operationPromise = this.performOperation(documentKey, operation, version, userId);
        this.documentLocks.set(documentKey, operationPromise);
        try {
            const result = await operationPromise;
            this.documentLocks.delete(documentKey);
            return result;
        }
        catch (error) {
            this.documentLocks.delete(documentKey);
            throw error;
        }
    }
    async performOperation(documentKey, operation, clientVersion, userId) {
        try {
            if (!this.documentStates.has(documentKey)) {
                await this.initializeDocumentState(documentKey, documentKey.split(':')[0], 'content');
            }
            const docState = this.documentStates.get(documentKey);
            const history = this.operationHistory.get(documentKey) || [];
            if (clientVersion < docState.version) {
                operation = await this.transformOperation(operation, history, clientVersion, docState.version);
            }
            else if (clientVersion > docState.version) {
                throw new Error(`Client version ${clientVersion} is ahead of server version ${docState.version}`);
            }
            const newContent = this.applyOperationToContent(docState.content, operation);
            const transformedOperation = {
                ...operation,
                version: docState.version + 1,
                userId,
                timestamp: new Date(),
            };
            docState.content = newContent;
            docState.version += 1;
            docState.lastModified = new Date();
            history.push(transformedOperation);
            this.operationHistory.set(documentKey, history);
            await this.cacheDocumentState(documentKey, docState);
            await this.cacheService.set(`collaboration:history:${documentKey}`, history.slice(-100), { layer: 'L2_MEDIUM', ttl: 3600 });
            this.logger.debug(`Applied operation for ${documentKey}, new version: ${docState.version}`);
            return transformedOperation;
        }
        catch (error) {
            this.logger.error(`Error applying operation: ${error.message}`);
            throw error;
        }
    }
    async transformOperation(operation, history, fromVersion, toVersion) {
        let transformedOp = { ...operation };
        const missedOperations = history.filter(op => op.version > fromVersion && op.version <= toVersion);
        for (const missedOp of missedOperations) {
            transformedOp = this.transformAgainstOperation(transformedOp, missedOp);
        }
        return transformedOp;
    }
    transformAgainstOperation(op1, op2) {
        if (op1.type === 'insert' && op2.type === 'insert') {
            if (op2.position <= op1.position) {
                return {
                    ...op1,
                    position: op1.position + (op2.content?.length || 0),
                };
            }
        }
        else if (op1.type === 'delete' && op2.type === 'insert') {
            if (op2.position <= op1.position) {
                return {
                    ...op1,
                    position: op1.position + (op2.content?.length || 0),
                };
            }
        }
        else if (op1.type === 'insert' && op2.type === 'delete') {
            if (op2.position < op1.position) {
                return {
                    ...op1,
                    position: Math.max(0, op1.position - (op2.length || 0)),
                };
            }
        }
        else if (op1.type === 'delete' && op2.type === 'delete') {
            if (op2.position < op1.position) {
                return {
                    ...op1,
                    position: Math.max(0, op1.position - (op2.length || 0)),
                };
            }
            else if (op2.position < op1.position + (op1.length || 0)) {
                const overlap = Math.min((op1.position + (op1.length || 0)), (op2.position + (op2.length || 0))) - Math.max(op1.position, op2.position);
                return {
                    ...op1,
                    length: Math.max(0, (op1.length || 0) - overlap),
                };
            }
        }
        return op1;
    }
    applyOperationToContent(content, operation) {
        switch (operation.type) {
            case 'insert':
                return (content.slice(0, operation.position) +
                    operation.content +
                    content.slice(operation.position));
            case 'delete':
                return (content.slice(0, operation.position) +
                    content.slice(operation.position + (operation.length || 0)));
            case 'retain':
                return content;
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }
    async initializeDocumentState(documentKey, taskId, field) {
        try {
            const cached = await this.loadDocumentStateFromCache(documentKey);
            if (cached) {
                this.documentStates.set(documentKey, cached);
                return;
            }
            const docState = {
                taskId,
                content: await this.loadInitialContent(taskId, field),
                version: 0,
                lastModified: new Date(),
                collaborators: new Set(),
            };
            this.documentStates.set(documentKey, docState);
            this.operationHistory.set(documentKey, []);
            await this.cacheDocumentState(documentKey, docState);
            this.logger.debug(`Initialized document state for ${documentKey}`);
        }
        catch (error) {
            this.logger.error(`Error initializing document state: ${error.message}`);
            throw error;
        }
    }
    async cleanupDocumentState(documentKey) {
        try {
            const docState = this.documentStates.get(documentKey);
            if (docState) {
                await this.saveFinalContent(docState.taskId, docState.content);
                this.documentStates.delete(documentKey);
                this.operationHistory.delete(documentKey);
                await this.cacheService.delete(`collaboration:state:${documentKey}`, { layer: 'L2_MEDIUM' });
                await this.cacheService.delete(`collaboration:history:${documentKey}`, { layer: 'L2_MEDIUM' });
                await this.cacheService.delete(`collaboration:editing:${documentKey}`, { layer: 'L1_FAST' });
                this.logger.debug(`Cleaned up document state for ${documentKey}`);
            }
        }
        catch (error) {
            this.logger.error(`Error cleaning up document state: ${error.message}`);
        }
    }
    async cacheDocumentState(documentKey, docState) {
        await this.cacheService.set(`collaboration:state:${documentKey}`, {
            taskId: docState.taskId,
            content: docState.content,
            version: docState.version,
            lastModified: docState.lastModified,
            collaborators: Array.from(docState.collaborators),
        }, { layer: 'L2_MEDIUM', ttl: 1800 });
    }
    async loadDocumentStateFromCache(documentKey) {
        try {
            const cached = await this.cacheService.get(`collaboration:state:${documentKey}`, { layer: 'L2_MEDIUM' });
            if (!cached)
                return null;
            return {
                taskId: cached.taskId,
                content: cached.content,
                version: cached.version,
                lastModified: new Date(cached.lastModified),
                collaborators: new Set(cached.collaborators || []),
            };
        }
        catch (error) {
            this.logger.error(`Error loading document state from cache: ${error.message}`);
            return null;
        }
    }
    async loadInitialContent(taskId, field) {
        return '';
    }
    async saveFinalContent(taskId, content) {
        this.logger.debug(`Saving final content for task ${taskId}: ${content.substring(0, 100)}...`);
    }
    async getDocumentState(taskId, field) {
        const documentKey = `${taskId}:${field}`;
        return this.documentStates.get(documentKey) || null;
    }
    async getCollaborators(taskId, field) {
        const documentKey = `${taskId}:${field}`;
        const docState = this.documentStates.get(documentKey);
        return docState ? Array.from(docState.collaborators) : [];
    }
    async getOperationHistory(taskId, field, limit = 50) {
        const documentKey = `${taskId}:${field}`;
        const history = this.operationHistory.get(documentKey) || [];
        return history.slice(-limit);
    }
};
exports.CollaborationService = CollaborationService;
exports.CollaborationService = CollaborationService = CollaborationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [advanced_cache_service_1.AdvancedCacheService])
], CollaborationService);
//# sourceMappingURL=collaboration.service.js.map