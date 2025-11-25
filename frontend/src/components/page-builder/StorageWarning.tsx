import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, HardDrive } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import StorageManager from '@/utils/storageManager';
import { getCustomTemplateStats, clearCustomTemplates } from '@/utils/customTemplates';

interface StorageWarningProps {
  threshold?: number; // Show warning when usage exceeds this percentage (default: 80)
}

export function StorageWarning({ threshold = 80 }: StorageWarningProps) {
  const [usage, setUsage] = useState(StorageManager.getStorageUsage());
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState(getCustomTemplateStats());

  useEffect(() => {
    // Update usage periodically
    const interval = setInterval(() => {
      setUsage(StorageManager.getStorageUsage());
      setStats(getCustomTemplateStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Don't show warning if under threshold
  if (usage.percentage < threshold) {
    return null;
  }

  const handleCleanup = () => {
    if (confirm('Clean up old templates? This will remove the oldest templates to free up space.')) {
      const freedBytes = StorageManager.cleanup(undefined, false);
      if (freedBytes > 0) {
        setUsage(StorageManager.getStorageUsage());
        setStats(getCustomTemplateStats());
        alert(`Cleaned up ${StorageManager.formatBytes(freedBytes)}`);
      } else {
        alert('No items to cleanup');
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('⚠️ WARNING: This will delete ALL custom templates. This action cannot be undone!\n\nAre you sure?')) {
      if (confirm('Final confirmation: Delete ALL custom templates?')) {
        clearCustomTemplates();
        setUsage(StorageManager.getStorageUsage());
        setStats(getCustomTemplateStats());
        alert('All custom templates deleted');
      }
    }
  };

  const getAlertClassName = () => {
    if (usage.percentage >= 95) return 'mb-4 border-red-500 bg-red-50 dark:bg-red-950';
    if (usage.percentage >= 90) return 'mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950';
    return 'mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
  };

  const getAlertIcon = () => {
    if (usage.percentage >= 90) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return <HardDrive className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <Alert className={getAlertClassName()}>
      <div className="flex items-start gap-3">
        {getAlertIcon()}
        <div className="flex-1">
          <AlertDescription>
            <div className="font-semibold mb-2">
              {usage.percentage >= 95 
                ? '🔴 Storage Almost Full!' 
                : usage.percentage >= 90
                ? '⚠️ Storage Nearly Full'
                : '⚠️ Storage Warning'}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Progress value={usage.percentage} className="flex-1 h-2" />
                <span className="font-mono font-semibold min-w-[60px] text-right">
                  {usage.percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Using {StorageManager.formatBytes(usage.used)} of {StorageManager.formatBytes(StorageManager['MAX_STORAGE_SIZE'])}
                {' '}<span className="font-semibold">({stats.total} custom templates, {stats.formattedSize})</span>
              </div>

              {showDetails && (
                <div className="mt-3 p-3 bg-background/50 rounded-md space-y-2 text-xs">
                  <div className="font-semibold">Storage Breakdown:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Custom Templates:</div>
                    <div className="text-right font-mono">{stats.formattedSize}</div>
                    
                    <div>Template Count:</div>
                    <div className="text-right font-mono">{stats.total}</div>
                    
                    <div>Available Space:</div>
                    <div className="text-right font-mono">
                      {StorageManager.formatBytes(usage.available)}
                    </div>
                  </div>
                  
                  {Object.keys(stats.byCategory).length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">By Category:</div>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="flex justify-between">
                            <span className="capitalize">{category}:</span>
                            <span className="font-mono">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCleanup}
                  disabled={stats.total === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Auto Cleanup
                </Button>
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={stats.total === 0}
                >
                  Clear All Templates
                </Button>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                💡 Tip: Export your templates before clearing, or delete old templates manually.
              </div>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

export default StorageWarning;
