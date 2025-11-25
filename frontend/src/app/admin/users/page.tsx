/**
 * Admin Users Page
 * 
 * Main entry point for user management
 * Clean, simple, and maintainable
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasAdminAccess, getUserDisplayRole } from '@/lib/rbac-utils';

// Import components
import { UserManagementHeader } from '@/components/admin/users/UserManagementHeader';
import { UserManagementContent } from '@/components/admin/users/UserManagementContent';
import { LoadingState } from '@/components/admin/users/LoadingState';
import { AccessDenied } from '@/components/admin/users/AccessDenied';
import RbacManagement from '@/components/admin/rbac/RbacManagement';

export default function AdminUsersPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize activeTab from URL parameter
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'users' | 'rbac'>(
    tabParam === 'rbac' ? 'rbac' : 'users'
  );

  // Update tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'rbac' || tabParam === 'users') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('AdminUsersPage: Not authenticated, redirecting to login');
      router.push('/login');
    } else if (!loading && isAuthenticated && !hasAdminAccess(user)) {
      console.log('AdminUsersPage: User does not have admin access', { 
        roleType: user?.roleType,
        roles: user?.roles?.map(r => r.name)
      });
      // Don't redirect, show access denied instead
    }
  }, [loading, isAuthenticated, user, router]);

  // Show loading state
  if (loading) {
    return <LoadingState message="Loading admin panel..." />;
  }

  // Show access denied for users without admin access
  if (isAuthenticated && !hasAdminAccess(user)) {
    return <AccessDenied userRole={getUserDisplayRole(user)} requiredRole="Admin or Content Manager" />;
  }

  // Redirect if not authenticated (will be handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Main content - only show if authenticated and admin
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Page Header with Tab Navigation */}
      <UserManagementHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Content */}
      {activeTab === 'users' && <UserManagementContent />}
      {activeTab === 'rbac' && <RbacManagement />}
    </div>
  );
}
