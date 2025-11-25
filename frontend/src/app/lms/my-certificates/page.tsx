'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { GET_MY_CERTIFICATES } from '@/graphql/lms/certificates.graphql';
import CertificateCard from '@/components/lms/CertificateCard';
import { Award, TrendingUp, Calendar } from 'lucide-react';

export default function MyCertificatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/lms/my-certificates');
    }
  }, [user, authLoading, router]);

  const { data, loading, error } = useQuery(GET_MY_CERTIFICATES, {
    skip: !user, // Skip query if user is not logged in
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Lỗi tải chứng chỉ: {error.message}
        </div>
      </div>
    );
  }

  const certificates = data?.myCertificates || [];
  const stats = data?.certificateStats || { total: 0, thisMonth: 0, thisYear: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Award className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Chứng chỉ của tôi</h1>
            <p className="text-gray-600 mt-1">Các chứng chỉ hoàn thành khóa học bạn đã đạt được</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl shadow-md border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium mb-1">Tổng số chứng chỉ</p>
                <p className="text-3xl font-bold text-amber-700">{stats.total}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">Tháng này</p>
                <p className="text-3xl font-bold text-blue-700">{stats.thisMonth}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl shadow-md border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Năm nay</p>
                <p className="text-3xl font-bold text-green-700">{stats.thisYear}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert: any) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Award className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chứng chỉ nào</h3>
              <p className="text-gray-600 mb-6">
                Hoàn thành khóa học để nhận chứng chỉ đầu tiên và thể hiện thành tích của bạn!
              </p>
              <a
                href="/lms/courses"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Khám phá khóa học
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
