import { gql } from '@apollo/client';

// ===== USER MANAGEMENT QUERIES =====
export const GET_AFFILIATE_USER = gql`
  query GetAffiliateUser {
    affiliateUser {
      id
      userId
      role
      status
      businessName
      website
      taxId
      paymentEmail
      paymentMethod
      bankDetails
      socialProfiles
      complianceDocuments
      totalEarnings
      totalClicks
      totalConversions
      conversionRate
      averageOrderValue
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_AFFILIATE_USER = gql`
  mutation CreateAffiliateUser($input: CreateAffUserInput!) {
    createAffiliateUser(input: $input) {
      id
      userId
      role
      status
      businessName
      website
      paymentEmail
      paymentMethod
      totalEarnings
      isVerified
      createdAt
    }
  }
`;

export const UPDATE_AFFILIATE_USER = gql`
  mutation UpdateAffiliateUser($input: UpdateAffUserInput!) {
    updateAffiliateUser(input: $input) {
      id
      businessName
      website
      paymentEmail
      paymentMethod
      bankDetails
      socialProfiles
      updatedAt
    }
  }
`;

// ===== CAMPAIGN MANAGEMENT QUERIES =====
export const GET_AFFILIATE_CAMPAIGNS = gql`
  query GetAffiliateCampaigns($search: CampaignSearchInput) {
    affiliateCampaigns(search: $search) {
      id
      name
      description
      type
      status
      commissionType
      commissionRate
      fixedAmount
      cookieDuration
      minPayoutAmount
      maxPayoutAmount
      totalRevenue
      totalCommission
      totalClicks
      totalConversions
      conversionRate
      averageOrderValue
      categories
      targetCountries
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_AFFILIATE_CAMPAIGN = gql`
  query GetAffiliateCampaign($id: String!) {
    affiliateCampaign(id: $id) {
      id
      name
      description
      type
      status
      commissionType
      commissionRate
      fixedAmount
      cookieDuration
      minPayoutAmount
      maxPayoutAmount
      totalRevenue
      totalCommission
      totalClicks
      totalConversions
      conversionRate
      averageOrderValue
      categories
      targetCountries
      targetAudience
      terms
      materials
      startDate
      endDate
      createdAt
      updatedAt
      creatorId
    }
  }
`;

export const CREATE_AFFILIATE_CAMPAIGN = gql`
  mutation CreateAffiliateCampaign($input: CreateCampaignInput!) {
    createAffiliateCampaign(input: $input) {
      id
      name
      description
      type
      status
      commissionType
      commissionRate
      fixedAmount
      totalRevenue
      totalCommission
      createdAt
    }
  }
`;

export const UPDATE_AFFILIATE_CAMPAIGN = gql`
  mutation UpdateAffiliateCampaign($id: String!, $input: UpdateCampaignInput!) {
    updateAffiliateCampaign(id: $id, input: $input) {
      id
      name
      description
      status
      commissionRate
      fixedAmount
      updatedAt
    }
  }
`;

export const JOIN_CAMPAIGN = gql`
  mutation JoinCampaign($input: JoinCampaignInput!) {
    joinCampaign(input: $input)
  }
`;

export const REVIEW_CAMPAIGN_APPLICATION = gql`
  mutation ReviewCampaignApplication($input: ReviewCampaignApplicationInput!) {
    reviewCampaignApplication(input: $input)
  }
`;

export const DELETE_AFFILIATE_CAMPAIGN = gql`
  mutation DeleteAffiliateCampaign($id: String!) {
    deleteAffiliateCampaign(id: $id)
  }
`;

export const GET_MY_CAMPAIGN_APPLICATIONS = gql`
  query GetMyCampaignApplications {
    affiliateUser {
      id
      role
      campaignJoins {
        id
        status
        reason
        approvedAt
        rejectedAt
        appliedAt
        createdAt
        totalClicks
        totalConversions
        totalEarnings
        campaign {
          id
          name
          description
          commissionType
          commissionRate
          fixedAmount
          status
          productName
          productUrl
          productImage
          startDate
          endDate
        }
      }
    }
  }
`;

export const GET_CAMPAIGN_APPLICATIONS = gql`
  query GetCampaignApplications($campaignId: String!) {
    getAffiliateCampaign(id: $campaignId) {
      id
      name
      affiliates {
        id
        status
        message
        reviewReason
        approvedAt
        reviewedAt
        createdAt
        affiliate {
          id
          businessName
          website
          user {
            firstName
            lastName
            email
          }
        }
      }
    }
  }
`;

// ===== LINK MANAGEMENT QUERIES =====
export const GET_AFFILIATE_LINKS = gql`
  query GetAffiliateLinks($search: AffLinkSearchInput) {
    affiliateLinks(search: $search) {
      id
      affiliateUserId
      campaignId
      trackingCode
      originalUrl
      shortUrl
      customAlias
      title
      description
      totalClicks
      totalConversions
      revenue
      commission
      conversionRate
      isActive
      createdAt
      updatedAt
      campaign {
        id
        name
        commissionType
        commissionRate
        fixedAmount
      }
    }
  }
`;

export const CREATE_AFFILIATE_LINK = gql`
  mutation CreateAffiliateLink($input: CreateAffLinkInput!) {
    createAffiliateLink(input: $input) {
      id
      trackingCode
      originalUrl
      shortUrl
      customAlias
      title
      description
      isActive
      createdAt
      campaign {
        id
        name
      }
    }
  }
`;

// ===== CONVERSION TRACKING QUERIES =====
export const GET_AFFILIATE_CONVERSIONS = gql`
  query GetAffiliateConversions($search: AffConversionSearchInput) {
    affiliateConversions(search: $search)
  }
`;

// ===== PAYMENT MANAGEMENT QUERIES =====
export const GET_AFFILIATE_PAYMENT_REQUESTS = gql`
  query GetAffiliatePaymentRequests($search: AffPaymentRequestSearchInput) {
    affiliatePaymentRequests(search: $search) {
      id
      affiliateId
      amount
      currency
      paymentMethod
      status
      accountDetails
      transactionId
      processedBy
      processedAt
      adminNotes
      requestedAt
    }
  }
`;

export const CREATE_PAYMENT_REQUEST = gql`
  mutation CreatePaymentRequest($input: CreatePaymentRequestInput!) {
    createPaymentRequest(input: $input) {
      id
      amount
      currency
      paymentMethod
      status
      requestedAt
    }
  }
`;

export const PROCESS_PAYMENT_REQUEST = gql`
  mutation ProcessPaymentRequest($id: String!, $status: String!) {
    processPaymentRequest(id: $id, status: $status) {
      id
      status
      processedAt
      transactionId
    }
  }
`;

// ===== ANALYTICS QUERIES =====
export const GET_AFFILIATE_EARNINGS_REPORT = gql`
  query GetAffiliateEarningsReport($startDate: DateTime, $endDate: DateTime) {
    affiliateEarningsReport(startDate: $startDate, endDate: $endDate) {
      totalConversions
      totalEarnings
      pendingConversions
      pendingEarnings
      approvedConversions
      approvedEarnings
      paidConversions
      paidEarnings
      availableForWithdrawal
    }
  }
`;