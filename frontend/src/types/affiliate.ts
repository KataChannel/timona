// Affiliate System Types
export interface AffiliateUser {
  id: string;
  userId: string;
  role: 'AFFILIATE' | 'MERCHANT';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  businessName?: string;
  website?: string;
  taxId?: string;
  paymentEmail: string;
  paymentMethod: 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO';
  bankDetails?: Record<string, any>;
  socialProfiles?: Record<string, any>;
  complianceDocuments?: Record<string, any>;
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  averageOrderValue: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateCampaign {
  id: string;
  name: string;
  description: string;
  type: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate: number;
  fixedAmount: number;
  cookieDuration: number;
  minPayoutAmount: number;
  maxPayoutAmount?: number;
  totalRevenue: number;
  totalCommission: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  averageOrderValue: number;
  categories: string[];
  targetCountries: string[];
  targetAudience?: Record<string, any>;
  terms?: string;
  materials?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

export interface AffiliateLink {
  id: string;
  affiliateUserId: string;
  campaignId: string;
  trackingCode: string;
  originalUrl: string;
  shortUrl: string;
  customAlias?: string;
  title?: string;
  description?: string;
  totalClicks: number;
  totalConversions: number;
  revenue: number;
  commission: number;
  conversionRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  campaign: AffiliateCampaign;
}

export interface AffiliateClick {
  id: string;
  linkId: string;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  country?: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  clickedAt: Date;
}

export interface AffiliateConversion {
  id: string;
  linkId: string;
  clickId?: string;
  orderId?: string;
  customerEmail?: string;
  saleAmount: number;
  commission: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  metadata?: Record<string, any>;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  convertedAt: Date;
}

export interface AffiliatePaymentRequest {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  paymentMethod: 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  accountDetails?: string;
  transactionId?: string;
  processedBy?: string;
  processedAt?: Date;
  adminNotes?: string;
  requestedAt: Date;
}

// Input Types
export interface CreateAffiliateUserInput {
  role: 'AFFILIATE' | 'MERCHANT';
  businessName?: string;
  website?: string;
  paymentEmail: string;
  paymentMethod: 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO';
  bankDetails?: Record<string, any>;
  socialProfiles?: Record<string, any>;
}

export interface CreateCampaignInput {
  name: string;
  description: string;
  type: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionRate?: number;
  fixedAmount?: number;
  cookieDuration: number;
  minPayoutAmount: number;
  maxPayoutAmount?: number;
  categories: string[];
  targetCountries: string[];
  targetAudience?: Record<string, any>;
  terms?: string;
  materials?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateAffiliateLinkInput {
  campaignId: string;
  originalUrl: string;
  customAlias?: string;
  title?: string;
  description?: string;
}

export interface CreatePaymentRequestInput {
  amount: number;
  paymentMethod: 'PAYPAL' | 'BANK_TRANSFER' | 'CRYPTO';
  accountDetails?: string;
  notes?: string;
  periodStart: string;
  periodEnd: string;
}

// Dashboard Stats
export interface AffiliateDashboardStats {
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  pendingCommissions: number;
  activeLinks: number;
  activeCampaigns: number;
  recentClicks: AffiliateClick[];
  recentConversions: AffiliateConversion[];
  earningsChart: { date: string; earnings: number }[];
  clicksChart: { date: string; clicks: number }[];
}

export interface MerchantDashboardStats {
  totalRevenue: number;
  totalCommissionPaid: number;
  totalAffiliates: number;
  totalCampaigns: number;
  activeCampaigns: number;
  topAffiliates: (AffiliateUser & { revenue: number; conversions: number })[];
  revenueChart: { date: string; revenue: number }[];
  conversionChart: { date: string; conversions: number }[];
}