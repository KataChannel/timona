'use client'

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ApplicationReviewPanel from '@/components/affiliate/campaigns/ApplicationReviewPanel';

export default function CampaignApplicationsPage() {
  const params = useParams();
  const campaignId = params?.id as string;

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        {campaignId ? (
          <ApplicationReviewPanel campaignId={campaignId} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No campaign selected
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
