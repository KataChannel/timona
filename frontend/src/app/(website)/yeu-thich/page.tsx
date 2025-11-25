'use client';

import { Suspense, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EcommerceNavigation } from '@/components/ecommerce/EcommerceNavigation';
import { PriceDisplay } from '@/components/ecommerce/PriceDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ADD_TO_CART, GET_CART } from '@/graphql/ecommerce.queries';
import { getSessionId } from '@/lib/session';
import { useAuth } from '@/contexts/AuthContext';

const GET_WISHLIST = gql`
  query GetWishlist {
    wishlist {
      id
      items {
        id
        product {
          id
          name
          slug
          price
          salePrice
          thumbnailUrl
          stock
          inStock
        }
        addedAt
      }
    }
  }
`;

const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($productId: ID!) {
    removeFromWishlist(productId: $productId) {
      success
      message
    }
  }
`;

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    thumbnailUrl?: string;
    stock: number;
    inStock: boolean;
  };
  addedAt: string;
}

function WishlistContent() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const { isAuthenticated } = useAuth();

  // Get or create session ID on mount
  useEffect(() => {
    const id = getSessionId();
    if (id) {
      setSessionId(id);
    }
  }, []);
  
  const { data, loading, error, refetch } = useQuery<{
    wishlist: { id: string; items: WishlistItem[] };
  }>(GET_WISHLIST, {
    fetchPolicy: 'cache-and-network',
  });

  const [removeFromWishlist, { loading: removing }] = useMutation(
    REMOVE_FROM_WISHLIST,
    {
      onCompleted: () => {
        toast.success('Sản phẩm đã được xóa khỏi danh sách yêu thích');
        refetch();
      },
      onError: () => {
        toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
      },
    }
  );

  const [addToCart, { loading: addingToCart }] = useMutation(ADD_TO_CART, {
    refetchQueries: [{ 
      query: GET_CART,
      variables: {
        sessionId: getSessionId(), // Always get fresh sessionId
      },
    }],
    onCompleted: () => {
      toast.success('Sản phẩm đã được thêm vào giỏ hàng');
    },
    onError: () => {
      toast.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    },
  });

  const handleRemove = async (productId: string) => {
    await removeFromWishlist({ variables: { productId } });
  };

  const handleAddToCart = async (productId: string) => {
    // IMPORTANT: Always get fresh sessionId from localStorage
    const effectiveSessionId = getSessionId();
    
    await addToCart({ 
      variables: { 
        input: {
          productId, 
          quantity: 1,
          // ALWAYS send sessionId - backend will use userId from context if authenticated
          sessionId: effectiveSessionId,
        }
      } 
    });
  };

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Không thể tải danh sách yêu thích. Vui lòng thử lại sau.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = data?.wishlist?.items || [];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <EcommerceNavigation />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              Sản phẩm yêu thích
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {items.length > 0
                ? `Bạn có ${items.length} sản phẩm trong danh sách yêu thích`
                : 'Danh sách yêu thích của bạn đang trống'}
            </p>
          </div>

      {/* Loading State */}
      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có sản phẩm yêu thích
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu thêm sản phẩm yêu thích để dễ dàng theo dõi và mua sắm sau
            </p>
            <Button asChild>
              <Link href="/san-pham">Khám phá sản phẩm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => {
            const finalPrice = item.product.salePrice || item.product.price;
            const hasDiscount = item.product.salePrice && item.product.salePrice < item.product.price;

            return (
              <Card
                key={item.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  {/* Product Image */}
                  <Link
                    href={`/san-pham/${item.product.slug}`}
                    className="block relative mb-4 overflow-hidden rounded-lg bg-gray-100"
                  >
                    <div className="aspect-square relative">
                      {item.product.thumbnailUrl ? (
                        <img
                          src={item.product.thumbnailUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                      
                      {/* Stock Badge */}
                      {!item.product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <Link
                      href={`/san-pham/${item.product.slug}`}
                      className="block"
                    >
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors min-h-[40px]">
                        {item.product.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <PriceDisplay
                      price={finalPrice}
                      originalPrice={hasDiscount ? item.product.price : undefined}
                      size="md"
                    />

                    {/* Stock Info */}
                    {item.product.inStock && item.product.stock < 10 && (
                      <p className="text-xs text-amber-600">
                        Chỉ còn {item.product.stock} sản phẩm
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!item.product.inStock || addingToCart}
                        onClick={() => handleAddToCart(item.product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                        Thêm vào giỏ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={removing}
                        onClick={() => handleRemove(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Continue Shopping */}
      {items.length > 0 && (
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/san-pham">
              <Package className="h-5 w-5 mr-2" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <WishlistContent />
    </Suspense>
  );
}
