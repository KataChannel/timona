'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/graphql/product.queries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

const PRODUCT_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: 'Nháp', variant: 'secondary' },
  ACTIVE: { label: 'Đang bán', variant: 'default' },
  INACTIVE: { label: 'Ngừng bán', variant: 'outline' },
  OUT_OF_STOCK: { label: 'Hết hàng', variant: 'destructive' },
  DISCONTINUED: { label: 'Ngừng kinh doanh', variant: 'destructive' },
};

const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  G: 'g',
  BUNDLE: 'bó',
  PIECE: 'củ',
  BAG: 'túi',
  BOX: 'hộp',
};

export function ProductCard({
  product,
  variant = 'default',
  onAddToCart,
  onToggleFavorite,
  className,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getDiscountBadge = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      const discountPercent = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
      return (
        <Badge variant="destructive" className="absolute top-2 right-2 z-10">
          -{discountPercent}%
        </Badge>
      );
    }
    return null;
  };

  const getFeatureBadges = () => {
    const badges = [];
    if (product.isNewArrival) {
      badges.push(
        <Badge key="new" variant="default" className="bg-blue-500">
          Mới
        </Badge>
      );
    }
    if (product.isBestSeller) {
      badges.push(
        <Badge key="bestseller" variant="default" className="bg-orange-500">
          Bán chạy
        </Badge>
      );
    }
    if (product.isOnSale) {
      badges.push(
        <Badge key="sale" variant="default" className="bg-green-500">
          Giảm giá
        </Badge>
      );
    }
    return badges;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(product);
  };

  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStock;

  if (variant === 'compact') {
    return (
      <Link href={`/website/sanpham/${product.slug}`}>
        <Card className={cn('hover:shadow-lg transition-shadow', className)}>
          <CardContent className="p-3">
            <div className="flex gap-3">
              <div className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={product.thumbnail || product.images?.[0]?.url || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.origin && `${product.origin} • `}
                  {UNIT_LABELS[product.unit] || product.unit}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/website/sanpham/${product.slug}`}>
        <Card
          className={cn(
            'group overflow-hidden hover:shadow-2xl transition-all duration-300',
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square overflow-hidden">
            {getDiscountBadge()}
            <img
              src={product.thumbnail || product.images?.[0]?.url || '/placeholder-product.png'}
              alt={product.name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-500',
                isHovered && 'scale-110'
              )}
            />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {getFeatureBadges()}
            </div>
            <div
              className={cn(
                'absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Button size="icon" variant="secondary" onClick={handleToggleFavorite}>
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-red-500 text-red-500')} />
              </Button>
              <Button size="icon" variant="secondary" asChild>
                <Link href={`/website/sanpham/${product.slug}`}>
                  <Eye className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            {product.category && (
              <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
            )}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
            {product.shortDesc && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {product.shortDesc}
              </p>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {product.origin && `${product.origin} • `}
                {UNIT_LABELS[product.unit] || product.unit}
              </span>
              {isLowStock && <Badge variant="outline" className="text-yellow-600">Sắp hết</Badge>}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              className="w-full"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                'Hết hàng'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/website/sanpham/${product.slug}`}>
      <Card
        className={cn('group hover:shadow-lg transition-shadow', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {getDiscountBadge()}
          <img
            src={product.thumbnail || product.images?.[0]?.url || '/placeholder-product.png'}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover transition-transform',
              isHovered && 'scale-105'
            )}
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {getFeatureBadges()}
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Hết hàng
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
          )}
          <h3 className="font-medium mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              / {UNIT_LABELS[product.unit] || product.unit}
            </span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through block mb-2">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{product.origin}</span>
            {isLowStock && <Badge variant="outline" className="text-yellow-600">Còn ít</Badge>}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            className="flex-1"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Mua
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleFavorite}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
