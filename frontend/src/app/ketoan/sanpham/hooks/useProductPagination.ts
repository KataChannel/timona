import { useMemo, useEffect } from 'react';
import { Product } from '../types';

interface UseProductPaginationProps {
  products: Product[];
  page: number;
  limit: number;
  setPage: (page: number) => void;
  dependencies?: any[];
}

interface UseProductPaginationResult {
  paginatedProducts: Product[];
  totalPages: number;
}

export const useProductPagination = ({
  products,
  page,
  limit,
  setPage,
  dependencies = [],
}: UseProductPaginationProps): UseProductPaginationResult => {
  // Reset page when dependencies change (e.g., filters, search)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return products.slice(start, end);
  }, [products, page, limit]);

  const totalPages = Math.ceil(products.length / limit);

  return { paginatedProducts, totalPages };
};
