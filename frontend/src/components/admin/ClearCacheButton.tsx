'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { clearApolloCache } from '@/lib/apollo-client';
import { toast } from 'sonner';

export function ClearCacheButton() {
  const [clearing, setClearing] = React.useState(false);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await clearApolloCache();
      toast.success('Cache cleared successfully', {
        description: 'Please refresh the page to see changes',
      });
      // Auto refresh after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed to clear cache', {
        description: 'Please try refreshing the page manually',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearCache}
      disabled={clearing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${clearing ? 'animate-spin' : ''}`} />
      {clearing ? 'Clearing...' : 'Clear Cache'}
    </Button>
  );
}
