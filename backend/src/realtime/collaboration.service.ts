import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  
  // In-memory document states for active collaborations
  private documentStates = new Map<string, DocumentState>();
  
  // Operation history for operational transform
  private operationHistory = new Map<string, TransformedOperation[]>();
  
  // Lock mechanism for concurrent operations
  private documentLocks = new Map<string, Promise<any>>();

  constructor(private cacheService: AdvancedCacheService) {}

  async startEditing(userId: string, taskId: string, field: string): Promise<void> {
    try {
      const documentKey = `${taskId}:${field}`;
      
      // Initialize document state if not exists
      if (!this.documentStates.has(documentKey)) {
        await this.initializeDocumentState(documentKey, taskId, field);
      }

      const docState = this.documentStates.get(documentKey)!;
      docState.collaborators.add(userId);

      // Cache the editing state
      await this.cacheService.set(
        `collaboration:editing:${documentKey}`,
        {
          collaborators: Array.from(docState.collaborators),
          version: docState.version,
          lastModified: docState.lastModified,
        },
        { layer: 'L1_FAST', ttl: 300 }
      );

      this.logger.debug(`User ${userId} started editing ${documentKey}`);
    } catch (error) {
      this.logger.error(`Error starting editing session: ${error.message}`);
      throw error;
    }
  }

  async stopEditing(userId: string, taskId: string, field: string): Promise<void> {
    try {
      const documentKey = `${taskId}:${field}`;
      const docState = this.documentStates.get(documentKey);
      
      if (docState) {
        docState.collaborators.delete(userId);
        
        // Clean up if no more collaborators
        if (docState.collaborators.size === 0) {
          await this.cleanupDocumentState(documentKey);
        } else {
          // Update cache with remaining collaborators
          await this.cacheService.set(
            `collaboration:editing:${documentKey}`,
            {
              collaborators: Array.from(docState.collaborators),
              version: docState.version,
              lastModified: docState.lastModified,
            },
            { layer: 'L1_FAST', ttl: 300 }
          );
        }
      }

      this.logger.debug(`User ${userId} stopped editing ${documentKey}`);
    } catch (error) {
      this.logger.error(`Error stopping editing session: ${error.message}`);
      throw error;
    }
  }

  async applyOperation(
    taskId: string,
    operation: EditOperation,
    version: number,
    userId: string
  ): Promise<TransformedOperation> {
    const documentKey = `${taskId}:content`; // Assume editing main content
    
    // Use lock to ensure atomic operations
    if (this.documentLocks.has(documentKey)) {
      await this.documentLocks.get(documentKey);
    }

    const operationPromise = this.performOperation(documentKey, operation, version, userId);
    this.documentLocks.set(documentKey, operationPromise);

    try {
      const result = await operationPromise;
      this.documentLocks.delete(documentKey);
      return result;
    } catch (error) {
      this.documentLocks.delete(documentKey);
      throw error;
    }
  }

  private async performOperation(
    documentKey: string,
    operation: EditOperation,
    clientVersion: number,
    userId: string
  ): Promise<TransformedOperation> {
    try {
      // Get or initialize document state
      if (!this.documentStates.has(documentKey)) {
        await this.initializeDocumentState(documentKey, documentKey.split(':')[0], 'content');
      }

      const docState = this.documentStates.get(documentKey)!;
      const history = this.operationHistory.get(documentKey) || [];

      // Check if client version is behind
      if (clientVersion < docState.version) {
        // Transform operation against missing operations
        operation = await this.transformOperation(operation, history, clientVersion, docState.version);
      } else if (clientVersion > docState.version) {
        throw new Error(`Client version ${clientVersion} is ahead of server version ${docState.version}`);
      }

      // Apply operation to document
      const newContent = this.applyOperationToContent(docState.content, operation);
      const transformedOperation: TransformedOperation = {
        ...operation,
        version: docState.version + 1,
        userId,
        timestamp: new Date(),
      };

      // Update document state
      docState.content = newContent;
      docState.version += 1;
      docState.lastModified = new Date();

      // Store operation in history
      history.push(transformedOperation);
      this.operationHistory.set(documentKey, history);

      // Cache the updated state
      await this.cacheDocumentState(documentKey, docState);
      
      // Cache operation history (keep last 100 operations)
      await this.cacheService.set(
        `collaboration:history:${documentKey}`,
        history.slice(-100),
        { layer: 'L2_MEDIUM', ttl: 3600 }
      );

      this.logger.debug(`Applied operation for ${documentKey}, new version: ${docState.version}`);
      
      return transformedOperation;
    } catch (error) {
      this.logger.error(`Error applying operation: ${error.message}`);
      throw error;
    }
  }

  private async transformOperation(
    operation: EditOperation,
    history: TransformedOperation[],
    fromVersion: number,
    toVersion: number
  ): Promise<EditOperation> {
    // Simplified operational transform (OT)
    // In a production system, you'd want a more sophisticated OT algorithm
    
    let transformedOp = { ...operation };
    
    // Get operations that happened after client's version
    const missedOperations = history.filter(op => op.version > fromVersion && op.version <= toVersion);
    
    for (const missedOp of missedOperations) {
      transformedOp = this.transformAgainstOperation(transformedOp, missedOp);
    }
    
    return transformedOp;
  }

  private transformAgainstOperation(op1: EditOperation, op2: TransformedOperation): EditOperation {
    // Simplified transformation logic
    // This is a basic implementation - production would need more sophisticated OT
    
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        return {
          ...op1,
          position: op1.position + (op2.content?.length || 0),
        };
      }
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        return {
          ...op1,
          position: op1.position + (op2.content?.length || 0),
        };
      }
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      if (op2.position < op1.position) {
        return {
          ...op1,
          position: Math.max(0, op1.position - (op2.length || 0)),
        };
      }
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      if (op2.position < op1.position) {
        return {
          ...op1,
          position: Math.max(0, op1.position - (op2.length || 0)),
        };
      } else if (op2.position < op1.position + (op1.length || 0)) {
        // Overlapping deletes - adjust length
        const overlap = Math.min(
          (op1.position + (op1.length || 0)),
          (op2.position + (op2.length || 0))
        ) - Math.max(op1.position, op2.position);
        
        return {
          ...op1,
          length: Math.max(0, (op1.length || 0) - overlap),
        };
      }
    }
    
    return op1;
  }

  private applyOperationToContent(content: string, operation: EditOperation): string {
    switch (operation.type) {
      case 'insert':
        return (
          content.slice(0, operation.position) +
          operation.content +
          content.slice(operation.position)
        );
      
      case 'delete':
        return (
          content.slice(0, operation.position) +
          content.slice(operation.position + (operation.length || 0))
        );
      
      case 'retain':
        // Retain operations don't change content, used for cursor positioning
        return content;
      
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private async initializeDocumentState(documentKey: string, taskId: string, field: string): Promise<void> {
    try {
      // Try to load from cache first
      const cached = await this.loadDocumentStateFromCache(documentKey);
      
      if (cached) {
        this.documentStates.set(documentKey, cached);
        return;
      }

      // Initialize new document state
      // In a real implementation, load initial content from database
      const docState: DocumentState = {
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
    } catch (error) {
      this.logger.error(`Error initializing document state: ${error.message}`);
      throw error;
    }
  }

  private async cleanupDocumentState(documentKey: string): Promise<void> {
    try {
      const docState = this.documentStates.get(documentKey);
      
      if (docState) {
        // Save final state to database
        await this.saveFinalContent(docState.taskId, docState.content);
        
        // Clean up memory
        this.documentStates.delete(documentKey);
        this.operationHistory.delete(documentKey);
        
        // Clean up cache
        await this.cacheService.delete(`collaboration:state:${documentKey}`, { layer: 'L2_MEDIUM' });
        await this.cacheService.delete(`collaboration:history:${documentKey}`, { layer: 'L2_MEDIUM' });
        await this.cacheService.delete(`collaboration:editing:${documentKey}`, { layer: 'L1_FAST' });
        
        this.logger.debug(`Cleaned up document state for ${documentKey}`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning up document state: ${error.message}`);
    }
  }

  private async cacheDocumentState(documentKey: string, docState: DocumentState): Promise<void> {
    await this.cacheService.set(
      `collaboration:state:${documentKey}`,
      {
        taskId: docState.taskId,
        content: docState.content,
        version: docState.version,
        lastModified: docState.lastModified,
        collaborators: Array.from(docState.collaborators),
      },
      { layer: 'L2_MEDIUM', ttl: 1800 } // 30 minutes
    );
  }

  private async loadDocumentStateFromCache(documentKey: string): Promise<DocumentState | null> {
    try {
      const cached = await this.cacheService.get<any>(
        `collaboration:state:${documentKey}`,
        { layer: 'L2_MEDIUM' }
      );

      if (!cached) return null;

      return {
        taskId: cached.taskId,
        content: cached.content,
        version: cached.version,
        lastModified: new Date(cached.lastModified),
        collaborators: new Set(cached.collaborators || []),
      };
    } catch (error) {
      this.logger.error(`Error loading document state from cache: ${error.message}`);
      return null;
    }
  }

  private async loadInitialContent(taskId: string, field: string): Promise<string> {
    // In a real implementation, load from database
    // For now, return empty content
    return '';
  }

  private async saveFinalContent(taskId: string, content: string): Promise<void> {
    // In a real implementation, save to database
    // This would update the task's content in the database
    this.logger.debug(`Saving final content for task ${taskId}: ${content.substring(0, 100)}...`);
  }

  // Public methods for external access
  async getDocumentState(taskId: string, field: string): Promise<DocumentState | null> {
    const documentKey = `${taskId}:${field}`;
    return this.documentStates.get(documentKey) || null;
  }

  async getCollaborators(taskId: string, field: string): Promise<string[]> {
    const documentKey = `${taskId}:${field}`;
    const docState = this.documentStates.get(documentKey);
    return docState ? Array.from(docState.collaborators) : [];
  }

  async getOperationHistory(taskId: string, field: string, limit: number = 50): Promise<TransformedOperation[]> {
    const documentKey = `${taskId}:${field}`;
    const history = this.operationHistory.get(documentKey) || [];
    return history.slice(-limit);
  }
}