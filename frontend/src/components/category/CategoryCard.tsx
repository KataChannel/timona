'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/graphql/category.queries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact' | 'icon';
  showProductCount?: boolean;
  className?: string;
}

export function CategoryCard({
  category,
  variant = 'default',
  showProductCount = true,
  className,
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  if (variant === 'compact') {
    return (
      <Link href={`/shop/${category.slug}`}>
        <Card className={cn('hover:shadow-md transition-shadow', className)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  {showProductCount && category.productCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {category.productCount} sản phẩm
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'icon') {
    return (
      <Link href={`/shop/${category.slug}`}>
        <div
          className={cn(
            'flex flex-col items-center text-center p-4 rounded-lg hover:bg-accent transition-colors',
            className
          )}
        >
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-16 h-16 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Package className="h-8 w-8 text-primary" />
            </div>
          )}
          <h4 className="font-medium text-sm">{category.name}</h4>
          {showProductCount && category.productCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {category.productCount}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/shop/${category.slug}`}>
      <Card
        className={cn('group overflow-hidden hover:shadow-lg transition-shadow', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-300',
                isHovered && 'scale-110'
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-20 w-20 text-primary/40" />
            </div>
          )}
          {!category.isActive && (
            <Badge className="absolute top-2 right-2" variant="outline">
              Không hoạt động
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {category.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            {showProductCount && category.productCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                {category.productCount} sản phẩm
              </span>
            )}
            <ChevronRight
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                isHovered && 'translate-x-1'
              )}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
