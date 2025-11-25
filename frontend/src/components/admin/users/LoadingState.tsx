/**
 * LoadingState Component
 * 
 * Reusable loading state display
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-gray-600">{message}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
