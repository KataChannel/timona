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

// Audio Player Component
function AudioPlayer({ recordPath, domain }: { recordPath: string | null, domain: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!recordPath) {
    return <span className="text-muted-foreground text-sm">Không có recording</span>;
  }

  // Build recording URL
  const recordingUrl = `https://pbx01.onepos.vn:8080/recordings${recordPath}`;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={togglePlay}
        className="h-8 w-8 p-0"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      <audio
        ref={audioRef}
        src={recordingUrl}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <a
        href={recordingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline"
      >
        Tải về
      </a>
    </div>
  );
}

// Sync Progress Dialog
function SyncProgressDialog({ 
  open, 
  onClose, 
  syncLogId,
  initialStats
}: { 
  open: boolean; 
  onClose: () => void;
  syncLogId: string | null;
  initialStats?: any;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState(initialStats || {
    recordsFetched: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Query để lấy sync log progress
  const { data: logData, startPolling, stopPolling } = useQuery(GET_SYNC_LOGS, {
    variables: { pagination: { page: 1, limit: 1 } },
    skip: !syncLogId,
  });

  useEffect(() => {
    if (open && syncLogId) {
      // Poll every 500ms
      startPolling(500);
      
      // Simulate logs
      const logMessages = [
        'Bắt đầu đồng bộ dữ liệu...',
        'Kết nối đến PBX API...',
        'Đang tải dữ liệu (batch 1)...',
      ];
      
      logMessages.forEach((msg, i) => {
        setTimeout(() => {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] ${msg}`]);
        }, i * 1000);
      });
    } else {
      stopPolling();
      setLogs([]);
    }

    return () => {
      stopPolling();
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [open, syncLogId, startPolling, stopPolling]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Update stats from poll data
  useEffect(() => {
    if (logData?.getCallCenterSyncLogs?.[0]) {
      const log = logData.getCallCenterSyncLogs[0];
      setStats({
        recordsFetched: log.recordsFetched || 0,
        recordsCreated: log.recordsCreated || 0,
        recordsUpdated: log.recordsUpdated || 0,
        recordsSkipped: log.recordsSkipped || 0,
      });

      // Add progress logs
      if (log.recordsFetched > stats.recordsFetched) {
        setLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString('vi-VN')}] Đã tải ${log.recordsFetched} records...`
        ]);
      }
    }
  }, [logData]);

  const progress = stats.recordsFetched > 0 
    ? ((stats.recordsCreated + stats.recordsUpdated) / stats.recordsFetched) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tiến trình đồng bộ</DialogTitle>
          <DialogDescription>
            Đang đồng bộ dữ liệu từ PBX API...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến trình</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{stats.recordsFetched}</div>
              <div className="text-xs text-blue-600">Đã tải</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.recordsCreated}</div>
              <div className="text-xs text-green-600">Tạo mới</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{stats.recordsUpdated}</div>
              <div className="text-xs text-yellow-600">Cập nhật</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{stats.recordsSkipped}</div>
              <div className="text-xs text-gray-600">Bỏ qua</div>
            </div>
          </div>

          {/* Logs */}
          <div className="space-y-2">
            <Label>Logs</Label>
            <ScrollArea 
              ref={scrollRef}
              className="h-[200px] w-full rounded-md border bg-slate-950 p-4"
            >
              {logs.map((log, i) => (
                <div key={i} className="text-xs text-green-400 font-mono mb-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-xs text-gray-500 font-mono">
                  Chờ logs...
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CallCenterPage() {
  const [activeTab, setActiveTab] = useState('records');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [showSyncProgress, setShowSyncProgress] = useState(false);
  const [currentSyncLogId, setCurrentSyncLogId] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
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
      setShowSyncProgress(true);
      
      const result = await syncData({
        variables: {
          input: {},
        },
      });

      if (result.data.syncCallCenterData.success) {
        setCurrentSyncLogId(result.data.syncCallCenterData.syncLogId);
        setSyncStats({
          recordsFetched: result.data.syncCallCenterData.recordsFetched,
          recordsCreated: result.data.syncCallCenterData.recordsCreated,
          recordsUpdated: result.data.syncCallCenterData.recordsUpdated,
          recordsSkipped: 0,
        });
        
        toast.success('Sync thành công!', {
          description: `${result.data.syncCallCenterData.recordsCreated} records mới đã được tạo`,
        });
        
        setTimeout(() => {
          refetchRecords();
          refetchLogs();
          refetchConfig();
          setShowSyncProgress(false);
        }, 2000);
      } else {
        toast.error('Sync thất bại', {
          description: result.data.syncCallCenterData.error,
        });
        setShowSyncProgress(false);
      }
    } catch (error: any) {
      toast.error('Sync error', {
        description: error.message,
      });
      setShowSyncProgress(false);
    }
  };

  const handleSyncWithDateRange = async () => {
    if (!dateRange.fromDate || !dateRange.toDate) {
      toast.error('Vui lòng chọn khoảng ngày');
      return;
    }

    try {
      setShowDateRangeDialog(false);
      setShowSyncProgress(true);
      
      const result = await syncData({
        variables: {
          input: {
            fromDate: dateRange.fromDate,
            toDate: dateRange.toDate,
          },
        },
      });

      if (result.data.syncCallCenterData.success) {
        setCurrentSyncLogId(result.data.syncCallCenterData.syncLogId);
        setSyncStats({
          recordsFetched: result.data.syncCallCenterData.recordsFetched,
          recordsCreated: result.data.syncCallCenterData.recordsCreated,
          recordsUpdated: result.data.syncCallCenterData.recordsUpdated,
          recordsSkipped: 0,
        });
        
        toast.success('Sync thành công!', {
          description: `${result.data.syncCallCenterData.recordsCreated} records mới đã được tạo`,
        });
        
        setTimeout(() => {
          refetchRecords();
          refetchLogs();
          refetchConfig();
          setShowSyncProgress(false);
        }, 2000);
      } else {
        toast.error('Sync thất bại', {
          description: result.data.syncCallCenterData.error,
        });
        setShowSyncProgress(false);
      }
    } catch (error: any) {
      toast.error('Sync error', {
        description: error.message,
      });
      setShowSyncProgress(false);
    }
  };

  const handleUpdateConfig = async (newConfig: any) => {
    try {
      if (config?.id) {
        await updateConfig({
          variables: {
            id: config.id,
            input: newConfig,
          },
          refetchQueries: [{ query: GET_CALLCENTER_CONFIG }],
          awaitRefetchQueries: true,
        });
        toast.success('Cập nhật config thành công');
      } else {
        await createConfig({
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
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: vi });
  };

  const formatDuration = (seconds: string) => {
    if (!seconds) return '0s';
    const sec = parseInt(seconds);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'INBOUND':
        return <PhoneIncoming className="h-4 w-4 text-blue-600" />;
      case 'OUTBOUND':
        return <PhoneOutgoing className="h-4 w-4 text-green-600" />;
      case 'LOCAL':
        return <Phone className="h-4 w-4 text-purple-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ANSWER: { variant: 'default' as const, label: 'Answered' },
      CANCELED: { variant: 'secondary' as const, label: 'Canceled' },
      BUSY: { variant: 'destructive' as const, label: 'Busy' },
      NO_ANSWER: { variant: 'outline' as const, label: 'No Answer' },
      FAILED: { variant: 'destructive' as const, label: 'Failed' },
      UNKNOWN: { variant: 'outline' as const, label: 'Unknown' },
    };
    
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

        {/* Call Records Tab - ADVANCED TABLE */}
        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách cuộc gọi</CardTitle>
              <CardDescription>
                Hiển thị {records?.pagination.totalItems || 0} cuộc gọi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Direction</TableHead>
                          <TableHead>Caller</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Recording</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records?.items.map((record: any) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getDirectionIcon(record.direction)}
                                <span className="text-xs">{record.direction}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">{record.callerIdNumber}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">{record.destinationNumber}</div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatEpoch(record.startEpoch)}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="flex flex-col gap-1">
                                <span>Total: {formatDuration(record.duration)}</span>
                                <span className="text-xs text-muted-foreground">
                                  Talk: {formatDuration(record.billsec)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.callStatus)}
                            </TableCell>
                            <TableCell>
                              <AudioPlayer 
                                recordPath={record.recordPath} 
                                domain={record.domain}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {records?.pagination && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Trang {records.pagination.currentPage} / {records.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                          disabled={!records.pagination.hasPreviousPage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                          disabled={!records.pagination.hasNextPage}
                        >
                          Sau
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đồng bộ</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {logs?.map((log: any) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-semibold">{log.syncType}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(log.startedAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                            </div>
                          </div>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Fetched</div>
                            <div className="font-semibold">{log.recordsFetched}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Created</div>
                            <div className="font-semibold text-green-600">{log.recordsCreated}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Updated</div>
                            <div className="font-semibold text-blue-600">{log.recordsUpdated}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Skipped</div>
                            <div className="font-semibold text-gray-600">{log.recordsSkipped}</div>
                          </div>
                        </div>
                        {log.duration && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Duration: {(log.duration / 1000).toFixed(2)}s
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DateRangeDialog
        open={showDateRangeDialog}
        onClose={() => setShowDateRangeDialog(false)}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onSync={handleSyncWithDateRange}
        loading={syncing}
      />

      <ConfigDialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        config={config}
        onSave={handleUpdateConfig}
        loading={updating || creating}
      />

      <SyncProgressDialog
        open={showSyncProgress}
        onClose={() => setShowSyncProgress(false)}
        syncLogId={currentSyncLogId}
        initialStats={syncStats}
      />
    </div>
  );
}

// Date Range Dialog Component
function DateRangeDialog({ open, onClose, dateRange, setDateRange, onSync, loading }: any) {
  const quickSelects = [
    { label: '1 ngày qua', days: 1 },
    { label: '7 ngày qua', days: 7 },
    { label: '15 ngày qua', days: 15 },
    { label: '30 ngày qua', days: 30 },
    { label: '90 ngày qua', days: 90 },
  ];

  const handleQuickSelect = (days: number) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    setDateRange({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chọn khoảng thời gian đồng bộ</DialogTitle>
          <DialogDescription>
            Chọn khoảng ngày để lấy dữ liệu cuộc gọi từ PBX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {quickSelects.map((item) => (
                <Button
                  key={item.days}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(item.days)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
              />
            </div>
          </div>

          {dateRange.fromDate && dateRange.toDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Sẽ đồng bộ dữ liệu từ {format(new Date(dateRange.fromDate), 'dd/MM/yyyy', { locale: vi })} đến{' '}
                {format(new Date(dateRange.toDate), 'dd/MM/yyyy', { locale: vi })}
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
    isActive: config?.isActive ?? true,
    defaultDaysBack: config?.defaultDaysBack || 30,
    batchSize: config?.batchSize || 200,
  });

  useEffect(() => {
    if (open && config) {
      setFormData({
        syncMode: config.syncMode || 'MANUAL',
        cronExpression: config.cronExpression || '',
        isActive: config.isActive ?? true,
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
