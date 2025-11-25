'use client'

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Avatar } from '../../ui/avatar';
import { Skeleton } from '../../ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  GET_CAMPAIGN_APPLICATIONS, 
  REVIEW_CAMPAIGN_APPLICATION 
} from '../../../graphql/affiliate.queries';

interface Application {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  reviewReason?: string;
  approvedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  affiliate: {
    id: string;
    businessName?: string;
    website?: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface ApplicationReviewPanelProps {
  campaignId: string;
  className?: string;
}

export default function ApplicationReviewPanel({
  campaignId,
  className = ''
}: ApplicationReviewPanelProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // Fetch campaign applications
  const { data, loading, refetch } = useQuery(GET_CAMPAIGN_APPLICATIONS, {
    variables: { campaignId },
    skip: !campaignId
  });

  // Review mutation
  const [reviewApplication, { loading: reviewing }] = useMutation(
    REVIEW_CAMPAIGN_APPLICATION,
    {
      onCompleted: () => {
        setReviewDialogOpen(false);
        setSelectedApplication(null);
        setReviewReason('');
        setError('');
        refetch();
      },
      onError: (err) => {
        setError(err.message || 'Failed to review application');
      }
    }
  );

  const campaign = data?.getAffiliateCampaign;
  const applications: Application[] = campaign?.affiliates || [];

  const pendingApplications = applications.filter(app => app.status === 'PENDING');
  const approvedApplications = applications.filter(app => app.status === 'APPROVED');
  const rejectedApplications = applications.filter(app => app.status === 'REJECTED');

  const handleReviewClick = (application: Application, action: 'approved' | 'rejected') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewReason('');
    setError('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    try {
      await reviewApplication({
        variables: {
          input: {
            applicationId: selectedApplication.id,
            action: reviewAction,
            reason: reviewReason.trim() || undefined
          }
        }
      });
    } catch (err) {
      // Error handled by onError callback
    }
  };

  const renderApplicationCard = (application: Application) => {
    const isPending = application.status === 'PENDING';
    const isApproved = application.status === 'APPROVED';
    const isRejected = application.status === 'REJECTED';

    return (
      <Card key={application.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {application.affiliate.user.firstName[0]}
                {application.affiliate.user.lastName[0]}
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {application.affiliate.user.firstName} {application.affiliate.user.lastName}
                </CardTitle>
                {application.affiliate.businessName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.affiliate.businessName}
                  </p>
                )}
              </div>
            </div>
            <Badge
              className={
                isPending
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : isApproved
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }
            >
              {isPending ? (
                <Clock className="h-3 w-3 mr-1" />
              ) : isApproved ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {application.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <span>{application.affiliate.user.email}</span>
            </div>
            {application.affiliate.website && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Globe className="h-4 w-4 mr-2" />
                <a
                  href={application.affiliate.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 dark:text-blue-400"
                >
                  {application.affiliate.website}
                </a>
              </div>
            )}
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Application Message */}
          {application.message && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
              <div className="flex items-start space-x-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-sm font-medium">Message:</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {application.message}
              </p>
            </div>
          )}

          {/* Review Reason (if rejected) */}
          {isRejected && application.reviewReason && (
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Rejection Reason:
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">
                {application.reviewReason}
              </p>
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleReviewClick(application, 'approved')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleReviewClick(application, 'rejected')}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Application Review</h2>
        <p className="text-muted-foreground mt-2">
          {campaign?.name || 'Campaign'} - Review and manage affiliate applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingApplications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedApplications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedApplications.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Pending Applications ({pendingApplications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingApplications.map(renderApplicationCard)}
          </div>
        </div>
      )}

      {/* Approved Applications */}
      {approvedApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Approved Affiliates ({approvedApplications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {approvedApplications.map(renderApplicationCard)}
          </div>
        </div>
      )}

      {/* Rejected Applications */}
      {rejectedApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Rejected Applications ({rejectedApplications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {rejectedApplications.map(renderApplicationCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Affiliates who apply to your campaign will appear here
          </p>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'Approve Application' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {selectedApplication &&
                `${selectedApplication.affiliate.user.firstName} ${selectedApplication.affiliate.user.lastName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Application Message */}
            {selectedApplication?.message && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
                <Label className="text-sm font-medium mb-2 block">Their Message:</Label>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedApplication.message}
                </p>
              </div>
            )}

            {/* Review Reason */}
            <div className="space-y-2">
              <Label htmlFor="reviewReason">
                {reviewAction === 'approved' ? 'Approval Message' : 'Rejection Reason'}{' '}
                {reviewAction === 'rejected' ? '(Recommended)' : '(Optional)'}
              </Label>
              <Textarea
                id="reviewReason"
                placeholder={
                  reviewAction === 'approved'
                    ? 'Welcome message (optional)...'
                    : 'Explain why this application was rejected...'
                }
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitReview}
              disabled={reviewing}
              className={
                reviewAction === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : reviewAction === 'approved' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
