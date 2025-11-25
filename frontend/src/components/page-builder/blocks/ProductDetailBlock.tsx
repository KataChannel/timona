/**
 * Product Detail Block
 * Displays detailed product information
 * Fetches product by slug from URL or content config
 */

'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Product } from '@/graphql/product.queries';
import { PRODUCT_FULL_FRAGMENT } from '@/graphql/product.queries';
import { PageBlock } from '@/types/page-builder';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatPrice, calculateDiscount } from '@/lib/format-utils';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ShoppingCart, Star, Truck, Shield, RefreshCw } from 'lucide-react';

// Query for single product
const GET_PRODUCT_BY_SLUG = gql`
  ${PRODUCT_FULL_FRAGMENT}
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      ...ProductFullFields
    }
  }
`;

export interface ProductDetailBlockContent {
  productSlug?: string; // If not provided, get from URL
  showGallery?: boolean;
  showDescription?: boolean;
  showSpecs?: boolean;
  showReviews?: boolean;
  showRelated?: boolean;
  layout?: 'default' | 'wide' | 'sidebar';
  style?: any;
}

export interface ProductDetailBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
}

export function ProductDetailBlock({ block, isEditable = true, onUpdate, onDelete }: ProductDetailBlockProps) {
  const content = (block.content || {}) as ProductDetailBlockContent;
  const {
    productSlug: configSlug,
    showGallery = true,
    showDescription = true,
    showSpecs = true,
    showReviews = false,
    showRelated = false,
    layout = 'default',
  } = content;

  // In edit mode, only use configSlug (don't use URL slug)
  // In view mode, use configSlug first, fallback to URL slug
  const params = useParams();
  const urlSlug = params?.slug as string;
  const productSlug = isEditable ? configSlug : (configSlug || urlSlug);

  const { data, loading, error } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug: productSlug },
    skip: isEditable || !productSlug,
  });

  const product: Product | null = data?.productBySlug || null;

  // Edit mode placeholder
  if (isEditable) {
    return (
      <div className="p-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Product Detail Block</h3>
          {productSlug ? (
            <p className="text-sm text-gray-600 mb-4">
              Hiển thị chi tiết sản phẩm: <strong>{productSlug}</strong>
            </p>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-orange-600 mb-2">
                ⚠️ Chưa cấu hình product slug
              </p>
              <p className="text-xs text-gray-500">
                Vui lòng chọn block này và nhập product slug trong panel bên phải
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-center text-xs text-gray-500">
            {showGallery && <Badge variant="secondary">Gallery</Badge>}
            {showDescription && <Badge variant="secondary">Description</Badge>}
            {showSpecs && <Badge variant="secondary">Specs</Badge>}
            {showReviews && <Badge variant="secondary">Reviews</Badge>}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Lỗi tải sản phẩm: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Not found
  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-center">
              Không tìm thấy sản phẩm {productSlug && `"${productSlug}"`}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discount = product.discountPercentage || 0;
  const inStock = product.stock > 0;

  return (
    <div className="container mx-auto py-8" style={content.style}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Images */}
        {showGallery && (
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewArrival && (
                  <Badge className="bg-green-500">Hàng mới</Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-blue-500">Nổi bật</Badge>
                )}
                {discount > 0 && (
                  <Badge className="bg-red-500 text-lg">-{discount}%</Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 ring-primary">
                    <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Category */}
          {product.category && (
            <div className="text-sm text-gray-600">
              {product.category.name}
            </div>
          )}

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.shortDesc && (
              <p className="text-gray-600">{product.shortDesc}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-600">(0 đánh giá)</span>
          </div>

          <Separator />

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-sm text-green-600">
                Bạn tiết kiệm được {formatPrice(product.originalPrice! - product.price)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {inStock ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Còn hàng ({product.stock} {product.unit})
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Hết hàng
              </Badge>
            )}
          </div>

          <Separator />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <p className="font-semibold">Chọn loại:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <Button
                    key={variant.id}
                    variant={index === 0 ? 'default' : 'outline'}
                    size="sm"
                  >
                    {variant.name} - {formatPrice(variant.price)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" disabled={!inStock}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <Button size="lg" variant="outline">
              Mua ngay
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-gray-400" />
              <span>Giao hàng miễn phí cho đơn từ 200.000đ</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-gray-400" />
              <span>Đảm bảo chất lượng sản phẩm</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              <span>Đổi trả trong 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs Tabs */}
      {(showDescription || showSpecs) && (
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList>
              {showDescription && <TabsTrigger value="description">Mô tả</TabsTrigger>}
              {showSpecs && <TabsTrigger value="specs">Thông số</TabsTrigger>}
              {showReviews && <TabsTrigger value="reviews">Đánh giá</TabsTrigger>}
            </TabsList>

            {showDescription && (
              <TabsContent value="description" className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả' }} />
                {product.origin && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <p><strong>Xuất xứ:</strong> {product.origin}</p>
                  </div>
                )}
              </TabsContent>
            )}

            {showSpecs && (
              <TabsContent value="specs" className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">SKU</p>
                    <p className="font-semibold">{product.sku}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Đơn vị</p>
                    <p className="font-semibold">{product.unit}</p>
                  </div>
                  {product.weight && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Trọng lượng</p>
                      <p className="font-semibold">{product.weight} kg</p>
                    </div>
                  )}
                  {product.origin && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Xuất xứ</p>
                      <p className="font-semibold">{product.origin}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {showReviews && (
              <TabsContent value="reviews">
                <p className="text-gray-600 text-center py-8">
                  Chưa có đánh giá nào cho sản phẩm này
                </p>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
}

// Skeleton Loader
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
