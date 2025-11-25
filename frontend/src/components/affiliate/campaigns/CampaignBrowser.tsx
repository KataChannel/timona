'use client'

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Skeleton } from '../../ui/skeleton';
import { 
  Search, 
  Filter,
  DollarSign, 
  Calendar, 
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import { GET_AFFILIATE_CAMPAIGNS, GET_MY_CAMPAIGN_APPLICATIONS } from '../../../graphql/affiliate.queries';
import { AffiliateCampaign } from '../../../types/affiliate';
import JoinCampaignModal from './JoinCampaignModal';

interface CampaignBrowserProps {
  className?: string;
}

type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null;

interface CampaignApplication {
  id: string;
  status: ApplicationStatus;
  campaign: {
    id: string;
  };
}

export default function CampaignBrowser({ className = '' }: CampaignBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionFilter, setCommissionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [selectedCampaign, setSelectedCampaign] = useState<AffiliateCampaign | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Fetch available campaigns
  const { data: campaignsData, loading: campaignsLoading, refetch: refetchCampaigns } = useQuery(
    GET_AFFILIATE_CAMPAIGNS,
    {
      variables: {
        search: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page: 1,
          size: 50
        }
      }
    }
  );

  // Fetch my applications
  const { data: applicationsData, refetch: refetchApplications } = useQuery(
    GET_MY_CAMPAIGN_APPLICATIONS,
    {
      fetchPolicy: 'cache-and-network'
    }
  );

  const campaigns: AffiliateCampaign[] = campaignsData?.affiliateCampaigns || [];
  const myApplications: CampaignApplication[] = 
    applicationsData?.affiliateUser?.campaignJoins || [];

  // Create a map of campaign IDs to application status
  const applicationStatusMap = new Map<string, ApplicationStatus>();
  myApplications.forEach((app) => {
    applicationStatusMap.set(app.campaign.id, app.status as ApplicationStatus);
  });

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    // Search filter
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Commission filter
    const matchesCommission =
      commissionFilter === 'all' ||
      (commissionFilter === 'percentage' && campaign.commissionType === 'PERCENTAGE') ||
      (commissionFilter === 'fixed' && campaign.commissionType === 'FIXED');

    return matchesSearch && matchesCommission;
  });

  const handleJoinClick = (campaign: AffiliateCampaign) => {
    setSelectedCampaign(campaign);
    setJoinModalOpen(true);
  };

  const handleJoinSuccess = () => {
    refetchApplications();
    refetchCampaigns();
  };

  const getApplicationStatus = (campaignId: string): ApplicationStatus => {
    return applicationStatusMap.get(campaignId) || null;
  };

  const renderStatusBadge = (status: ApplicationStatus) => {
    if (!status) return null;

    const config = {
      PENDING: { icon: Clock, label: 'Đang chờ', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      APPROVED: { icon: CheckCircle, label: 'Đã tham gia', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      REJECTED: { icon: XCircle, label: 'Từ chối', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };

    const { icon: Icon, label, className } = config[status];

    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (campaignsLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chiến Dịch Affiliate</h2>
        <p className="text-muted-foreground mt-2">
          Khám phá và tham gia các chiến dịch phù hợp với đối tượng của bạn
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm chiến dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={commissionFilter} onValueChange={setCommissionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Loại hoa hồng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="percentage">Phần trăm</SelectItem>
            <SelectItem value="fixed">Số tiền cố định</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
            <SelectItem value="PAUSED">Tạm dừng</SelectItem>
            <SelectItem value="DRAFT">Nháp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Tìm thấy {filteredCampaigns.length} chiến dịch
      </div>

      {/* Campaign Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => {
          const applicationStatus = getApplicationStatus(campaign.id);
          const canJoin = !applicationStatus && campaign.status === 'ACTIVE';

          return (
            <Card key={campaign.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">
                        {campaign.type}
                      </Badge>
                      {renderStatusBadge(applicationStatus)}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {campaign.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Commission */}
                <div className="flex items-center text-2xl font-bold text-green-600 dark:text-green-400">
                  <DollarSign className="h-6 w-6 mr-1" />
                  {campaign.commissionType === 'PERCENTAGE'
                    ? `${campaign.commissionRate ?? 0}%`
                    : `${(campaign.fixedAmount ?? 0).toLocaleString()} VND`}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                    mỗi đơn
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{campaign.cookieDuration ?? 0}d cookie</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>{(campaign.conversionRate ?? 0).toFixed(2)}% CVR</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{campaign.totalConversions ?? 0} đơn hàng</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Eye className="h-4 w-4 mr-2" />
                    <span>{campaign.totalClicks ?? 0} lượt click</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {canJoin ? (
                    <Button
                      onClick={() => handleJoinClick(campaign)}
                      className="flex-1"
                    >
                      Tham gia chiến dịch
                    </Button>
                  ) : applicationStatus === 'APPROVED' ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Đã tham gia
                    </Button>
                  ) : applicationStatus === 'PENDING' ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Đang chờ duyệt
                    </Button>
                  ) : applicationStatus === 'REJECTED' ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Đơn bị từ chối
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled
                    >
                      Không khả dụng
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy chiến dịch</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}

      {/* Join Campaign Modal */}
      <JoinCampaignModal
        campaign={selectedCampaign}
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
}
