'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Settings, Trash2, X, Check } from 'lucide-react';
import { PageBlock, ProductCarouselBlockContent } from '@/types/page-builder';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS } from '@/graphql/product.queries';
import { ADD_TO_CART } from '@/graphql/ecommerce.queries';
import { useDynamicQuery } from '@/lib/graphql/dynamic-hooks';
import { ProductCarouselSettingsDialog } from './ProductCarouselSettingsDialog';
import { ProductImage } from '@/components/ui/product-image';
import { useCartOptional } from '@/contexts/CartContext';
import { useCartSession } from '@/hooks/useCartSession';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProductCarouselBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
}

interface Product {
  id: string;
  // Old schema (ext_sanphamhoadon)
  ten?: string;
  tensanpham?: string;
  gia?: number;
  dongia?: number;
  donvitinh?: string;
  hinhanh?: string;
  mota?: string;
  danhmuc?: string;
  noibat?: boolean;
  banchay?: boolean;
  // New schema (Product table)
  name?: string;
  ten2?: string;
  ma?: string;
  price?: number;
  dgia?: number;
  unit?: string;
  dvt?: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  shortDesc?: string;
  slug?: string;
  isFeatured?: boolean;
  isOnSale?: boolean;
  category?: {
    id: string;
    name?: string;
    ten?: string;
  };
}

