'use client';

import React from 'react';
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard';

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <PerformanceDashboard />
    </div>
  );
}