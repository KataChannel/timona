'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * ProductImage Component - Mobile First
 * Xử lý hình ảnh sản phẩm với fallback khi link bị lỗi
 * Theo rules: Mobile First, Responsive, Vietnamese UI
 */
export function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  fallbackClassName = '',
  priority = false,
  sizes,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Kiểm tra src hợp lệ
  const isValidSrc = src && src.trim() !== '' && !src.includes('undefined');

  // Nếu không có src hoặc src không hợp lệ hoặc có lỗi → hiển thị fallback
  if (!isValidSrc || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${
          fill ? 'absolute inset-0' : ''
        } ${fallbackClassName}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-gray-400">Không có hình</p>
        </div>
      </div>
    );
  }

  return (
    <div className={fill ? 'absolute inset-0' : 'relative'}>
      {/* Loading skeleton */}
      {imageLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${
            fill ? '' : 'rounded-lg'
          }`}
        />
      )}

      {/* Next.js Image */}
      <Image
        src={src}
        alt={alt || 'Hình sản phẩm'}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={className}
        priority={priority}
        sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        quality={85}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          setImageLoading(false);
        }}
      />
    </div>
  );
}
