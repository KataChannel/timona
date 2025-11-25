// Affiliate System Components
export { default as AffiliateDashboard } from './dashboard/AffiliateDashboard';
export { default as CampaignManagement } from './campaigns/CampaignManagement';
export { default as LinkManagement } from './links/LinkManagement';
export { default as PaymentManagement } from './payments/PaymentManagement';

// Re-export types
export * from '../../types/affiliate';
export * from '../../graphql/affiliate.queries';