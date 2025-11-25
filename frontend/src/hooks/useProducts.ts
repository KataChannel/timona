import { useQuery, useMutation, ApolloError } from '@apollo/client';
import {
  GET_PRODUCTS,
  GET_PRODUCT,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_CATEGORY,
  GET_FEATURED_PRODUCTS,
  SEARCH_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT_STOCK,
  ADD_PRODUCT_IMAGE,
  DELETE_PRODUCT_IMAGE,
  ADD_PRODUCT_VARIANT,
  UPDATE_PRODUCT_VARIANT,
  DELETE_PRODUCT_VARIANT,
  Product,
  PaginatedProducts,
  GetProductsInput,
  CreateProductInput,
  UpdateProductInput,
  CreateProductImageInput,
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from '../graphql/product.queries';

// ============================================================================
// QUERY HOOKS
// ============================================================================

export function useProducts(input?: GetProductsInput) {
  const { data, loading, error, refetch } = useQuery<{
    products: PaginatedProducts;
  }>(GET_PRODUCTS, {
    variables: { input },
  });

  return {
    products: data?.products.items || [],
    pagination: {
      total: data?.products.total || 0,
      page: data?.products.page || 1,
      limit: data?.products.limit || 10,
      totalPages: data?.products.totalPages || 0,
    },
    loading,
    error,
    refetch,
  };
}

export function useProduct(id: string) {
  const { data, loading, error, refetch } = useQuery<{ product: Product }>(
    GET_PRODUCT,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    product: data?.product,
    loading,
    error,
    refetch,
  };
}

export function useProductBySlug(slug: string) {
  const { data, loading, error, refetch } = useQuery<{
    productBySlug: Product;
  }>(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  return {
    product: data?.productBySlug,
    loading,
    error,
    refetch,
  };
}

export function useProductsByCategory(
  categoryId: string,
  input?: GetProductsInput
) {
  const { data, loading, error, refetch } = useQuery<{
    productsByCategory: PaginatedProducts;
  }>(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId, input },
    skip: !categoryId,
  });

  return {
    products: data?.productsByCategory.items || [],
    pagination: {
      total: data?.productsByCategory.total || 0,
      page: data?.productsByCategory.page || 1,
      limit: data?.productsByCategory.limit || 10,
      totalPages: data?.productsByCategory.totalPages || 0,
    },
    loading,
    error,
    refetch,
  };
}

export function useFeaturedProducts(limit: number = 10) {
  const { data, loading, error, refetch } = useQuery<{
    products: PaginatedProducts;
  }>(GET_FEATURED_PRODUCTS, {
    variables: { limit },
  });

  return {
    products: data?.products.items || [],
    total: data?.products.total || 0,
    loading,
    error,
    refetch,
  };
}

export function useSearchProducts(search: string, limit: number = 20, page: number = 1) {
  const { data, loading, error, refetch } = useQuery<{
    products: PaginatedProducts;
  }>(SEARCH_PRODUCTS, {
    variables: { search, limit, page },
    skip: !search || search.length < 2,
  });

  return {
    products: data?.products.items || [],
    pagination: {
      total: data?.products.total || 0,
      page: data?.products.page || 1,
      limit: data?.products.limit || 20,
      totalPages: data?.products.totalPages || 0,
    },
    loading,
    error,
    refetch,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useCreateProduct() {
  const [createProduct, { data, loading, error }] = useMutation<
    { createProduct: Product },
    { input: CreateProductInput }
  >(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });

  return {
    createProduct: (input: CreateProductInput) =>
      createProduct({ variables: { input } }),
    product: data?.createProduct,
    loading,
    error,
  };
}

export function useUpdateProduct() {
  const [updateProduct, { data, loading, error }] = useMutation<
    { updateProduct: Product },
    { input: UpdateProductInput }
  >(UPDATE_PRODUCT);

  return {
    updateProduct: (input: UpdateProductInput) => {
      console.log('useUpdateProduct hook - input:', input);
      console.log('useUpdateProduct hook - variables:', { input });
      return updateProduct({ variables: { input } });
    },
    product: data?.updateProduct,
    loading,
    error,
  };
}

export function useDeleteProduct() {
  const [deleteProduct, { data, loading, error }] = useMutation<
    { deleteProduct: boolean },
    { id: string }
  >(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });

  return {
    deleteProduct: (id: string) => deleteProduct({ variables: { id } }),
    success: data?.deleteProduct,
    loading,
    error,
  };
}

export function useUpdateProductStock() {
  const [updateStock, { data, loading, error }] = useMutation<
    { updateProductStock: Product },
    { id: string; quantity: number }
  >(UPDATE_PRODUCT_STOCK);

  return {
    updateStock: (id: string, quantity: number) =>
      updateStock({ variables: { id, quantity } }),
    product: data?.updateProductStock,
    loading,
    error,
  };
}

export function useAddProductImage() {
  const [addImage, { data, loading, error }] = useMutation(ADD_PRODUCT_IMAGE);

  return {
    addImage: (input: CreateProductImageInput) =>
      addImage({ variables: { input } }),
    image: data?.addProductImage,
    loading,
    error,
  };
}

export function useDeleteProductImage() {
  const [deleteImage, { loading, error }] = useMutation(DELETE_PRODUCT_IMAGE);

  return {
    deleteImage: (id: string) => deleteImage({ variables: { id } }),
    loading,
    error,
  };
}

export function useAddProductVariant() {
  const [addVariant, { data, loading, error }] = useMutation(
    ADD_PRODUCT_VARIANT
  );

  return {
    addVariant: (input: CreateProductVariantInput) =>
      addVariant({ variables: { input } }),
    variant: data?.addProductVariant,
    loading,
    error,
  };
}

export function useUpdateProductVariant() {
  const [updateVariant, { data, loading, error }] = useMutation(
    UPDATE_PRODUCT_VARIANT
  );

  return {
    updateVariant: (input: UpdateProductVariantInput) =>
      updateVariant({ variables: { input } }),
    variant: data?.updateProductVariant,
    loading,
    error,
  };
}

export function useDeleteProductVariant() {
  const [deleteVariant, { loading, error }] = useMutation(
    DELETE_PRODUCT_VARIANT
  );

  return {
    deleteVariant: (id: string) => deleteVariant({ variables: { id } }),
    loading,
    error,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useProductManagement() {
  const { createProduct, loading: creating, error: createError } = useCreateProduct();
  const { updateProduct, loading: updating, error: updateError } = useUpdateProduct();
  const { deleteProduct, loading: deleting, error: deleteError } = useDeleteProduct();

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    loading: creating || updating || deleting,
    error: createError || updateError || deleteError,
  };
}

export function useProductFilters(initialFilters?: GetProductsInput) {
  const [filters, setFilters] = React.useState<GetProductsInput>(
    initialFilters || {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }
  );

  const { products, pagination, loading, error, refetch } = useProducts(filters);

  const updateFilters = (newFilters: Partial<GetProductsInput>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return {
    products,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    loading,
    error,
    refetch,
  };
}

import React from 'react';
