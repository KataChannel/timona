'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from '@/components/ui/toaster';
import { apolloClient } from '@/lib/apollo-client';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            {children}
          </CartProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
