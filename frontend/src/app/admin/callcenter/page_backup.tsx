'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Download, 
  Settings, 
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  RefreshCw,
  Volume2,
  Pause,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

// GraphQL Queries
const GET_CALLCENTER_CONFIG = gql`
  query GetCallCenterConfig {
    getCallCenterConfig {
      id
      apiUrl
      domain
      syncMode
      cronExpression
      isActive
      defaultDaysBack
      batchSize
      lastSyncAt
      lastSyncStatus
      lastSyncError
      totalRecordsSynced
    }
  }
`;

const GET_CALLCENTER_RECORDS = gql`
  query GetCallCenterRecords($pagination: PaginationInput!, $filters: CallCenterRecordFiltersInput) {
    getCallCenterRecords(pagination: $pagination, filters: $filters) {
      items {
        id
        externalUuid
        direction
        callerIdNumber
        outboundCallerIdNumber
        destinationNumber
        startEpoch
        endEpoch
        answerEpoch
        duration
        billsec
        sipHangupDisposition
        callStatus
        recordPath
        domain
        syncedAt
      }
      pagination {
        currentPage
        totalPages
        totalItems
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const GET_SYNC_LOGS = gql`
  query GetCallCenterSyncLogs($pagination: PaginationInput!) {
    getCallCenterSyncLogs(pagination: $pagination) {
      id
      syncType
      status
      fromDate
      toDate
      recordsFetched
      recordsCreated
      recordsUpdated
      recordsSkipped
      errorMessage
      startedAt
      completedAt
      duration
    }
  }
`;

// GraphQL Mutations
const SYNC_CALLCENTER_DATA = gql`
  mutation SyncCallCenterData($input: SyncCallCenterInput) {
    syncCallCenterData(input: $input) {
      success
      message
      syncLogId
      recordsFetched
      recordsCreated
      recordsUpdated
      error
    }
  }
`;

const UPDATE_CALLCENTER_CONFIG = gql`
  mutation UpdateCallCenterConfig($id: String!, $input: UpdateCallCenterConfigInput!) {
    updateCallCenterConfig(id: $id, input: $input) {
      id
      syncMode
      cronExpression
      isActive
      defaultDaysBack
      batchSize
    }
  }
`;

const CREATE_CALLCENTER_CONFIG = gql`
  mutation CreateCallCenterConfig($input: CreateCallCenterConfigInput!) {
    createCallCenterConfig(input: $input) {
      id
      apiUrl
      domain
      syncMode
      cronExpression
      isActive
      defaultDaysBack
      batchSize
    }
  }
