'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CART } from '@/graphql/ecommerce.queries';
import { useCartSession } from '@/hooks/useCartSession';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextType {
  cart: any;
  loading: boolean;
  error: any;
  itemCount: number;
  total: number;
  refetch: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { sessionId, isInitialized } = useCartSession();
  const { user, isAuthenticated } = useAuth();

  // Build variables based on authentication state
  const variables = React.useMemo(() => {
    if (isAuthenticated && user?.id) {
      return { userId: user.id };
    } else if (sessionId) {
      return { sessionId };
    }
    return undefined;
  }, [isAuthenticated, user?.id, sessionId]);

  const { data, loading, error, refetch } = useQuery(GET_CART, {
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !isInitialized || !variables, // Wait for session to initialize and have valid variables
    notifyOnNetworkStatusChange: true, // Important for refetch updates
  });

  const cart = data?.cart || data?.getCart;
  // Use backend's itemCount if available, fallback to items.length
  // Handle both null cart and empty cart
  const itemCount = cart?.itemCount ?? cart?.items?.length ?? 0;
  const total = cart?.total ?? 0;

  const value: CartContextType = {
    cart: cart || null,
    loading,
    error,
    itemCount,
    total,
    refetch,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Optional hook that returns null if provider is not available
export function useCartOptional() {
  const context = useContext(CartContext);
  return context;
}
