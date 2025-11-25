'use client';

import { Task, TaskPriority, TaskStatus } from '../types/task';

export interface OfflineAction {
  id?: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'TASK' | 'USER' | 'PROJECT';
  entityId: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncResult {
  success: boolean;
  error?: string;
  conflicts?: ConflictResolution[];
}

export interface ConflictResolution {
  entityId: string;
  serverVersion: any;
  localVersion: any;
  resolution: 'server' | 'local' | 'merge';
  mergedData?: any;
}

export interface OfflineStorage {
  tasks: Map<string, Task>;
  actions: Map<string, OfflineAction>;
  lastSync: number;
}

class OfflineDataService {
  private db: IDBDatabase | null = null;
  private dbName = 'rausachcoreOfflineDB';
  private dbVersion = 1;
  private syncInProgress = false;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    // Skip on server side
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('priority', 'priority', { unique: false });
          taskStore.createIndex('createdAt', 'createdAt', { unique: false });
          taskStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Offline actions store
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionStore = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
          actionStore.createIndex('type', 'type', { unique: false });
        }

        // Sync metadata store
        if (!db.objectStoreNames.contains('syncMeta')) {
          db.createObjectStore('syncMeta', { keyPath: 'key' });
        }

        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  // Get all tasks from offline storage
  async getTasks(): Promise<Task[]> {
    if (!this.db) {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        return [];
      }
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Get single task from offline storage
  async getTask(id: string): Promise<Task | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Store task offline
  async storeTask(task: Task): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put({
        ...task,
        lastModified: Date.now(),
        offline: true
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Create task offline
  async createTaskOffline(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.storeTask(newTask);
    await this.queueAction({
      type: 'CREATE',
      entity: 'TASK',
      entityId: newTask.id,
      data: newTask,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    });

    return newTask;
  }

  // Update task offline
  async updateTaskOffline(id: string, updates: Partial<Task>): Promise<Task> {
    const existingTask = await this.getTask(id);
    
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.storeTask(updatedTask);
    await this.queueAction({
      type: 'UPDATE',
      entity: 'TASK',
      entityId: id,
      data: updates,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    });

    return updatedTask;
  }

  // Delete task offline
  async deleteTaskOffline(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.delete(id);

      request.onsuccess = () => {
        this.queueAction({
          type: 'DELETE',
          entity: 'TASK',
          entityId: id,
          data: null,
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3
        });
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Queue offline action
  async queueAction(action: Omit<OfflineAction, 'id'>): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.add(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending actions
  async getPendingActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove completed action
  async removeAction(actionId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.delete(actionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync with server
  async syncWithServer(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;

    try {
      // Get pending actions
      const actions = await this.getPendingActions();
      const conflicts: ConflictResolution[] = [];

      // Process each action
      for (const action of actions) {
        try {
          await this.processAction(action);
          await this.removeAction(action.id!);
        } catch (error) {
          console.error('Failed to sync action:', action, error);
          
          // Increment retry count
          action.retryCount++;
          
          if (action.retryCount >= action.maxRetries) {
            // Max retries reached, remove action
            await this.removeAction(action.id!);
          } else {
            // Update retry count in storage
            await this.updateAction(action);
          }
        }
      }

      // Update last sync timestamp
      await this.updateSyncMeta('lastSync', Date.now());

      return {
        success: true,
        conflicts: conflicts.length > 0 ? conflicts : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error'
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process individual action
  private async processAction(action: OfflineAction): Promise<void> {
    const endpoint = this.getAPIEndpoint(action.entity, action.type, action.entityId);
    
    let response: Response;
    
    switch (action.type) {
      case 'CREATE':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'UPDATE':
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        break;
        
      case 'DELETE':
        response = await fetch(endpoint, {
          method: 'DELETE'
        });
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle successful response
    if (action.type === 'CREATE' || action.type === 'UPDATE') {
      const serverData = await response.json();
      await this.handleServerResponse(action, serverData);
    }
  }

  // Handle server response for conflict resolution
  private async handleServerResponse(action: OfflineAction, serverData: any): Promise<void> {
    if (action.entity === 'TASK') {
      const localTask = await this.getTask(action.entityId);
      
      if (localTask && localTask.updatedAt !== serverData.updatedAt) {
        // Conflict detected - server version is different
        const resolution = await this.resolveConflict(localTask, serverData);
        await this.storeTask(resolution);
      } else {
        // No conflict, update with server data
        await this.storeTask(serverData);
      }
    }
  }

  // Conflict resolution strategy
  private async resolveConflict(localData: any, serverData: any): Promise<any> {
    // Simple last-write-wins strategy based on timestamp
    const localTime = new Date(localData.updatedAt).getTime();
    const serverTime = new Date(serverData.updatedAt).getTime();
    
    if (serverTime > localTime) {
      // Server wins
      return serverData;
    } else {
      // Local wins - need to sync local changes to server
      return localData;
    }
  }

  // Update action retry count
  private async updateAction(action: OfflineAction): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.put(action);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get API endpoint for entity and action
  private getAPIEndpoint(entity: string, type: string, entityId?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    
    switch (entity) {
      case 'TASK':
        if (type === 'CREATE') return `${baseUrl}/tasks`;
        return `${baseUrl}/tasks/${entityId}`;
        
      default:
        throw new Error(`Unknown entity: ${entity}`);
    }
  }

  // Update sync metadata
  async updateSyncMeta(key: string, value: any): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncMeta'], 'readwrite');
      const store = transaction.objectStore('syncMeta');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync metadata
  async getSyncMeta(key: string): Promise<any> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncMeta'], 'readonly');
      const store = transaction.objectStore('syncMeta');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    lastSync: number;
    pendingActions: number;
    isOnline: boolean;
  }> {
    const lastSync = (await this.getSyncMeta('lastSync')) || 0;
    const actions = await this.getPendingActions();
    
    return {
      lastSync,
      pendingActions: actions.length,
      isOnline: navigator.onLine
    };
  }

  // Force full sync
  async forceSyncAll(): Promise<SyncResult> {
    try {
      // First, sync pending actions
      const result = await this.syncWithServer();
      
      // Then, fetch latest data from server
      await this.fetchLatestData();
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Full sync failed'
      };
    }
  }

  // Fetch latest data from server
  private async fetchLatestData(): Promise<void> {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasks = await response.json();
        
        // Store all tasks
        for (const task of tasks) {
          await this.storeTask(task);
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
    }
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) await this.initDB();

    const stores = ['tasks', 'offlineActions', 'syncMeta', 'cache'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Export singleton instance
// Create and export service instance with proper SSR handling
const createOfflineDataService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      getTasks: () => Promise.resolve([]),
      getTask: () => Promise.resolve(null),
      storeTask: () => Promise.resolve(),
      createTaskOffline: () => Promise.resolve({} as Task),
      updateTaskOffline: () => Promise.resolve({} as Task),
      deleteTaskOffline: () => Promise.resolve(),
      queueAction: () => Promise.resolve(),
      getPendingActions: () => Promise.resolve([]),
      clearPendingActions: () => Promise.resolve(),
      processPendingActions: () => Promise.resolve({ success: 0, failed: 0 }),
      syncWithServer: () => Promise.resolve({ success: true }),
      resolveConflict: () => Promise.resolve({} as Task),
      getSyncStatus: () => Promise.resolve({ 
        lastSync: 0, 
        pendingActions: 0, 
        isOnline: false 
      }),
      cacheApiResponse: () => Promise.resolve(),
      getCachedResponse: () => Promise.resolve(null),
      clearExpiredCache: () => Promise.resolve()
    } as any;
  }
  return new OfflineDataService();
};

export const offlineDataService = createOfflineDataService();

// Export types and service
export default OfflineDataService;