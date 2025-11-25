/**
 * ErrorState Component
 * 
 * Reusable error state display with retry option
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ 
  title = 'Error', 
  message, 
  onRetry,
  retryLabel = 'Retry'
}: ErrorStateProps) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
