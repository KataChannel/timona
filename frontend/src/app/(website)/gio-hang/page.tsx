'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  GET_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  CLEAR_CART,
} from '@/graphql/ecommerce.queries';
import { Trash2, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { QuantitySelector } from '@/components/ecommerce/QuantitySelector';
import { PriceDisplay } from '@/components/ecommerce/PriceDisplay';
import { toast } from 'sonner';
import { getRemainingForFreeShipping, isFreeShippingEligible } from '@/lib/ecommerce-utils';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartSession } from '@/hooks/useCartSession';
import { getSessionId as getSessionIdFromLib } from '@/lib/session';

export default function CartPage() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState('');
  const { isAuthenticated } = useAuth();
  const { sessionId, isInitialized } = useCartSession();

  // Build query variables - always include sessionId for fallback
  const getQueryVariables = () => {
    // Always get fresh sessionId from localStorage to avoid stale state
    const freshSessionId = getSessionIdFromLib();
    return { sessionId: freshSessionId };
  };

  // Fetch cart - always get fresh data
  const { data, loading, error, refetch } = useQuery(GET_CART, {
    variables: getQueryVariables(),
    skip: !isInitialized,
    fetchPolicy: 'network-only', // Always fetch fresh cart data
    notifyOnNetworkStatusChange: true,
  });

  // Mutations
  const [updateCartItem] = useMutation(UPDATE_CART_ITEM, {
    refetchQueries: [{ 
      query: GET_CART,
      variables: getQueryVariables(),
    }],
    awaitRefetchQueries: true,
    onError: (error) => toast.error('Cập nhật thất bại: ' + error.message),
  });

  const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ 
      query: GET_CART,
      variables: getQueryVariables(),
    }],
    awaitRefetchQueries: true,
    onCompleted: () => toast.success('Sản phẩm đã được xóa khỏi giỏ hàng'),
    onError: (error) => toast.error('Xóa thất bại: ' + error.message),
  });

  const [clearCart] = useMutation(CLEAR_CART, {
    refetchQueries: [{ 
      query: GET_CART,
      variables: getQueryVariables(),
    }],
    awaitRefetchQueries: true,
    onCompleted: () => toast.success('Đã xóa toàn bộ giỏ hàng'),
    onError: (error) => toast.error('Xóa thất bại: ' + error.message),
  });

  const cart = data?.cart || data?.getCart;
  const items = cart?.items || [];

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      // IMPORTANT: Always get fresh sessionId from localStorage
      const effectiveSessionId = getSessionIdFromLib();
      
      await updateCartItem({
        variables: { 
          input: {
            itemId, 
            quantity: newQuantity,
          },
          // ALWAYS send sessionId - backend will use userId from context if authenticated
          sessionId: effectiveSessionId,
        },
      });
    } catch (err) {
      // Error handled by onError
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      // IMPORTANT: Always get fresh sessionId from localStorage
      const effectiveSessionId = getSessionIdFromLib();
      
      await removeFromCart({
        variables: { 
          input: {
            itemId,
          },
          // ALWAYS send sessionId - backend will use userId from context if authenticated
          sessionId: effectiveSessionId,
        },
      });
    } catch (err) {
      // Error handled by onError
    }
  };

  const handleClearCart = async () => {
    try {
      // IMPORTANT: Always get fresh sessionId from localStorage
      const effectiveSessionId = getSessionIdFromLib();
      
      await clearCart({
        variables: {
          // ALWAYS send sessionId - backend will use userId from context if authenticated
          sessionId: effectiveSessionId,
        },
      });
    } catch (err) {
      // Error handled by onError
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-12 pb-12 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Có lỗi xảy ra</h1>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button asChild>
              <Link href="/san-pham">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            <p className="text-sm text-gray-600 mt-1">
              {items.length > 0
                ? `${items.length} sản phẩm`
                : 'Giỏ hàng trống'}
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/san-pham">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        /* Empty Cart */
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Button asChild size="lg">
              <Link href="/san-pham">Khám phá sản phẩm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear All Button */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tất cả
              </Button>
            </div>

            {/* Items List */}
            {items.map((item: any) => {
              const productStock = item.variant?.stock || item.product?.stock || 999;
              const productImage = item.product?.thumbnail || item.product?.featuredImage || item.product?.thumbnailUrl;

              return (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/san-pham/${item.product?.slug}`}
                        className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                      >
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={item.product?.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-10 h-10 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/san-pham/${item.product?.slug}`}
                          className="font-semibold text-gray-900 hover:text-primary line-clamp-2 block"
                        >
                          {item.product?.name || 'Sản phẩm'}
                        </Link>

                        {item.variant && (
                          <p className="text-sm text-gray-600 mt-1">
                            Phân loại: {item.variant.name}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                          {/* Price */}
                          <div className="space-y-1">
                            <PriceDisplay price={item.price} size="md" />
                            <div className="text-xs text-gray-500">
                              Tổng: <PriceDisplay price={item.price * item.quantity} size="sm" showCurrency={false} /> ₫
                            </div>
                          </div>

                          {/* Quantity & Remove */}
                          <div className="flex items-center gap-3">
                            <QuantitySelector
                              value={item.quantity}
                              onChange={(newQty) => handleUpdateQuantity(item.id, newQty)}
                              max={productStock}
                              size="sm"
                            />

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {productStock < 10 && (
                          <p className="text-xs text-amber-600 mt-2">
                            Chỉ còn {productStock} sản phẩm
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary - Sticky on desktop */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4">
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Tóm tắt đơn hàng
                </h2>

                <Separator />

                {/* Free Shipping Progress */}
                {!isFreeShippingEligible(cart?.total || 0) && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-green-700">
                            Mua thêm để được miễn phí vận chuyển!
                          </span>
                        </div>
                        <Progress 
                          value={((cart?.total || 0) / 500000) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-green-600">
                          Còn <PriceDisplay price={getRemainingForFreeShipping(cart?.total || 0)} size="sm" showCurrency={false} /> ₫ nữa để được miễn phí ship
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {isFreeShippingEligible(cart?.total || 0) && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-sm text-green-700 font-medium">
                      🎉 Bạn đã được miễn phí vận chuyển!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính ({items.length} sản phẩm)</span>
                    <PriceDisplay price={cart?.subtotal || 0} size="sm" />
                  </div>

                  {cart?.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Giảm giá</span>
                      <span className="text-green-600 font-medium">
                        -<PriceDisplay price={cart.discount} size="sm" showCurrency={false} /> ₫
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-xs text-gray-500">Tính khi thanh toán</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <PriceDisplay price={cart?.total || 0} size="lg" className="font-bold text-primary" />
                </div>

                {/* Coupon Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mã giảm giá</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nhập mã..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Tag className="h-4 w-4 mr-1" />
                      Áp dụng
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Checkout Button */}
                <Button
                  onClick={() => router.push('/thanh-toan')}
                  className="w-full"
                  size="lg"
                >
                  Tiến hành thanh toán
                </Button>

                {/* Additional Info */}
                <div className="pt-4 space-y-2 text-xs text-gray-600">
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Bảo hành chính hãng</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
