'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute';
import CampaignBrowser from '@/components/affiliate/campaigns/CampaignBrowser';

export default function BrowseCampaignsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <CampaignBrowser />
      </div>
    </ProtectedRoute>
  );
}
