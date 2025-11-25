'use client';

import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Search, CheckCircle, XCircle, Award, Calendar, User } from 'lucide-react';
import Link from 'next/link';

const VERIFY_CERTIFICATE = gql`
  query VerifyCertificate($certificateNumber: String!) {
    verifyCertificate(certificateNumber: $certificateNumber) {
      valid
      certificate {
        id
        certificateNumber
        issuedDate
        course {
          title
          instructor {
            firstName
            lastName
            username
          }
        }
        user {
          firstName
          lastName
          username
        }
      }
    }
  }
`;

export default function VerifyCertificatePage() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verifyCertificate, { data, loading, error }] = useLazyQuery(VERIFY_CERTIFICATE);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateNumber.trim()) {
      verifyCertificate({
        variables: { certificateNumber: certificateNumber.trim() },
      });
    }
  };

  const result = data?.verifyCertificate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Xác Thực Chứng Chỉ</h1>
                <p className="text-sm text-gray-600">Kiểm tra tính hợp lệ của chứng chỉ LMS</p>
              </div>
            </div>
            <Link
              href="/lms"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="certificateNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Mã Chứng Chỉ
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="certificateNumber"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="Ví dụ: LMS-1730280000000-abc123"
                    className="w-full pl-12 pr-4 py-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  disabled={loading || !certificateNumber.trim()}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Đang kiểm tra...' : 'Xác thực'}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Nhập mã chứng chỉ được cung cấp trên chứng chỉ của bạn để xác minh tính hợp lệ.
            </p>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Lỗi xác thực</h3>
                <p className="text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className={`rounded-2xl p-8 border-2 ${
            result.valid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              {result.valid ? (
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
              )}
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  result.valid ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.valid ? 'Chứng chỉ hợp lệ ✓' : 'Chứng chỉ không hợp lệ'}
                </h2>
                <p className={result.valid ? 'text-green-700' : 'text-red-700'}>
                  {result.valid 
                    ? 'Chứng chỉ này được cấp bởi hệ thống LMS và hoàn toàn hợp lệ.' 
                    : 'Chứng chỉ này không tồn tại trong hệ thống hoặc đã bị thu hồi.'}
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            {result.valid && result.certificate && (
              <div className="bg-white rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Thông Tin Chứng Chỉ</h3>
                
                {/* Certificate Number */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Mã chứng chỉ</p>
                    <p className="font-mono font-medium text-gray-900">
                      {result.certificate.certificateNumber}
                    </p>
                  </div>
                </div>

                {/* Issued Date */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Ngày cấp</p>
                    <p className="font-medium text-gray-900">
                      {new Date(result.certificate.issuedDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Student */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Học viên</p>
                    <p className="font-medium text-gray-900">
                      {result.certificate.user.firstName && result.certificate.user.lastName
                        ? `${result.certificate.user.firstName} ${result.certificate.user.lastName}`
                        : result.certificate.user.username}
                    </p>
                  </div>
                </div>

                {/* Course */}
                <div className="flex items-start gap-3 pb-4 border-b">
                  <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Khóa học</p>
                    <p className="font-medium text-gray-900">
                      {result.certificate.course.title}
                    </p>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Giảng viên</p>
                    <p className="font-medium text-gray-900">
                      {result.certificate.course.instructor.firstName && result.certificate.course.instructor.lastName
                        ? `${result.certificate.course.instructor.firstName} ${result.certificate.course.instructor.lastName}`
                        : result.certificate.course.instructor.username}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!result && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Hướng dẫn</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Mã chứng chỉ được in trên chứng chỉ PDF của bạn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Format: LMS-[timestamp]-[hash]</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Mỗi chứng chỉ có mã duy nhất không trùng lặp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Chứng chỉ hợp lệ sẽ hiển thị đầy đủ thông tin học viên và khóa học</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
