'use client';

import React from 'react';
import { DynamicTaskDebugger } from './DynamicTaskDebugger';

// Simple test wrapper to verify the fix
export const TestDynamicTaskDebugger: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Testing Dynamic Task Debugger Fix</h2>
      <p className="text-sm text-gray-600 mb-4">
        This component should now work without the "Maximum update depth exceeded" error.
      </p>
      <DynamicTaskDebugger />
    </div>
  );
};