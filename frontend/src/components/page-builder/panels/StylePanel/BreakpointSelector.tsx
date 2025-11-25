'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface BreakpointSelectorProps {
  value: Breakpoint;
  onChange: (breakpoint: Breakpoint) => void;
}

const BREAKPOINTS = [
  { key: 'mobile' as Breakpoint, label: 'Mobile', icon: Smartphone, width: 375 },
  { key: 'tablet' as Breakpoint, label: 'Tablet', icon: Tablet, width: 768 },
  { key: 'desktop' as Breakpoint, label: 'Desktop', icon: Monitor, width: 1200 },
];

export function BreakpointSelector({ value, onChange }: BreakpointSelectorProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xs font-medium text-gray-600">Responsive Mode:</span>
      <div className="flex gap-1">
        {BREAKPOINTS.map((breakpoint) => {
          const Icon = breakpoint.icon;
          const isActive = value === breakpoint.key;
          
          return (
            <Button
              key={breakpoint.key}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChange(breakpoint.key)}
              className="h-7 px-2"
              title={`${breakpoint.label} (${breakpoint.width}px)`}
            >
              <Icon className="h-3 w-3 mr-1" />
              <span className="text-xs">{breakpoint.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
