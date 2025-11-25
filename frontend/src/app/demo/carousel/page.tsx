'use client';

import { WebsiteHeader } from '@/components/layout/website-header';

export default function TestCarouselPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <WebsiteHeader />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-center">Test Carousel Banner</h1>
        <p className="text-center text-gray-600 mt-2">
          Carousel banner được hiển thị ở phía trên trong WebsiteHeader
        </p>
      </div>
    </div>
  );
}