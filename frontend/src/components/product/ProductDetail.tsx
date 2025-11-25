'use client';

import React from 'react';
import { Product, ProductVariant } from '@/graphql/product.queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Heart,
  Share2,
  Package,
  Truck,
  ShieldCheck,
  Star,
  Minus,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number, variant?: ProductVariant) => void;
  onToggleFavorite?: (product: Product) => void;
  className?: string;
}

const UNIT_LABELS: Record<string, string> = {
  KG: 'kg',
  G: 'g',
  BUNDLE: 'bó',
  PIECE: 'củ',
  BAG: 'túi',
  BOX: 'hộp',
};

export function ProductDetail({
  product,
  onAddToCart,
  onToggleFavorite,
  className,
}: ProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [selectedImage, setSelectedImage] = React.useState(
    product.thumbnail || product.images?.[0]?.url || '/placeholder-product.png'
  );
  const [isFavorite, setIsFavorite] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const currentPrice = selectedVariant?.price || product.price;
  const currentComparePrice = product.originalPrice;
  const currentStock = selectedVariant?.stock || product.stock;
  const currentUnit = product.unit;

  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= product.minStock;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity, selectedVariant);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(product);
  };

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.thumbnail
    ? [product.thumbnail]
    : ['/placeholder-product.png'];

  return (
    <div>
    <div className={cn('grid lg:grid-cols-2 gap-8', className)}>
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge className="absolute top-4 right-4 bg-red-500 text-white text-lg px-3 py-1">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                  selectedImage === img
                    ? 'border-primary'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          {product.category && (
            <p className="text-sm text-muted-foreground mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {product.isNewArrival && <Badge className="bg-blue-500">Mới</Badge>}
            {product.isBestSeller && <Badge className="bg-orange-500">Bán chạy</Badge>}
            {product.isOnSale && <Badge className="bg-green-500">Giảm giá</Badge>}
            {isLowStock && <Badge variant="outline" className="text-yellow-600">Sắp hết hàng</Badge>}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-lg text-muted-foreground">
              / {UNIT_LABELS[currentUnit] || currentUnit}
            </span>
          </div>
          {currentComparePrice && currentComparePrice > currentPrice && (
            <div className="flex items-center gap-2">
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(currentComparePrice)}
              </span>
              <span className="text-sm text-green-600 font-medium">
                Tiết kiệm {formatPrice(currentComparePrice - currentPrice)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {product.shortDesc && (
          <p className="text-lg text-muted-foreground">{product.shortDesc}</p>
        )}

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn phân loại:</label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                  className="min-w-[100px]"
                >
                  {variant.name}
                  <span className="ml-2 text-xs">
                    {formatPrice(variant.price)}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Số lượng:</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= currentStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStock} sản phẩm có sẵn
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              'Hết hàng'
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ - {formatPrice(currentPrice * quantity)}
              </>
            )}
          </Button>
          <Button size="lg" variant="outline" onClick={handleToggleFavorite}>
            <Heart className={cn('h-5 w-5', isFavorite && 'fill-red-500 text-red-500')} />
          </Button>
          <Button size="lg" variant="outline">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Product Info Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <Package className="h-6 w-6 mb-2 text-primary" />
              <p className="text-xs font-medium">Đóng gói cẩn thận</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <Truck className="h-6 w-6 mb-2 text-primary" />
              <p className="text-xs font-medium">Giao hàng nhanh</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4 text-center">
              <ShieldCheck className="h-6 w-6 mb-2 text-primary" />
              <p className="text-xs font-medium">Đảm bảo chất lượng</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm">
          {product.sku && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU:</span>
              <span className="font-medium">{product.sku}</span>
            </div>
          )}
          {product.origin && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Xuất xứ:</span>
              <span className="font-medium">{product.origin}</span>
            </div>
          )}
          {product.weight && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trọng lượng:</span>
              <span className="font-medium">{product.weight}g</span>
            </div>
          )}
        </div>

        <Separator />
      </div>

    </div>
        <div>   
           {/* Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Mô tả</TabsTrigger>
            <TabsTrigger value="specifications">Thông số</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <div className="prose max-w-none">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-muted-foreground">Chưa có mô tả chi tiết</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="mt-4">
            <div className="space-y-2">
              {product.attributes && typeof product.attributes === 'object' ? (
                Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Chưa có thông số kỹ thuật</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <div className="text-center py-8">
              <Star className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Chưa có đánh giá nào</p>
            </div>
          </TabsContent>
        </Tabs>
        </div>
        </div>
  );
}
