'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
}

const SIZE_CLASSES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function RatingStars({ 
  rating, 
  maxRating = 5,
  size = 'md',
  showNumber = false,
  reviewCount
}: RatingStarsProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= maxRating; i++) {
    if (i <= fullStars) {
      // Full star
      stars.push(
        <Star 
          key={i} 
          className={`${SIZE_CLASSES[size]} text-yellow-400 fill-yellow-400`}
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Half star
      stars.push(
        <div key={i} className="relative">
          <Star className={`${SIZE_CLASSES[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${SIZE_CLASSES[size]} text-yellow-400 fill-yellow-400`} />
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <Star 
          key={i} 
          className={`${SIZE_CLASSES[size]} text-gray-300`}
        />
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500 ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