`;

export default function CallCenterPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: '',
  });

  // Queries
  const { data: configData, loading: configLoading, refetch: refetchConfig } = useQuery(GET_CALLCENTER_CONFIG);
  const { data: recordsData, loading: recordsLoading, refetch: refetchRecords } = useQuery(GET_CALLCENTER_RECORDS, {
    variables: { pagination, filters },
  });
  const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useQuery(GET_SYNC_LOGS, {
    variables: { pagination: { page: 1, limit: 10 } },
  });

  // Mutations
  const [syncData, { loading: syncing }] = useMutation(SYNC_CALLCENTER_DATA);
  const [updateConfig, { loading: updating }] = useMutation(UPDATE_CALLCENTER_CONFIG);
  const [createConfig, { loading: creating }] = useMutation(CREATE_CALLCENTER_CONFIG);

  const config = configData?.getCallCenterConfig;
  const records = recordsData?.getCallCenterRecords;
  const logs = logsData?.getCallCenterSyncLogs;

  const handleManualSync = async () => {
    try {
      const result = await syncData({
        variables: {
          input: {},
        },
      });

      if (result.data.syncCallCenterData.success) {
        toast.success('Sync thành công!', {
          description: `${result.data.syncCallCenterData.recordsCreated} records mới đã được tạo`,
        });
        refetchRecords();
        refetchLogs();
        refetchConfig();
      } else {
        toast.error('Sync thất bại', {
          description: result.data.syncCallCenterData.error,
        });
      }
    } catch (error: any) {
      toast.error('Sync error', {
        description: error.message,
      });
    }
  };

  const handleSyncWithDateRange = async () => {
    if (!dateRange.fromDate || !dateRange.toDate) {
      toast.error('Vui lòng chọn khoảng ngày');
      return;
    }

    try {
      const result = await syncData({
        variables: {
          input: {
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
          },
        },
      });

      if (result.data.syncCallCenterData.success) {
        toast.success('Sync thành công!', {
          description: `${result.data.syncCallCenterData.recordsCreated} records mới đã được tạo`,
        });
        refetchRecords();
        refetchLogs();
        refetchConfig();
        setShowDateRangeDialog(false);
      } else {
        toast.error('Sync thất bại', {
          description: result.data.syncCallCenterData.error,
        });
      }
    } catch (error: any) {
      toast.error('Sync error', {
        description: error.message,
      });
    }
  };

  const handleUpdateConfig = async (newConfig: any) => {
    try {
      if (config?.id) {
        // Update existing config
        const result = await updateConfig({
          variables: {
            id: config.id,
            input: newConfig,
          },
          refetchQueries: [{ query: GET_CALLCENTER_CONFIG }],
          awaitRefetchQueries: true,
        });
        toast.success('Cập nhật config thành công');
        console.log('Update result:', result.data);
      } else {
        // Create new config
        const result = await createConfig({
          variables: {
            input: {
              apiUrl: 'https://pbx01.onepos.vn:8080/api/v2/cdrs',
              domain: 'tazaspa102019',
              ...newConfig,
            },
          },
          refetchQueries: [{ query: GET_CALLCENTER_CONFIG }],
          awaitRefetchQueries: true,
        });
        toast.success('Tạo config thành công');
        console.log('Create result:', result.data);
      }
      await refetchConfig();
      setShowConfigDialog(false);
    } catch (error: any) {
      console.error('Config operation error:', error);
      toast.error('Config operation failed', {
        description: error.message,
      });
    }
  };

  const formatEpoch = (epoch: string) => {
    if (!epoch || epoch === '0') return 'N/A';
    const date = new Date(parseInt(epoch) * 1000);
    return date.toLocaleString('vi-VN');
  };

  const formatDuration = (seconds: string) => {
    if (!seconds) return '0s';
    const sec = parseInt(seconds);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Call Center</h1>
          <p className="text-muted-foreground">Quản lý dữ liệu cuộc gọi từ PBX</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Cấu hình
          </Button>
          <Button variant="outline" onClick={() => setShowDateRangeDialog(true)} disabled={!config?.isActive}>
            <Calendar className="mr-2 h-4 w-4" />
            Chọn ngày sync
          </Button>
          <Button onClick={handleManualSync} disabled={syncing || !config?.isActive}>
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Ngay
          </Button>
        </div>
      </div>

      {/* Warning if config not active */}
      {config && !config.isActive && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Chưa kích hoạt
            </CardTitle>
            <CardDescription className="text-orange-700">
              Call Center chưa được kích hoạt. Vui lòng bật trong phần cấu hình để sử dụng tính năng đồng bộ.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Loading state */}
      {configLoading && (
        <Card>
          <CardContent className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {config && config.isActive && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Records</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{config.totalRecordsSynced || 0}</div>
              <p className="text-xs text-muted-foreground">Đã đồng bộ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Mode</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{config.syncMode}</div>
              <p className="text-xs text-muted-foreground">
                {config.isActive ? 'Active' : 'Inactive'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {config.lastSyncAt 
                  ? formatDistanceToNow(new Date(config.lastSyncAt), { addSuffix: true, locale: vi })
                  : 'Chưa sync'
                }
              </div>
              <p className="text-xs text-muted-foreground">{config.lastSyncStatus}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Batch Size</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{config.batchSize}</div>
              <p className="text-xs text-muted-foreground">records/request</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="records">Call Records</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        {/* Call Records Tab */}
        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Lọc dữ liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Direction</Label>
                <Select 
                  value={filters.direction || 'all'} 
                  onValueChange={(val) => setFilters({...filters, direction: val === 'all' ? undefined : val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="INBOUND">Inbound</SelectItem>
                    <SelectItem value="OUTBOUND">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select 
                  value={filters.callStatus || 'all'} 
                  onValueChange={(val) => setFilters({...filters, callStatus: val === 'all' ? undefined : val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ANSWER">Answered</SelectItem>
                    <SelectItem value="CANCELED">Canceled</SelectItem>
                    <SelectItem value="BUSY">Busy</SelectItem>
                    <SelectItem value="NO_ANSWER">No Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tìm kiếm</Label>
                <Input 
                  placeholder="Số điện thoại..." 
                  value={filters.search || ''}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={() => refetchRecords()} className="w-full">
                  Áp dụng
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Call Records</CardTitle>
              <CardDescription>
                {records?.pagination.totalItems || 0} records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Direction</TableHead>
                      <TableHead>Caller</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Billsec</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recording</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records?.items.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {record.direction === 'INBOUND' ? (
                            <Badge variant="secondary" className="gap-1">
                              <PhoneIncoming className="h-3 w-3" />
                              Inbound
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <PhoneOutgoing className="h-3 w-3" />
                              Outbound
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.callerIdNumber || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.destinationNumber || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatEpoch(record.startEpoch)}
                        </TableCell>
                        <TableCell>{formatDuration(record.duration)}</TableCell>
                        <TableCell>{formatDuration(record.billsec)}</TableCell>
                        <TableCell>
                          {record.callStatus === 'ANSWER' ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Answered
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              {record.callStatus}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.recordPath ? (
                            <Button size="sm" variant="ghost">
                              <Play className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">No recording</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {records && records.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {records.pagination.currentPage} of {records.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={!records.pagination.hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={!records.pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Lịch sử đồng bộ dữ liệu</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Started At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.syncType}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.status === 'success' ? (
                            <Badge variant="default">Success</Badge>
                          ) : log.status === 'error' ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : (
                            <Badge variant="secondary">Running</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(log.fromDate).toLocaleDateString()} - {new Date(log.toDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>Fetched: {log.recordsFetched}</div>
                            <div className="text-green-600">Created: {log.recordsCreated}</div>
                            <div className="text-blue-600">Updated: {log.recordsUpdated}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.duration ? `${(log.duration / 1000).toFixed(2)}s` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(new Date(log.startedAt), { addSuffix: true, locale: vi })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <ConfigDialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        config={config}
        onSave={handleUpdateConfig}
        loading={updating}
      />

      {/* Date Range Dialog */}
      <DateRangeDialog
        open={showDateRangeDialog}
        onClose={() => setShowDateRangeDialog(false)}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onSync={handleSyncWithDateRange}
        loading={syncing}
      />
    </div>
  );
}

// Date Range Dialog Component
function DateRangeDialog({ open, onClose, dateRange, onDateRangeChange, onSync, loading }: any) {
  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    onDateRangeChange({ ...dateRange, [field]: value });
  };

  // Set default date range (last 7 days)
  const setDefaultRange = (days: number) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    onDateRangeChange({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chọn khoảng ngày đồng bộ</DialogTitle>
          <DialogDescription>
            Chọn khoảng thời gian để lấy dữ liệu cuộc gọi từ PBX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick select buttons */}
          <div className="space-y-2">
            <Label>Chọn nhanh</Label>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDefaultRange(1)}
              >
                Hôm qua
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDefaultRange(7)}
              >
                7 ngày
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDefaultRange(15)}
              >
                15 ngày
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDefaultRange(30)}
              >
                30 ngày
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDefaultRange(90)}
              >
                90 ngày
              </Button>
            </div>
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <Label htmlFor="fromDate">Từ ngày</Label>
            <Input
              id="fromDate"
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => handleDateChange('fromDate', e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <Label htmlFor="toDate">Đến ngày</Label>
            <Input
              id="toDate"
              type="date"
              value={dateRange.toDate}
              onChange={(e) => handleDateChange('toDate', e.target.value)}
              min={dateRange.fromDate}
            />
          </div>

          {/* Info */}
          {dateRange.fromDate && dateRange.toDate && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Sẽ đồng bộ dữ liệu từ <strong>{new Date(dateRange.fromDate).toLocaleDateString('vi-VN')}</strong> đến <strong>{new Date(dateRange.toDate).toLocaleDateString('vi-VN')}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            onClick={onSync} 
            disabled={loading || !dateRange.fromDate || !dateRange.toDate}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Đồng bộ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Config Dialog Component
function ConfigDialog({ open, onClose, config, onSave, loading }: any) {
  const [formData, setFormData] = useState({
    syncMode: config?.syncMode || 'MANUAL',
    cronExpression: config?.cronExpression || '',
    isActive: config?.isActive || true,
    defaultDaysBack: config?.defaultDaysBack || 30,
    batchSize: config?.batchSize || 200,
  });

  // Sync formData with config when config changes or dialog opens
  useEffect(() => {
    if (open && config) {
      console.log('Syncing formData with config:', config);
      setFormData({
        syncMode: config.syncMode || 'MANUAL',
        cronExpression: config.cronExpression || '',
        isActive: config.isActive ?? true,  // Use ?? instead of || to handle false correctly
        defaultDaysBack: config.defaultDaysBack || 30,
        batchSize: config.batchSize || 200,
      });
    }
  }, [open, config]);

  const handleSave = () => {
    onSave(formData);
  };

  const isNewConfig = !config?.id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isNewConfig ? 'Tạo cấu hình Call Center' : 'Cập nhật cấu hình Call Center'}
          </DialogTitle>
          <DialogDescription>
            {isNewConfig 
              ? 'Thiết lập cấu hình đồng bộ dữ liệu từ PBX lần đầu'
              : 'Cài đặt đồng bộ dữ liệu từ PBX'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Kích hoạt</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          {!formData.isActive && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Bật "Kích hoạt" để sử dụng tính năng đồng bộ
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Chế độ đồng bộ</Label>
            <Select 
              value={formData.syncMode} 
              onValueChange={(val) => setFormData({ ...formData, syncMode: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled (Cron)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.syncMode === 'SCHEDULED' && (
            <div className="space-y-2">
              <Label>Cron Expression</Label>
              <Input
                placeholder="0 */5 * * * * (Every 5 minutes)"
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Example: "0 */5 * * * *" = Every 5 minutes
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Số ngày lấy dữ liệu</Label>
            <Input
              type="number"
              value={formData.defaultDaysBack}
              onChange={(e) => setFormData({ ...formData, defaultDaysBack: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Batch Size (records/request)</Label>
            <Input
              type="number"
              value={formData.batchSize}
              onChange={(e) => setFormData({ ...formData, batchSize: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNewConfig ? 'Tạo' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
