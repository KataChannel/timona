'use client'

import React, { useState } from 'react';
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
import { 
  Plus, 
  Copy, 
  ExternalLink, 
  QrCode, 
  BarChart3, 
  Edit,
  Trash2,
  Link2,
  MousePointer,
  TrendingUp,
  Eye
} from 'lucide-react';
import { GET_AFFILIATE_LINKS, GET_AFFILIATE_CAMPAIGNS, CREATE_AFFILIATE_LINK } from '../../../graphql/affiliate.queries';
import { AffiliateLink, AffiliateCampaign, CreateAffiliateLinkInput } from '../../../types/affiliate';

interface LinkManagementProps {
  className?: string;
}

export default function LinkManagement({ className = '' }: LinkManagementProps) {
  const [selectedTab, setSelectedTab] = useState('active');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  
  // Form state for link creation
  const [formData, setFormData] = useState<CreateAffiliateLinkInput>({
    campaignId: '',
    originalUrl: '',
    customAlias: '',
    title: '',
    description: '',
  });

  // GraphQL queries and mutations
  const { data: linksData, loading: linksLoading, error, refetch } = useQuery(GET_AFFILIATE_LINKS, {
    variables: { 
      search: { 
        isActive: selectedTab === 'active' ? true : selectedTab === 'inactive' ? false : undefined,
        pagination: {
          page: 1, 
          size: 20
        }
      } 
    }
  });

  const { data: campaignsData, loading: campaignsLoading } = useQuery(GET_AFFILIATE_CAMPAIGNS, {
    variables: { search: { status: 'ACTIVE', page: 1, size: 100 } }
  });

  const [createLink, { loading: creating }] = useMutation(CREATE_AFFILIATE_LINK, {
    onCompleted: () => {
      setCreateDialogOpen(false);
      setFormData({
        campaignId: '',
        originalUrl: '',
        customAlias: '',
        title: '',
        description: '',
      });
      refetch();
    }
  });

  const links: AffiliateLink[] = linksData?.affiliateLinks || [];
  const campaigns: AffiliateCampaign[] = campaignsData?.affiliateCampaigns || [];
  
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampaign = selectedCampaign === 'all' || link.campaignId === selectedCampaign;
    return matchesSearch && matchesCampaign;
  });

  const handleCreateLink = async () => {
    try {
      await createLink({
        variables: { input: formData }
      });
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const LinkCard = ({ link }: { link: AffiliateLink }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{link.title || link.campaign.name}</h3>
              <Badge variant={link.isActive ? 'default' : 'secondary'}>
                {link.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {link.description || 'Chưa có mô tả'}
            </p>
            <div className="text-sm text-muted-foreground mb-3">
              Chiến dịch: <span className="font-medium">{link.campaign.name}</span>
            </div>
          </div>
        </div>

        {/* Link URL Display */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs">URL rút gọn:</Label>
            <code className="flex-1 text-sm bg-muted px-2 py-1 rounded truncate">
              {link.shortUrl}
            </code>
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.shortUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          {link.customAlias && (
            <div className="text-xs text-muted-foreground">
              Alias: {link.customAlias}
            </div>
          )}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <MousePointer className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-sm font-semibold">{(link.totalClicks || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Lượt click</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-sm font-semibold">{link.totalConversions || 0}</div>
            <div className="text-xs text-muted-foreground">Chuyển đổi</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-sm font-semibold">{(link.conversionRate || 0).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Tỷ lệ</div>
          </div>
        </div>

        {/* Revenue and Commission */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Doanh thu: <span className="font-medium text-foreground">${((link.revenue || 0) || 0).toFixed(2)}</span>
            {' • '}
            Hoa hồng: <span className="font-medium text-green-600">${(link.commission || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <QrCode className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          Tạo lúc: {new Date(link.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  const LinkForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="campaign">Chiến Dịch</Label>
        <Select 
          value={formData.campaignId} 
          onValueChange={(value) => setFormData({ ...formData, campaignId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn chiến dịch" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{campaign.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {campaign.commissionType === 'PERCENTAGE' ? 
                      `${campaign.commissionRate}%` : 
                      `$${campaign.fixedAmount}`
                    }
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="originalUrl">URL Đích</Label>
        <Input
          id="originalUrl"
          value={formData.originalUrl}
          onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
          placeholder="https://example.com/product"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customAlias">Biệt danh tùy chỉnh (tùy chọn)</Label>
        <Input
          id="customAlias"
          value={formData.customAlias || ''}
          onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
          placeholder="link-đặc-biệt"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Tiêu Đề Link</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Tiêu đề mô tả cho link của bạn"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô Tả (tùy chọn)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ghi chú bổ sung về link này"
          rows={3}
        />
      </div>
    </div>
  );

  if (linksLoading || campaignsLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, j) => (
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
          <h1 className="text-3xl font-bold">Links Affiliate</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các links theo dõi affiliate của bạn
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo Link Affiliate Mới</DialogTitle>
            </DialogHeader>
            <LinkForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleCreateLink} 
                disabled={creating || !formData.campaignId || !formData.originalUrl}
              >
                {creating ? 'Đang tạo...' : 'Tạo Link'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between mb-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả chiến dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chiến dịch</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Links Grid */}
      <div className="space-y-4">
        {filteredLinks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Không tìm thấy links</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCampaign 
                    ? "Không có links nào phù hợp với tiêu chí tìm kiếm." 
                    : "Bạn chưa tạo links affiliate nào."
                  }
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo Link Đầu Tiên
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredLinks.map(link => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredLinks.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Thống Kê Tổng Hợp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{filteredLinks.length}</div>
                <div className="text-sm text-muted-foreground">Tổng Links</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredLinks.reduce((sum, link) => sum + (link.totalClicks || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Tổng Lượt Click</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredLinks.reduce((sum, link) => sum + (link.totalConversions || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Tổng Chuyển Đổi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${filteredLinks.reduce((sum, link) => sum + (link.commission || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Tổng Kiếm Được</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}