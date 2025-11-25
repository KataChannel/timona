'use client';

import React from 'react';
import { Award, Download, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

interface CertificateCardProps {
  certificate: {
    id: string;
    certificateNumber: string;
    courseName: string;
    instructorName: string;
    completionDate: string;
    verificationUrl?: string;
    course?: {
      title: string;
      thumbnail?: string;
    };
  };
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const handleDownload = () => {
    // TODO: Implement PDF download
    window.print();
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-amber-200 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <Award className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {certificate.courseName}
            </h3>
            <p className="text-sm text-gray-600 font-mono">
              #{certificate.certificateNumber}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Instructor: {certificate.instructorName}
            </p>
          </div>
        </div>
        
        {certificate.course?.thumbnail && (
          <img
            src={certificate.course.thumbnail}
            alt={certificate.courseName}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Calendar className="w-4 h-4" />
        <span>Completed: {new Date(certificate.completionDate).toLocaleDateString('vi-VN')}</span>
      </div>

      <div className="flex gap-2 pt-4 border-t border-amber-200">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        
        {certificate.verificationUrl && (
          <Link
            href={certificate.verificationUrl}
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Verify
          </Link>
        )}
      </div>
    </div>
  );
}
