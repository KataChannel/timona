'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GET_PRODUCT_BY_SLUG, 
  ADD_TO_CART, 
  GET_CART,
  GET_PRODUCT_CATEGORIES,
} from '@/graphql/ecommerce.queries';
import { ProductImage } from '@/components/ui/product-image';
import { ProductReviews } from '@/components/ecommerce/ProductReviews';
import { QuantitySelector } from '@/components/ecommerce/QuantitySelector';
import { PriceDisplay } from '@/components/ecommerce/PriceDisplay';
import { AddToCartButton } from '@/components/ecommerce/AddToCartButton';
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Fetch product
  const { data, loading, error } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  // Fetch categories for sidebar
  const { data: categoriesData } = useQuery(GET_PRODUCT_CATEGORIES, {
    variables: {
      input: {
        page: 1,
        limit: 100
      }
    }
  });

  // Add to cart mutation - now handled by AddToCartButton component
  // const [addToCart, { loading: adding }] = useMutation(ADD_TO_CART, {
  //   refetchQueries: [{ query: GET_CART }],
  //   onCompleted: (data) => {
  //     if (data.addToCart.success) {
  //       toast({
  //         title: 'Thành công',
  //         description: 'Đã thêm vào giỏ hàng!',
  //         type: 'success',
  //       });
  //     } else {
  //       toast({
  //         title: 'Lỗi',
  //         description: data.addToCart.message || 'Có lỗi xảy ra',
  //         type: 'error',
  //         variant: 'destructive',
  //       });
  //     }
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Lỗi',
  //       description: 'Không thể thêm vào giỏ hàng: ' + error.message,
  //       type: 'error',
  //       variant: 'destructive',
  //     });
  //   },
  // });

  // Wishlist mutations (disabled - backend not implemented)
  // const [addToWishlist, { loading: addingToWishlist }] = useMutation(ADD_TO_WISHLIST, {
  //   onCompleted: () => {
  //     setIsInWishlist(true);
  //     toast({
  //       title: 'Đã thêm vào yêu thích',
  //       description: 'Sản phẩm đã được lưu vào danh sách yêu thích',
  //       type: 'success',
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Lỗi',
  //       description: error.message,
  //       type: 'error',
  //       variant: 'destructive',
  //     });
  //   },
  // });

  // const [removeFromWishlist, { loading: removingFromWishlist }] = useMutation(REMOVE_FROM_WISHLIST, {
  //   onCompleted: () => {
  //     setIsInWishlist(false);
  //     toast({
  //       title: 'Đã xóa khỏi yêu thích',
  //       description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích',
  //       type: 'success',
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: 'Lỗi',
  //       description: error.message,
  //       type: 'error',
  //       variant: 'destructive',
  //     });
  //   },
  // });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data?.productBySlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <h1 className="text-2xl font-bold mb-2">
              Không tìm thấy sản phẩm
            </h1>
            <Button
              variant="link"
              onClick={() => router.push('/san-pham')}
            >
              ← Quay lại danh sách sản phẩm
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = data.productBySlug;
  const categories = categoriesData?.categories?.items || [];
  
  // Sử dụng images từ database, với thumbnail làm ảnh đầu tiên
  const productImages = product.images && product.images.length > 0 
    ? [...product.images].sort((a: any, b: any) => a.order - b.order).map((img: any) => img.url)
    : [];
  const images = product.thumbnail 
    ? [product.thumbnail, ...productImages.filter((img: string) => img !== product.thumbnail)]
    : productImages;
  
  const currentVariant = selectedVariant
    ? product.variants?.find((v: any) => v.id === selectedVariant)
    : null;
  const effectivePrice = currentVariant?.price || product.price;
  const effectiveStock = currentVariant?.stock ?? product.stock;
  
  // Tính % giảm giá
  const discountPercent = product.discountPercentage || 
    (product.originalPrice && product.price < product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Category sidebar component
  const CategorySidebar = () => (
    <div className="space-y-0">
      {/* Green Header */}
      <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-base uppercase">DANH MỤC SẢN PHẨM</h2>
      </div>

      {/* Categories List */}
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        <div className="divide-y">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/san-pham?category=${category.id}`}
              className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-green-600"
            >
              <span className="text-lg">
                {category.icon || '📂'}
              </span>
              <span className="text-sm">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Additional Section */}
      <div className="mt-6 bg-green-600 text-white px-4 py-3 rounded-t-lg">
        <h2 className="font-bold text-sm uppercase">Sản Phẩm Giá Rẻ</h2>
      </div>
      <div className="border border-t-0 rounded-b-lg p-4 bg-white">
        <div className="text-center text-sm text-gray-500">
          Sản phẩm giá rẻ
        </div>
      </div>
    </div>
  );

  // handleAddToCart - now handled by AddToCartButton component
  // const handleAddToCart = async () => {
  //   if (effectiveStock === 0) {
  //     toast({
  //       title: 'Không thể thêm',
  //       description: 'Sản phẩm đã hết hàng',
  //       type: 'error',
  //       variant: 'destructive',
  //     });
  //     return;
  //   }

  //   if (quantity > effectiveStock) {
  //     toast({
  //       title: 'Số lượng không hợp lệ',
  //       description: `Chỉ còn ${effectiveStock} sản phẩm`,
  //       type: 'error',
  //       variant: 'destructive',
  //     });
  //     return;
  //   }

  //   try {
  //     await addToCart({
  //       variables: {
  //         input: {
  //           productId: product.id,
  //           variantId: selectedVariant,
  //           quantity,
  //         },
  //       },
  //     });
  //   } catch (err) {
  //     // Error handled by onError
  //   }
  // };

  // const handleToggleWishlist = async () => {
  //   try {
  //     if (isInWishlist) {
  //       await removeFromWishlist({
  //         variables: { productId: product.id },
  //       });
  //     } else {
  //       await addToWishlist({
  //         variables: { productId: product.id },
  //       });
  //     }
  //   } catch (err) {
  //     // Error handled by onError
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Detail */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-4">
              <CategorySidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted">
                  {images.length > 0 ? (
                    <ProductImage
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    {discountPercent > 0 && (
                      <Badge variant="destructive" className="text-base font-bold">
                        -{discountPercent}%
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {product.isBestSeller && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600">Bán chạy</Badge>
                    )}
                    {product.isNewArrival && (
                      <Badge className="bg-green-500 hover:bg-green-600">Mới</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ProductImage src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-800">{product.name}</h1>

              {/* Price - Red Color */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-bold text-red-600">
                    {formatPrice(effectivePrice)}
                  </span>
                </div>
                {product.unit && (
                  <p className="text-sm text-gray-600 mt-1">
                    Khối Lượng : {product.unit}
                  </p>
                )}
              </div>
            </div>



            {/* Quantity */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-transparent py-2 text-base font-medium border-x"
                    min="1"
                    max={effectiveStock}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                    disabled={quantity >= effectiveStock}
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button - Red */}
            <Button
              onClick={() => {
                // Handle add to cart
              }}
              disabled={effectiveStock === 0}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12 text-base"
            >
              Thêm Vào Giỏ Hàng
            </Button>

            {/* Promotional Badges */}
            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-red-200 rounded px-3 py-2 text-center bg-white">
                <div className="text-red-600 font-semibold text-sm flex items-center justify-center gap-1">
                  <span className="text-lg">✓</span>
                  <span>GIÁ RẺ<br/>HƠN CHỢ</span>
                </div>
              </div>
              <div className="border-2 border-red-200 rounded px-3 py-2 text-center bg-white">
                <div className="text-red-600 font-semibold text-sm flex items-center justify-center gap-1">
                  <span className="text-lg">✓</span>
                  <span>CHUẨN<br/>VIETGAP</span>
                </div>
              </div>
              <div className="border-2 border-red-200 rounded px-3 py-2 text-center bg-white">
                <div className="text-red-600 font-semibold text-sm flex items-center justify-center gap-1">
                  <span className="text-lg">✓</span>
                  <span>100% QUA<br/>SỔ CHẾ</span>
                </div>
              </div>
              <div className="border-2 border-red-200 rounded px-3 py-2 text-center bg-white">
                <div className="text-red-600 font-semibold text-sm flex items-center justify-center gap-1">
                  <span className="text-lg">✓</span>
                  <span>FREESHIP<br/>#300K</span>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Tabs */}
        <Card className="mt-6 sm:mt-8">
          <Tabs defaultValue="chi-tiet" className="w-full">
            <CardContent className="p-0">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="chi-tiet"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-6 py-3"
                >
                  Chi Tiết
                </TabsTrigger>
                <TabsTrigger 
                  value="danh-gia"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-6 py-3"
                >
                  Đánh Giá Và Xếp Hạng
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chi-tiet" className="p-6">
                <div className="prose prose-sm max-w-none">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="text-muted-foreground">Chưa có mô tả chi tiết</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="danh-gia" className="p-6">
                <ProductReviews productId={product.id} canReview={true} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
