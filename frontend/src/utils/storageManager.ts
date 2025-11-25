/**
 * Storage Manager with Compression and Quota Management
 * Handles localStorage quota limits with automatic cleanup and compression
 */

// Simple compression using LZ-String-like algorithm
export class StorageManager {
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB (typical localStorage limit)
  private static readonly WARNING_THRESHOLD = 0.75; // Warn at 75% full
  private static readonly CLEANUP_THRESHOLD = 0.80; // Auto cleanup at 80% full
  private static readonly CRITICAL_THRESHOLD = 0.95; // Critical cleanup at 95% full
  private static readonly SAFE_THRESHOLD = 0.60; // Target safe level after cleanup

  /**
   * Compress a string using simple run-length encoding and base64
   */
  private static compress(str: string): string {
    try {
      // Simple compression: JSON -> base64
      // For better compression, could use LZ-String library
      return btoa(encodeURIComponent(str));
    } catch (error) {
      console.warn('Compression failed, using original:', error);
      return str;
    }
  }

  /**
   * Decompress a string
   */
  private static decompress(str: string): string {
    try {
      return decodeURIComponent(atob(str));
    } catch (error) {
      // If decompression fails, assume it's not compressed
      return str;
    }
  }

  /**
   * Get current localStorage usage
   */
  static getStorageUsage(): {
    used: number;
    available: number;
    percentage: number;
    isNearLimit: boolean;
  } {
    let used = 0;
    
    try {
      // Calculate total size of all localStorage items
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += (localStorage[key].length + key.length) * 2; // UTF-16 chars = 2 bytes each
        }
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }

    const available = this.MAX_STORAGE_SIZE - used;
    const percentage = (used / this.MAX_STORAGE_SIZE) * 100;
    const isNearLimit = percentage >= (this.WARNING_THRESHOLD * 100);