export const ProductCarouselBlock: React.FC<ProductCarouselBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
}) => {
  const content = block.content as ProductCarouselBlockContent;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<ProductCarouselBlockContent>(content || {
    title: 'Sản phẩm nổi bật',
    filterType: 'all',
    itemsToShow: 10,
    showViewAllButton: true,
    viewAllLink: '/san-pham',
    autoplay: false,
    autoplayDelay: 3000,
    loop: true,
    showNavigation: true,
    responsive: {
      mobile: 2,
      tablet: 3,
      desktop: 5,
    },
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [imagePreview, setImagePreview] = useState<{ open: boolean; src: string; alt: string }>({
    open: false,
    src: '',
    alt: '',
  });
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  // Cart and Auth hooks - use optional hook to avoid errors when CartProvider is not available
  const cartContext = useCartOptional();
  const { sessionId } = useCartSession();
  const { user, isAuthenticated } = useAuth();
  
  // If cart is not available, we'll skip cart functionality
  const refetchCart = cartContext?.refetch || (() => {});

  // Add to cart mutation
  const [addToCartMutation] = useMutation(ADD_TO_CART, {
    onCompleted: (data) => {
      if (data.addToCart.success) {
        refetchCart();
      }
    },
  });

  // Determine data source table
  const dataSourceTable = editContent.dataSourceTable || 'ext_sanphamhoadon';
  
  // Fetch products based on data source
  // For new Product table, use GraphQL query
  const { 
    data: newProductsData, 
    loading: newProductsLoading 
  } = useQuery(GET_PRODUCTS, {
    variables: { 
      input: { 
        limit: editContent.itemsToShow || 8,
        page: 1 
      } 
    },
    skip: dataSourceTable !== 'Product',
    fetchPolicy: 'cache-first',
  });

  // For old ext_sanphamhoadon table, use dynamic query
  const { 
    data: oldProductsData, 
    loading: oldProductsLoading 
  } = useDynamicQuery('GET_ALL', dataSourceTable, {
    fetchPolicy: 'cache-first',
    skip: dataSourceTable === 'Product',
  });

  const loading = dataSourceTable === 'Product' ? newProductsLoading : oldProductsLoading;
  const productsData = dataSourceTable === 'Product' ? newProductsData : oldProductsData;

  // Extract products from response
  const rawProducts: Product[] = React.useMemo(() => {
    if (!productsData) return [];
    
    // For Product table (new schema)
    if (dataSourceTable === 'Product') {
      return productsData?.products?.items || [];
    }
    
    // For ext_sanphamhoadon table (old schema)
    if (dataSourceTable === 'ext_sanphamhoadon') {
      return productsData?.getext_sanphamhoadons || [];
    }
    
    // Generic fallback - try to find array in response
    const keys = Object.keys(productsData);
    const arrayKey = keys.find(key => Array.isArray(productsData[key]));
    return arrayKey ? productsData[arrayKey] : [];
  }, [productsData, dataSourceTable]);

  // Filter products based on settings
  const filteredProducts = React.useMemo(() => {
    let products = [...rawProducts];

    // Apply filter type
    switch (editContent.filterType) {
      case 'featured':
        products = products.filter(p => p.noibat === true || p.isFeatured === true);
        break;
      case 'bestseller':
        products = products.filter(p => p.banchay === true || p.isOnSale === true);
        break;
      case 'category':
        if (editContent.category) {
          products = products.filter(p => {
            // Old schema: danhmuc field
            if (p.danhmuc === editContent.category) return true;
            // New schema: category object
            if (p.category?.name === editContent.category || p.category?.ten === editContent.category) return true;
            if (p.category?.id === editContent.category) return true;
            return false;
          });
        }
        break;
      case 'custom':
        // Custom query would be handled differently
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Limit items
    return products.slice(0, editContent.itemsToShow || 8);
  }, [rawProducts, editContent.filterType, editContent.category, editContent.itemsToShow]);

  // Responsive items per view - 5 items trên desktop theo hình
  const getItemsPerView = () => {
    if (typeof window === 'undefined') return editContent.responsive?.desktop || 5;
    
    const width = window.innerWidth;
    if (width < 640) return editContent.responsive?.mobile || 2;
    if (width < 1024) return editContent.responsive?.tablet || 3;
    return editContent.responsive?.desktop || 5;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [editContent.responsive]);

  // Autoplay
  useEffect(() => {
    if (!editContent.autoplay || isEditing) return;

    const interval = setInterval(() => {
      handleNext();
    }, editContent.autoplayDelay || 3000);

    return () => clearInterval(interval);
  }, [editContent.autoplay, editContent.autoplayDelay, currentIndex, isEditing]);

  const maxIndex = Math.max(0, filteredProducts.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(prev => {
      if (prev <= 0) {
        return editContent.loop ? maxIndex : 0;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev >= maxIndex) {
        return editContent.loop ? 0 : maxIndex;
      }
      return prev + 1;
    });
  };

  const handleSave = () => {
    onUpdate(editContent);
    setIsEditing(false);
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getProductName = (product: Product) => {
    return product.name || product.ten || product.ten2 || product.tensanpham || 'Sản phẩm';
  };

  const getProductPrice = (product: Product) => {
    return product.price || product.dgia || product.gia || product.dongia || 0;
  };

  const getProductImage = (product: Product) => {
    return product.thumbnail || product.image || product.hinhanh || '';
  };

  const getProductUnit = (product: Product) => {
    return product.unit || product.dvt || product.donvitinh || '';
  };

  const getProductSlug = (product: Product) => {
    return product.slug || product.ma || product.id;
  };

  const getProductUrl = (product: Product) => {
    const baseUrl = '';
    const slug = getProductSlug(product);
    return `${baseUrl}/san-pham/${slug}`;
  };

  const handleImagePreview = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImagePreview({
      open: true,
      src: getProductImage(product),
      alt: getProductName(product),
    });
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If cart context is not available, show a message
    if (!cartContext) {
      toast.error('Giỏ hàng không khả dụng', {
        description: 'Vui lòng vào trang sản phẩm để thêm vào giỏ hàng',
      });
      return;
    }

    try {
      setAddingToCart(product.id);

      const input: any = {
        productId: product.id,
        quantity: 1,
      };

      // Add userId or sessionId
      if (isAuthenticated && user?.id) {
        input.userId = user.id;
      } else if (sessionId) {
        input.sessionId = sessionId;
      }

      const result = await addToCartMutation({
        variables: { input },
      });

      if (result.data?.addToCart?.success) {
        // Show success animation
        setAddedToCart(prev => new Set(prev).add(product.id));
        
        // Show toast notification
        toast.success('Đã thêm vào giỏ hàng', {
          description: `${getProductName(product)} - ${formatPrice(getProductPrice(product))}`,
          duration: 2000,
        });

        // Remove success animation after 2s
        setTimeout(() => {
          setAddedToCart(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
        }, 2000);
      } else {
        toast.error('Không thể thêm vào giỏ hàng', {
          description: result.data?.addToCart?.message || 'Vui lòng thử lại',
        });
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Lỗi khi thêm vào giỏ hàng', {
        description: error.message || 'Vui lòng thử lại sau',
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('[ProductCarousel] Debug Info:', {
      dataSourceTable,
      productsData,
      rawProducts: rawProducts.length,
      loading,
      editContent
    });
  }, [dataSourceTable, productsData, rawProducts, loading, editContent]);

  if (!isEditable) {
    // Frontend display mode
    return (
      <div className="product-carousel-block py-4 sm:py-6 md:py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header với Navigation */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {/* Title - Left */}
            <div className="inline-flex items-center bg-green-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 rounded-tr-full rounded-br-full shadow-lg">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-wide whitespace-nowrap">
                {editContent.title || 'SẢN PHẨM'}
              </h2>
            </div>

            {/* Navigation Arrows - Right */}
            {editContent.showNavigation && filteredProducts.length > itemsPerView && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 && !editContent.loop}
                  className="bg-white hover:bg-gray-100 rounded-full shadow-md border w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex && !editContent.loop}
                  className="bg-white hover:bg-gray-100 rounded-full shadow-md border w-8 h-8 sm:w-10 sm:h-10 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Không có sản phẩm nào</p>
              <p className="text-gray-500 text-sm mt-2">
                DataSource: {dataSourceTable} | Filter: {editContent.filterType}
              </p>
            </div>
          )}

          {/* Carousel */}
          {!loading && filteredProducts.length > 0 && (
            <div className="relative overflow-hidden">
              <div
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out gap-2 sm:gap-3 md:gap-4"
                style={{
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                }}
              >
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0"
                    style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * (16 / itemsPerView)}px)` }}
                  >
                    <Link href={getProductUrl(product)}>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        {/* Product Image với icon giỏ hàng */}
                        <div className="relative aspect-square bg-gray-100">
                          <ProductImage
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Icon giỏ hàng màu vàng/cam ở góc trên phải */}
                          <div className="absolute top-2 right-2">
                            <button
                              className={`rounded-full p-2 shadow-lg cursor-pointer transition-all transform ${
                                addedToCart.has(product.id)
                                  ? 'bg-green-500 scale-110'
                                  : 'bg-orange-400 hover:bg-orange-500 hover:scale-105'
                              } ${addingToCart === product.id ? 'animate-pulse' : ''}`}
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={addingToCart === product.id}
                              title={addedToCart.has(product.id) ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                            >
                              {addingToCart === product.id ? (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : addedToCart.has(product.id) ? (
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              ) : (
                                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3 sm:p-4">
                          {/* Product Name */}
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] text-sm sm:text-base hover:text-green-600 transition-colors">
                            {getProductName(product)}
                          </h3>
                          
                          {/* Price và Unit */}
                          <div className="flex items-baseline gap-1 mb-3">
                            <p className="text-lg sm:text-xl font-bold text-red-600">
                              {getProductPrice(product) ? `${Math.round(getProductPrice(product))}đ` : '0đ'}
                            </p>
                            {getProductUnit(product) && (
                              <p className="text-xs sm:text-sm text-gray-500">/{getProductUnit(product)}</p>
                            )}
                          </div>

                          {/* Button Mua Ngay màu đỏ */}
                          <button 
                            className={`w-full font-semibold py-2 px-4 rounded-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${
                              addedToCart.has(product.id)
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={addingToCart === product.id}
                          >
                            {addingToCart === product.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Đang thêm...</span>
                              </>
                            ) : addedToCart.has(product.id) ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Đã thêm</span>
                              </>
                            ) : (
                              'Mua Ngay'
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Button - Màu vàng/cam viền */}
          {!loading && filteredProducts.length > 0 && editContent.showViewAllButton && editContent.viewAllLink && (
            <div className="text-center mt-6 sm:mt-8">
              <Link href={editContent.viewAllLink}>
                <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 border-2 border-orange-400 text-orange-500 hover:bg-orange-50 rounded-md font-semibold transition-colors text-sm sm:text-base">
                  Xem Tất Cả
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </Link>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 text-gray-500">
              Đang tải sản phẩm...
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không có sản phẩm nào
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editor mode
  return (
    <div className="relative border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/20 group">
      {/* Control Bar */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="bg-white shadow-sm hover:bg-blue-50"
        >
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <ProductCarouselSettingsDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        settings={editContent}
        onSave={(newSettings) => {
          setEditContent(newSettings);
          onUpdate(newSettings);
        }}
      />

      {/* Preview */}
      <div className="pointer-events-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700">
            {editContent.title || 'Sản phẩm'} (Preview)
          </h2>
          {editContent.showNavigation && (
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded border">
          <p className="text-sm text-gray-600">
            📦 {filteredProducts.length} sản phẩm • 
            {editContent.filterType === 'all' && ' Tất cả'}
            {editContent.filterType === 'featured' && ' Nổi bật'}
            {editContent.filterType === 'bestseller' && ' Bán chạy'}
            {editContent.filterType === 'category' && ` Danh mục: ${editContent.category || 'Chưa chọn'}`}
          </p>
          
          {loading && <p className="text-sm text-gray-500 mt-2">Đang tải...</p>}
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreview.open} onOpenChange={(open) => setImagePreview({ ...imagePreview, open })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setImagePreview({ open: false, src: '', alt: '' })}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </button>
          
          <div className="relative w-full h-[70vh]">
            <ProductImage
              src={imagePreview.src}
              alt={imagePreview.alt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCarouselBlock;
