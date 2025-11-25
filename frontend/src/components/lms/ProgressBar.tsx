'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
}

const SIZE_CLASSES = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const COLOR_CLASSES = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  purple: 'bg-purple-600',
  yellow: 'bg-yellow-600',
};

export default function ProgressBar({ 
  progress, 
  size = 'md',
  showPercentage = false,
  color = 'blue'
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${SIZE_CLASSES[size]}`}>
        <div
          className={`${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-sm text-gray-600 mt-1 text-right">
          {clampedProgress}%
        </p>
      )}
    </div>
  );
}