    return { used, available, percentage, isNearLimit };
  }

  /**
   * Set item with compression and quota management
   */
  static setItem(key: string, value: any, options: {
    compress?: boolean;
    autoCleanup?: boolean;
  } = {}): boolean {
    const { compress = true, autoCleanup = true } = options;

    try {
      const jsonString = JSON.stringify(value);
      const dataToStore = compress ? this.compress(jsonString) : jsonString;
      
      // Add metadata for cleanup decisions
      const itemWithMeta = JSON.stringify({
        data: dataToStore,
        compressed: compress,
        timestamp: Date.now(),
        size: dataToStore.length,
      });

      // Check storage before writing
      const usage = this.getStorageUsage();
      const itemSize = (itemWithMeta.length + key.length) * 2;

      // ⚠️ CRITICAL: Check if we have enough space BEFORE attempting to write
      if (usage.percentage >= this.CRITICAL_THRESHOLD * 100 && autoCleanup) {
        this.cleanup(key, true);
      } else if (usage.percentage >= this.CLEANUP_THRESHOLD * 100 && autoCleanup) {
        this.cleanup(key, false);
      }

      // Re-check after cleanup
      const postCleanupUsage = this.getStorageUsage();
      
      // If still not enough space, prevent the write to avoid quota error
      if (postCleanupUsage.available < itemSize && autoCleanup) {
        this.cleanup(key, true);
      }

      // Try to set the item
      localStorage.setItem(key, itemWithMeta);
      
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        const usage = this.getStorageUsage();
        
        // AGGRESSIVE emergency recovery (silent mode - no error logs)
        if (options.autoCleanup) {
          // Step 1: Delete ALL temporary/session data silently
          const tempKeys = [];
          for (let k in localStorage) {
            if (localStorage.hasOwnProperty(k)) {
              if (k.includes('temp') || k.includes('cache') || k.includes('draft') || k.includes('session')) {
                try {
                  localStorage.removeItem(k);
                  tempKeys.push(k);
                } catch (e) {
                  // Silent fail
                }
              }
            }
          }
          
          // Step 2: Run aggressive cleanup if step 1 didn't free enough space
          let postDeleteUsage = this.getStorageUsage();
          if (postDeleteUsage.percentage > 70) {
            this.cleanup(key, true);
          }
          
          // Step 3: Retry the operation
          try {
            const jsonString = JSON.stringify(value);
            const dataToStore = options.compress ? this.compress(jsonString) : jsonString;
            const itemWithMeta = JSON.stringify({
              data: dataToStore,
              compressed: options.compress,
              timestamp: Date.now(),
              size: dataToStore.length,
            });
            
            localStorage.setItem(key, itemWithMeta);
            return true;
          } catch (retryError: any) {
            // Step 4: Last resort - try without compression
            try {
              if (options.compress) {
                const jsonString = JSON.stringify(value);
                
                // Try to save minimal data first
                const minimalMeta = JSON.stringify({
                  data: jsonString,
                  compressed: false,
                  timestamp: Date.now(),
                });
                
                localStorage.setItem(key, minimalMeta);
                return true;
              }
            } catch (fallbackError: any) {
              // Step 5: Complete failure - throw with minimal info
              const finalUsage = this.getStorageUsage();
              
              throw new Error(
                `Storage full (${finalUsage.percentage.toFixed(0)}%). Clear browser data or delete old templates.`
              );
            }
          }
        }
        
        throw error;
      }
      
      // Other errors - throw silently without console.error
      throw error;
    }
  }

  /**
   * Get item with automatic decompression
   */
  static getItem<T = any>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      // Try to parse as metadata object
      try {
        const parsed = JSON.parse(stored);
        
        // New format with metadata
        if (parsed.data !== undefined && parsed.compressed !== undefined) {
          const data = parsed.compressed ? this.decompress(parsed.data) : parsed.data;
          return JSON.parse(data);
        }
        
        // Old format (direct JSON)
        return parsed as T;
      } catch (parseError) {
        // If parsing fails, return as-is
        return stored as any;
      }
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  /**
   * Remove item
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  /**
   * Cleanup old items to free space - IMPROVED with priority-based deletion
   */
  static cleanup(protectedKey?: string, aggressive: boolean = false): number {
    try {
      const items: { 
        key: string; 
        timestamp: number; 
        size: number;
        priority: number;
      }[] = [];

      // Collect all items with timestamps and assign priority
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key !== protectedKey) {
          try {
            const stored = localStorage.getItem(key);
            if (!stored) continue;

            let timestamp = 0;
            let size = (stored.length + key.length) * 2;
            let priority = 0; // Higher = delete first

            try {
              const parsed = JSON.parse(stored);
              timestamp = parsed.timestamp || 0;
              size = parsed.size || size;
            } catch (e) {
              // OK, not metadata format
            }

            // Assign priority: older items = higher priority for deletion
            const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
            priority = ageInDays * 10; // Prioritize very old items

            // Extra priority for cache/temp items
            if (key.includes('cache') || key.includes('temp') || key.includes('draft')) {
              priority += 1000; // Delete these FIRST
            }
            
            // Extra priority for session data
            if (key.includes('session') || key.includes('editor_')) {
              priority += 500;
            }

            items.push({ key, timestamp, size, priority });
          } catch (e) {
            // Skip items that cause errors
          }
        }
      }

      // Sort by priority FIRST (descending), then by timestamp (oldest first)
      items.sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return a.timestamp - b.timestamp; // Then oldest first
      });

      let freedSpace = 0;
      const targetPercentage = aggressive ? this.SAFE_THRESHOLD : 0.75; // Free to 60% or 75%

      // Remove items by priority until we reach target
      for (const item of items) {
        const currentUsage = this.getStorageUsage();
        if (currentUsage.percentage <= (targetPercentage * 100)) {
          break;
        }

        try {
          localStorage.removeItem(item.key);
          freedSpace += item.size;
        } catch (e) {
          // Silent fail
        }
      }

      return freedSpace;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get storage statistics
   */
  static getStats(): {
    usage: ReturnType<typeof StorageManager.getStorageUsage>;
    itemCount: number;
    items: Array<{ key: string; size: number; timestamp?: number }>;
  } {
    const usage = this.getStorageUsage();
    const items: Array<{ key: string; size: number; timestamp?: number }> = [];

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const stored = localStorage.getItem(key) || '';
        const size = (stored.length + key.length) * 2;
        
        let timestamp: number | undefined;
        try {
          const parsed = JSON.parse(stored);
          timestamp = parsed.timestamp;
        } catch (e) {
          // No timestamp available
        }

        items.push({ key, size, timestamp });
      }
    }

    // Sort by size (largest first)
    items.sort((a, b) => b.size - a.size);

    return {
      usage,
      itemCount: items.length,
      items,
    };
  }

  /**
   * Clear all storage (use with caution!)
   */
  static clearAll(): void {
    try {
      localStorage.clear();
      console.log('localStorage cleared');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Proactively monitor and prevent quota issues
   */
  static monitorStorage(): void {
    const usage = this.getStorageUsage();
    
    if (usage.percentage >= this.CRITICAL_THRESHOLD * 100) {
      this.cleanup(undefined, true);
    } else if (usage.percentage >= this.CLEANUP_THRESHOLD * 100) {
      // Just cleanup silently, no console logs
    }
  }

  /**
   * Get storage health report
   */
  static getHealthReport() {
    const usage = this.getStorageUsage();
    const stats = this.getStats();
    
    let status = '✅ OK';
    let recommendation = '';

    if (usage.percentage >= 95) {
      status = '🚨 CRITICAL';
      recommendation = 'URGENT: Clear data immediately or quota errors will occur';
    } else if (usage.percentage >= 85) {
      status = '⚠️ WARNING';
      recommendation = 'Storage nearly full, consider deleting old templates';
    } else if (usage.percentage >= 70) {
      status = '⚠️ CAUTION';
      recommendation = 'Monitor usage - consider cleanup soon';
    }

    return {
      status,
      used: this.formatBytes(usage.used),
      available: this.formatBytes(Math.max(0, usage.available)),
      percentage: usage.percentage.toFixed(1) + '%',
      itemCount: stats.itemCount,
      recommendation,
      largestItems: stats.items.slice(0, 5).map(i => ({
        key: i.key,
        size: this.formatBytes(i.size),
      })),
    };
  }
}

export default StorageManager;
