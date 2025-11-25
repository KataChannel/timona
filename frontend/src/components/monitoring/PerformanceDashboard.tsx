'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  cpu: { usage: number; cores: number; model: string };
  memory: { usage: number; total: number; used: number; free: number };
  disk: { usage: number; total: number; used: number; free: number };
  network: { bytesReceived: number; bytesSent: number };
}

interface ApplicationMetrics {
  requests: { total: number; rate: number; errorRate: number };
  responses: { averageTime: number; p95: number; p99: number };
  database: { queries: number; averageTime: number; connections: number };
  cache: { hits: number; misses: number; hitRate: number };
}

interface HealthStatus {
  status: 'ok' | 'error' | 'shutting_down';
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; responseTime?: number; message?: string };
    redis: { status: string; responseTime?: number; message?: string };
    elasticsearch: { status: string; responseTime?: number; message?: string };
    storage: { status: string; responseTime?: number; message?: string };
    external_apis: { status: string; responseTime?: number; message?: string };
    system_resources: { status: string; responseTime?: number; message?: string };
  };
}

interface AlertSummary {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  recentAlerts: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    timestamp: string;
  }>;
}

interface DashboardData {
  system: SystemMetrics;
  application: ApplicationMetrics;
  health: HealthStatus;
  alerts: AlertSummary;
  timestamp: string;
}

const PerformanceDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'up':
      case 'healthy':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
      case 'down':
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'up':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'down':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data: {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchDashboardData}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(data.health.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(data.health.status)}>
                {data.health.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {formatUptime(data.health.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.system.cpu.usage.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${data.system.cpu.usage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.system.memory.usage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(data.system.memory.used)} / {formatBytes(data.system.memory.total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.alerts.byStatus?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.alerts.total} total alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  CPU Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="font-mono">{data.system.cpu.usage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cores:</span>
                  <span className="font-mono">{data.system.cpu.cores}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model:</span>
                  <span className="font-mono text-sm">{data.system.cpu.model}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Memory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="font-mono">{data.system.memory.usage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-mono">{formatBytes(data.system.memory.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-mono">{formatBytes(data.system.memory.used)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Free:</span>
                  <span className="font-mono">{formatBytes(data.system.memory.free)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Disk Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="font-mono">{data.system.disk.usage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-mono">{formatBytes(data.system.disk.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-mono">{formatBytes(data.system.disk.used)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Free:</span>
                  <span className="font-mono">{formatBytes(data.system.disk.free)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Network Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Bytes Received:</span>
                  <span className="font-mono">{formatBytes(data.system.network.bytesReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes Sent:</span>
                  <span className="font-mono">{formatBytes(data.system.network.bytesSent)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Request Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Requests:</span>
                  <span className="font-mono">{data.application.requests.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Request Rate:</span>
                  <span className="font-mono">{data.application.requests.rate.toFixed(2)} req/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className="font-mono text-red-600">{data.application.requests.errorRate.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="font-mono">{data.application.responses.averageTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>95th Percentile:</span>
                  <span className="font-mono">{data.application.responses.p95.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>99th Percentile:</span>
                  <span className="font-mono">{data.application.responses.p99.toFixed(0)}ms</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Queries:</span>
                  <span className="font-mono">{data.application.database.queries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Time:</span>
                  <span className="font-mono">{data.application.database.averageTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Connections:</span>
                  <span className="font-mono">{data.application.database.connections}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Cache Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Cache Hits:</span>
                  <span className="font-mono">{data.application.cache.hits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Misses:</span>
                  <span className="font-mono">{data.application.cache.misses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hit Rate:</span>
                  <span className="font-mono text-green-600">{data.application.cache.hitRate.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data.health.checks).map(([service, check]) => (
              <Card key={service}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{service.replace('_', ' ')}</span>
                    {getStatusIcon(check.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={check.status === 'up' ? 'default' : 'destructive'}>
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                    {check.responseTime && (
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-mono">{check.responseTime.toFixed(0)}ms</span>
                      </div>
                    )}
                    {check.message && (
                      <div className="text-sm text-muted-foreground">
                        {check.message}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.alerts.total}</div>
                <p className="text-muted-foreground">Total Alerts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>By Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {Object.entries(data.alerts.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status}:</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>By Severity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {Object.entries(data.alerts.bySeverity || {}).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between">
                    <span className="capitalize">{severity}:</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {data.alerts.recentAlerts && data.alerts.recentAlerts.length > 0 ? (
                <div className="space-y-2">
                  {data.alerts.recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(alert.severity)}
                        <span className="font-medium">{alert.title}</span>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent alerts</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;