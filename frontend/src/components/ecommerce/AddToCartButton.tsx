'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ADD_TO_CART, GET_CART } from '@/graphql/ecommerce.queries';
import { cn } from '@/lib/utils';
import { useCartSession } from '@/hooks/useCartSession';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionId as getSessionIdFromLib } from '@/lib/session';

interface AddToCartButtonProps {
  productId: string;
  productName?: string;
  quantity?: number;
  variantId?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  productName = 'Sản phẩm',
  quantity = 1,
  variantId,
  disabled = false,
  className,
  size = 'md',
  showIcon = true,
  fullWidth = false,
  children,
}: AddToCartButtonProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  // Use optimized cart session hook
  const { sessionId } = useCartSession();
  const { isAuthenticated } = useAuth();

  const [addToCart] = useMutation(ADD_TO_CART, {
    // Use refetchQueries to get complete cart data from server
    // This avoids cache write issues with missing fields
    refetchQueries: [{ 
      query: GET_CART,
      variables: { sessionId: getSessionIdFromLib() }, // Always get fresh sessionId
    }],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      if (data.addToCart.success) {
        // Animation success
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);

        // Toast notification
        toast({
          type: 'success',
          title: '✅ Đã thêm vào giỏ hàng!',
          description: `${productName} đã được thêm vào giỏ hàng của bạn`,
        });
      } else {
        toast({
          type: 'error',
          title: '❌ Lỗi',
          description: data.addToCart.message || 'Không thể thêm vào giỏ hàng',
          variant: 'destructive',
        });
      }
      setIsAdding(false);
    },
    onError: (error) => {
      console.error('[AddToCart] Error:', error);
      toast({
        type: 'error',
        title: '❌ Lỗi',
        description: error.message || 'Không thể kết nối đến server',
        variant: 'destructive',
      });
      setIsAdding(false);
    },
  });

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (disabled || isAdding || justAdded) return;

    setIsAdding(true);

    try {
      // IMPORTANT: Always get fresh sessionId from localStorage
      // Don't rely on state which might be stale or empty string
      const effectiveSessionId = getSessionIdFromLib();
      
      await addToCart({
        variables: {
          input: {
            productId,
            variantId,
            quantity,
            // ALWAYS send sessionId - backend will use userId from context if authenticated
            // This ensures guest carts work and provides fallback for auth users
            sessionId: effectiveSessionId,
          },
        },
      });
    } catch (err) {
      console.error('[AddToCart] Mutation error:', err);
      setIsAdding(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding || justAdded}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        fullWidth && 'w-full',
        justAdded && 'bg-green-600 hover:bg-green-700',
        isAdding && 'scale-95',
        sizeClasses[size],
        className
      )}
    >
      {/* Success overlay animation */}
      {justAdded && (
        <span className="absolute inset-0 bg-green-500 animate-pulse" />
      )}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {showIcon && (
          <>
            {justAdded ? (
              <Check className={cn(iconSizes[size], 'animate-bounce')} />
            ) : (
              <ShoppingCart
                className={cn(
                  iconSizes[size],
                  isAdding && 'animate-bounce'
                )}
              />
            )}
          </>
        )}
        
        {children ? (
          children
        ) : (
          <span>
            {justAdded
              ? 'Đã thêm ✓'
              : isAdding
              ? 'Đang thêm...'
              : 'Thêm vào giỏ'}
          </span>
        )}
      </span>

      {/* Loading ripple effect */}
      {isAdding && (
        <span className="absolute inset-0">
          <span className="absolute inset-0 bg-white/20 rounded-full scale-0 animate-ping" />
        </span>
      )}
    </Button>
  );
}
