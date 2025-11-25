'use client'

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Plus, 
  Edit, 
  Eye, 
  BarChart3, 
  Calendar, 
  Target, 
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { GET_AFFILIATE_CAMPAIGNS, CREATE_AFFILIATE_CAMPAIGN, UPDATE_AFFILIATE_CAMPAIGN } from '../../../graphql/affiliate.queries';
import { AffiliateCampaign, CreateCampaignInput } from '../../../types/affiliate';

interface CampaignManagementProps {
  className?: string;
  userRole?: 'AFFILIATE' | 'MERCHANT' | 'ADMIN';
}

export default function CampaignManagement({ className = '', userRole = 'AFFILIATE' }: CampaignManagementProps) {
  const [selectedTab, setSelectedTab] = useState('active');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AffiliateCampaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for campaign creation/editing
  const [formData, setFormData] = useState<Partial<CreateCampaignInput>>({
    name: '',
    description: '',
    type: 'PUBLIC',
    commissionType: 'PERCENTAGE',
    commissionRate: 10,
    cookieDuration: 30,
    minPayoutAmount: 50,
    categories: [],
    targetCountries: ['US'],
  });

  // GraphQL queries and mutations
  const { data: campaignsData, loading, error, refetch } = useQuery(GET_AFFILIATE_CAMPAIGNS, {
    variables: { 
      search: { 
        status: selectedTab === 'active' ? 'ACTIVE' : selectedTab === 'draft' ? 'DRAFT' : undefined,
        page: 1, 
        size: 20 
      } 
    }
  });

  const [createCampaign, { loading: creating }] = useMutation(CREATE_AFFILIATE_CAMPAIGN, {
    onCompleted: () => {
      setCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        type: 'PUBLIC',
        commissionType: 'PERCENTAGE',
        commissionRate: 10,
        cookieDuration: 30,
        minPayoutAmount: 50,
        categories: [],
        targetCountries: ['US'],
      });
      refetch();
    }
  });

  const [updateCampaign, { loading: updating }] = useMutation(UPDATE_AFFILIATE_CAMPAIGN, {
    onCompleted: () => {
      setEditingCampaign(null);
      refetch();
    }
  });

  const campaigns: AffiliateCampaign[] = campaignsData?.affiliateCampaigns || [];
  
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCampaign = async () => {
    try {
      await createCampaign({
        variables: { input: formData }
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;
    
    try {
      await updateCampaign({
        variables: { 
          id: editingCampaign.id, 
          input: formData 
        }
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const openEditDialog = (campaign: AffiliateCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      commissionType: campaign.commissionType,
      commissionRate: campaign.commissionRate,
      fixedAmount: campaign.fixedAmount,
      cookieDuration: campaign.cookieDuration,
      minPayoutAmount: campaign.minPayoutAmount,
      maxPayoutAmount: campaign.maxPayoutAmount,
      categories: campaign.categories,
      targetCountries: campaign.targetCountries,
      terms: campaign.terms,
    });
  };

  const CampaignCard = ({ campaign }: { campaign: AffiliateCampaign }) => (
    <Card key={campaign.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{campaign.name}</h3>
              <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {campaign.status}
              </Badge>
              <Badge variant="outline">
                {campaign.type}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{campaign.description}</p>
          </div>
          {userRole === 'MERCHANT' && (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.location.href = `/admin/affiliate/campaigns/${campaign.id}/applications`}
                title="View Applications"
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => openEditDialog(campaign)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-sm font-semibold">
              {campaign.commissionType === 'PERCENTAGE' ? 
                `${campaign.commissionRate}%` : 
                `$${campaign.fixedAmount}`
              }
            </div>
            <div className="text-xs text-muted-foreground">Hoa hồng</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm font-semibold">{campaign.totalClicks.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Lượt click</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-sm font-semibold">{campaign.totalConversions}</div>
            <div className="text-xs text-muted-foreground">Chuyển đổi</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-sm font-semibold">{campaign.conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Tỷ lệ</div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Doanh thu: ${campaign.totalRevenue.toFixed(2)}</span>
            <span>Hoa hồng: ${campaign.totalCommission.toFixed(2)}</span>
            {campaign.endDate && (
              <span>Kết thúc: {new Date(campaign.endDate).toLocaleDateString()}</span>
            )}
          </div>
          {userRole === 'AFFILIATE' && (
            <Button size="sm">
              Tạo Link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const CampaignForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên Chiến Dịch</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên chiến dịch"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Loại Chiến Dịch</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value) => setFormData({ ...formData, type: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Công khai</SelectItem>
              <SelectItem value="PRIVATE">Riêng tư</SelectItem>
              <SelectItem value="INVITE_ONLY">Chỉ theo mời</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô Tả</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả chiến dịch của bạn"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="commissionType">Loại Hoa Hồng</Label>
          <Select 
            value={formData.commissionType} 
            onValueChange={(value) => setFormData({ ...formData, commissionType: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
              <SelectItem value="FIXED">Số tiền cố định</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="commission">
            {formData.commissionType === 'PERCENTAGE' ? 'Tỷ Lệ Hoa Hồng (%)' : 'Số Tiền Cố Định ($)'}
          </Label>
          <Input
            id="commission"
            type="number"
            value={formData.commissionType === 'PERCENTAGE' ? formData.commissionRate : formData.fixedAmount}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (formData.commissionType === 'PERCENTAGE') {
                setFormData({ ...formData, commissionRate: value });
              } else {
                setFormData({ ...formData, fixedAmount: value });
              }
            }}
            placeholder={formData.commissionType === 'PERCENTAGE' ? '10' : '25.00'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cookieDuration">Thời Gian Cookie (ngày)</Label>
          <Input
            id="cookieDuration"
            type="number"
            value={formData.cookieDuration || 30}
            onChange={(e) => setFormData({ ...formData, cookieDuration: parseInt(e.target.value) })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minPayout">Số Tiền Thanh Toán Tối Thiểu ($)</Label>
          <Input
            id="minPayout"
            type="number"
            value={formData.minPayoutAmount || 50}
            onChange={(e) => setFormData({ ...formData, minPayoutAmount: parseFloat(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-12 bg-muted rounded"></div>
                    ))}
                  </div>
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
          <h1 className="text-3xl font-bold">
            {userRole === 'MERCHANT' ? 'Chiến Dịch Của Tôi' : 'Chiến Dịch Có Sẵn'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'MERCHANT' 
              ? 'Quản lý các chiến dịch tiếp thị affiliate của bạn' 
              : 'Duyệt và tham gia chiến dịch để bắt đầu kiếm tiền'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRole === 'AFFILIATE' && (
            <Button onClick={() => window.location.href = '/admin/affiliate/browse'}>
              <Search className="h-4 w-4 mr-2" />
              Duyệt Tất Cả Chiến Dịch
            </Button>
          )}
          {userRole === 'MERCHANT' && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Chiến Dịch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tạo Chiến Dịch Mới</DialogTitle>

                </DialogHeader>
                <CampaignForm />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateCampaign} disabled={creating}>
                    {creating ? 'Đang tạo...' : 'Tạo Chiến Dịch'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="draft">Bản nháp</TabsTrigger>
            <TabsTrigger value="ended">Đã kết thúc</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm chiến dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Không tìm thấy chiến dịch</h3>
                <p className="text-muted-foreground mb-4">
                  {userRole === 'MERCHANT' 
                    ? "Bạn chưa tạo chiến dịch nào." 
                    : "Không có chiến dịch nào phù hợp với tiêu chí tìm kiếm."
                  }
                </p>
                {userRole === 'MERCHANT' && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Chiến Dịch Đầu Tiên
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Chiến Dịch</DialogTitle>

          </DialogHeader>
          <CampaignForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCampaign(null)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateCampaign} disabled={updating}>
              {updating ? 'Đang cập nhật...' : 'Cập Nhật Chiến Dịch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}