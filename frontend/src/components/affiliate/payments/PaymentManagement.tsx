'use client'

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { 
  Plus, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Bitcoin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';
import { GET_AFFILIATE_PAYMENT_REQUESTS, CREATE_PAYMENT_REQUEST, GET_AFFILIATE_EARNINGS_REPORT } from '../../../graphql/affiliate.queries';
import { AffiliatePaymentRequest, CreatePaymentRequestInput } from '../../../types/affiliate';

interface PaymentManagementProps {
  className?: string;
}

export default function PaymentManagement({ className = '' }: PaymentManagementProps) {
  const [selectedTab, setSelectedTab] = useState('requests');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  
  // Form state for payment request
  const [formData, setFormData] = useState<CreatePaymentRequestInput>({
    amount: 0,
    paymentMethod: 'PAYPAL',
    accountDetails: '',
    notes: '',
    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    periodEnd: new Date().toISOString(),
  });

  // Memoize date range to prevent unnecessary re-queries
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }, []); // Empty deps - only calculate once on mount

  // GraphQL queries and mutations
  const { data: requestsData, loading: requestsLoading, refetch } = useQuery(GET_AFFILIATE_PAYMENT_REQUESTS, {
    variables: { search: { page: 1, size: 20 } },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });

  const { data: earningsData, loading: earningsLoading } = useQuery(GET_AFFILIATE_EARNINGS_REPORT, {
    variables: dateRange,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
    // Only refetch when explicitly needed, not on every render
    nextFetchPolicy: 'cache-first',
  });

  const [createPaymentRequest, { loading: creating }] = useMutation(CREATE_PAYMENT_REQUEST, {
    onCompleted: () => {
      setCreateDialogOpen(false);
      setFormData({
        amount: 0,
        paymentMethod: 'PAYPAL',
        accountDetails: '',
        notes: '',
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
      });
      refetch();
    }
  });

  const requests: AffiliatePaymentRequest[] = requestsData?.affiliatePaymentRequests || [];
  const earnings = earningsData?.affiliateEarningsReport || {
    totalEarnings: 0,
    availableForPayout: 0,
    pendingPayments: 0,
    paidThisMonth: 0,
    minimumPayout: 50
  };

  const handleCreateRequest = async () => {
    try {
      await createPaymentRequest({
        variables: { input: formData }
      });
    } catch (error) {
      console.error('Error creating payment request:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PROCESSING':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'PENDING': 'secondary',
      'PROCESSING': 'default',
      'COMPLETED': 'default',
      'CANCELLED': 'destructive'
    };
    const labels: Record<string, string> = {
      'PENDING': 'Đang chờ',
      'PROCESSING': 'Đang xử lý',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'PAYPAL':
        return <CreditCard className="h-4 w-4" />;
      case 'BANK_TRANSFER':
        return <Banknote className="h-4 w-4" />;
      case 'CRYPTO':
        return <Bitcoin className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const PaymentRequestCard = ({ request }: { request: AffiliatePaymentRequest }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">${request.amount.toFixed(2)}</h3>
                {getStatusBadge(request.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getMethodIcon(request.paymentMethod)}
                <span>{request.paymentMethod.replace('_', ' ')}</span>
                <span>•</span>
                <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Mã yêu cầu: <code className="text-xs">{request.id.slice(-8)}</code>
          </div>
        </div>

        {request.status === 'COMPLETED' && request.processedAt && (
          <div className="text-sm text-muted-foreground mb-2">
            <div className="flex items-center justify-between">
              <span>Đã xử lý:</span>
              <span>{new Date(request.processedAt).toLocaleDateString()}</span>
            </div>
            {request.transactionId && (
              <div className="flex items-center justify-between">
                <span>Mã giao dịch:</span>
                <code className="text-xs">{request.transactionId}</code>
              </div>
            )}
          </div>
        )}

        {request.adminNotes && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">Ghi chú quản trị:</div>
            <div className="text-sm text-muted-foreground">{request.adminNotes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PaymentRequestForm = () => (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium mb-2">Số Dư Có Sẵn</div>
        <div className="text-2xl font-bold text-green-600">
          ${earnings.availableForPayout?.toFixed(2) || '0.00'}
        </div>
        <div className="text-xs text-muted-foreground">
          Số tiền tối thiểu: ${earnings.minimumPayout || 50}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Số Tiền</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          max={earnings.availableForPayout || 0}
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
        />
        <div className="text-xs text-muted-foreground">
          Tối đa: ${earnings.availableForPayout?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Phương Thức Thanh Toán</Label>
        <Select 
          value={formData.paymentMethod} 
          onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PAYPAL">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                PayPal
              </div>
            </SelectItem>
            <SelectItem value="BANK_TRANSFER">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Chuyển khoản ngân hàng
              </div>
            </SelectItem>
            <SelectItem value="CRYPTO">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Tiền điện tử
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.paymentMethod === 'PAYPAL' && (
        <div className="space-y-2">
          <Label htmlFor="paypalEmail">Email PayPal</Label>
          <Input
            id="paypalEmail"
            type="email"
            value={formData.accountDetails ? JSON.parse(formData.accountDetails).email || '' : ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              accountDetails: JSON.stringify({ email: e.target.value })
            })}
            placeholder="paypal-cua-ban@email.com"
          />
        </div>
      )}

      {formData.paymentMethod === 'BANK_TRANSFER' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Tên Tài Khoản</Label>
            <Input
              id="accountName"
              value={formData.accountDetails ? JSON.parse(formData.accountDetails).accountName || '' : ''}
              onChange={(e) => {
                const current = formData.accountDetails ? JSON.parse(formData.accountDetails) : {};
                setFormData({ 
                  ...formData, 
                  accountDetails: JSON.stringify({ ...current, accountName: e.target.value })
                });
              }}
              placeholder="Tên chủ tài khoản"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Số Tài Khoản</Label>
            <Input
              id="accountNumber"
              value={formData.accountDetails ? JSON.parse(formData.accountDetails).accountNumber || '' : ''}
              onChange={(e) => {
                const current = formData.accountDetails ? JSON.parse(formData.accountDetails) : {};
                setFormData({ 
                  ...formData, 
                  accountDetails: JSON.stringify({ ...current, accountNumber: e.target.value })
                });
              }}
              placeholder="Số tài khoản của bạn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routingNumber">Số Định Tuyến</Label>
            <Input
              id="routingNumber"
              value={formData.accountDetails ? JSON.parse(formData.accountDetails).routingNumber || '' : ''}
              onChange={(e) => {
                const current = formData.accountDetails ? JSON.parse(formData.accountDetails) : {};
                setFormData({ 
                  ...formData, 
                  accountDetails: JSON.stringify({ ...current, routingNumber: e.target.value })
                });
              }}
              placeholder="Số định tuyến ngân hàng"
            />
          </div>
        </div>
      )}

      {formData.paymentMethod === 'CRYPTO' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cryptoType">Tiền Điện Tử</Label>
            <Select
              value={formData.accountDetails ? JSON.parse(formData.accountDetails).cryptoType || 'BTC' : 'BTC'}
              onValueChange={(value) => {
                const current = formData.accountDetails ? JSON.parse(formData.accountDetails) : {};
                setFormData({ 
                  ...formData, 
                  accountDetails: JSON.stringify({ ...current, cryptoType: value })
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Địa Chỉ Ví</Label>
            <Input
              id="walletAddress"
              value={formData.accountDetails ? JSON.parse(formData.accountDetails).walletAddress || '' : ''}
              onChange={(e) => {
                const current = formData.accountDetails ? JSON.parse(formData.accountDetails) : {};
                setFormData({ 
                  ...formData, 
                  accountDetails: JSON.stringify({ ...current, walletAddress: e.target.value })
                });
              }}
              placeholder="Địa chỉ ví của bạn"
            />
          </div>
        </div>
      )}
    </div>
  );

  if (requestsLoading || earningsLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Thanh Toán</h1>
          <p className="text-muted-foreground">
            Quản lý thu nhập và yêu cầu thanh toán của bạn
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={!earnings.availableForPayout || earnings.availableForPayout < (earnings.minimumPayout || 50)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yêu Cầu Thanh Toán
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yêu Cầu Thanh Toán</DialogTitle>
            </DialogHeader>
            <PaymentRequestForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleCreateRequest} 
                disabled={creating || formData.amount < (earnings.minimumPayout || 50) || formData.amount > (earnings.availableForPayout || 0)}
              >
                {creating ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng Thu Nhập</p>
                <div className="text-2xl font-bold">${earnings.totalEarnings?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Toàn thời gian</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Có Sẵn</p>
                <div className="text-2xl font-bold text-green-600">
                  ${earnings.availableForPayout?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Sẵn sàng thanh toán</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đang Chờ</p>
                <div className="text-2xl font-bold text-yellow-600">
                  ${earnings.pendingPayments?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Đang xử lý</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tháng Này</p>
                <div className="text-2xl font-bold">${earnings.paidThisMonth?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground">Đã thanh toán</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Yêu Cầu Thanh Toán</TabsTrigger>
          <TabsTrigger value="history">Lịch Sử Thanh Toán</TabsTrigger>
          <TabsTrigger value="settings">Cài Đặt Thanh Toán</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Yêu Cầu Thanh Toán</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Chưa có yêu cầu thanh toán</h3>
                    <p className="text-muted-foreground mb-4">
                      Bạn chưa thực hiện yêu cầu thanh toán nào.
                    </p>
                    {earnings.availableForPayout >= (earnings.minimumPayout || 50) && (
                      <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Yêu Cầu Thanh Toán Đầu Tiên
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              requests.map(request => (
                <PaymentRequestCard key={request.id} request={request} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lịch Sử Thanh Toán</h3>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 ngày qua</SelectItem>
                <SelectItem value="30d">30 ngày qua</SelectItem>
                <SelectItem value="90d">90 ngày qua</SelectItem>
                <SelectItem value="1y">Năm qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Biểu đồ lịch sử thanh toán</h3>
                <p className="text-muted-foreground">
                  Trực quan hóa lịch sử thanh toán chi tiết sẽ được triển khai ở đây.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tùy Chọn Thanh Toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phương Thức Thanh Toán Ưu Tiên</Label>
                  <Select defaultValue="PAYPAL">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Chuyển khoản ngân hàng</SelectItem>
                      <SelectItem value="CRYPTO">Tiền điện tử</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngưỡng Thanh Toán Tự Động</Label>
                  <Select defaultValue="100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">$50</SelectItem>
                      <SelectItem value="100">$100</SelectItem>
                      <SelectItem value="250">$250</SelectItem>
                      <SelectItem value="500">$500</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Tự động yêu cầu thanh toán khi đạt đến số tiền này
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Thuế</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mã số thuế</Label>
                  <Input placeholder="XXX-XX-XXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Quốc Gia Thuế</Label>
                  <Select defaultValue="US">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">Hoa Kỳ</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">Vương Quốc Anh</SelectItem>
                      <SelectItem value="DE">Đức</SelectItem>
                      <SelectItem value="VN">Việt Nam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline">Tải Lên Tài Liệu Thuế</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}