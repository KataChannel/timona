import { gql } from '@apollo/client';
import {
  CATEGORY_BASIC_FRAGMENT,
  PRODUCT_IMAGE_FRAGMENT as SHARED_PRODUCT_IMAGE_FRAGMENT,
  PRODUCT_VARIANT_FRAGMENT as SHARED_PRODUCT_VARIANT_FRAGMENT,
} from '@/lib/graphql/shared-fragments';

// ============================================================================
// FRAGMENTS
// ============================================================================

// Re-export shared fragments for backward compatibility
export { CATEGORY_BASIC_FRAGMENT };

export const PRODUCT_IMAGE_FRAGMENT = SHARED_PRODUCT_IMAGE_FRAGMENT;

export const PRODUCT_VARIANT_FRAGMENT = SHARED_PRODUCT_VARIANT_FRAGMENT;

export const PRODUCT_BASIC_FRAGMENT = gql`
  fragment ProductBasicFields on ProductType {
    id
    name
    slug
    description
    shortDesc
    sku
    barcode
    price
    originalPrice
    costPrice
    unit
    stock
    minStock
    status
    thumbnail
    origin
    createdAt
    updatedAt
  }
`;

export const PRODUCT_FULL_FRAGMENT = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  ${PRODUCT_IMAGE_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${CATEGORY_BASIC_FRAGMENT}
  fragment ProductFullFields on ProductType {
    ...ProductBasicFields
    category {
      ...CategoryBasicFields
    }
    images {
      ...ProductImageFields
    }
    variants {
      ...ProductVariantFields
    }
    isFeatured
    isNewArrival
    isBestSeller
    isOnSale
    weight
    attributes
    metaTitle
    metaDescription
    metaKeywords
  }
`;

// ============================================================================
// QUERIES
// ============================================================================

export const GET_PRODUCTS = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  ${CATEGORY_BASIC_FRAGMENT}
  query GetProducts($input: GetProductsInput) {
    products(input: $input) {
      items {
        ...ProductBasicFields
        category {
          ...CategoryBasicFields
        }
        isFeatured
        isNewArrival
        isBestSeller
        isOnSale
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_PRODUCT = gql`
  ${PRODUCT_FULL_FRAGMENT}
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFullFields
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  ${PRODUCT_FULL_FRAGMENT}
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      ...ProductFullFields
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  query GetProductsByCategory($categoryId: ID!, $input: GetProductsInput) {
    productsByCategory(categoryId: $categoryId, input: $input) {
      items {
        ...ProductBasicFields
        isFeatured
        isNewArrival
        isBestSeller
        isOnSale
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  ${CATEGORY_BASIC_FRAGMENT}
  query GetFeaturedProducts($limit: Int) {
    products(input: { 
      filters: { isFeatured: true }
      limit: $limit
      sortBy: "createdAt"
      sortOrder: DESC
    }) {
      items {
        ...ProductBasicFields
        category {
          ...CategoryBasicFields
        }
        discountPercentage
      }
      total
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  ${CATEGORY_BASIC_FRAGMENT}
  query SearchProducts($search: String!, $limit: Int, $page: Int) {
    products(input: { 
      filters: { search: $search }
      limit: $limit
      page: $page
    }) {
      items {
        ...ProductBasicFields
        category {
          ...CategoryBasicFields
        }
        discountPercentage
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_CHEAP_PRODUCTS = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  ${CATEGORY_BASIC_FRAGMENT}
  query GetCheapProducts($input: GetProductsInput) {
    products(input: $input) {
      items {
        ...ProductBasicFields
        category {
          ...CategoryBasicFields
        }
        isFeatured
        isNewArrival
        isBestSeller
        isOnSale
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

export const CREATE_PRODUCT = gql`
  ${PRODUCT_FULL_FRAGMENT}
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ...ProductFullFields
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  ${PRODUCT_FULL_FRAGMENT}
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      ...ProductFullFields
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const UPDATE_PRODUCT_STOCK = gql`
  ${PRODUCT_BASIC_FRAGMENT}
  mutation UpdateProductStock($id: ID!, $quantity: Float!) {
    updateProductStock(id: $id, quantity: $quantity) {
      ...ProductBasicFields
    }
  }
`;

export const ADD_PRODUCT_IMAGE = gql`
  ${PRODUCT_IMAGE_FRAGMENT}
  mutation AddProductImage($input: CreateProductImageInput!) {
    addProductImage(input: $input) {
      ...ProductImageFields
    }
  }
`;

export const DELETE_PRODUCT_IMAGE = gql`
  mutation DeleteProductImage($id: ID!) {
    deleteProductImage(id: $id)
  }
`;

export const ADD_PRODUCT_VARIANT = gql`
  ${PRODUCT_VARIANT_FRAGMENT}
  mutation AddProductVariant($input: CreateProductVariantInput!) {
    addProductVariant(input: $input) {
      ...ProductVariantFields
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  ${PRODUCT_VARIANT_FRAGMENT}
  mutation UpdateProductVariant($input: UpdateProductVariantInput!) {
    updateProductVariant(input: $input) {
      ...ProductVariantFields
    }
  }
`;

export const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($id: ID!) {
    deleteProductVariant(id: $id)
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  order: number;
  isActive: boolean;
  attributes?: any;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDesc?: string;
  sku?: string;
  barcode?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  unit: string;
  stock: number;
  minStock: number;
  status: string;
  thumbnail?: string;
  origin?: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  weight?: number;
  attributes?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  discountPercentage?: number; // Added for computed field
  profitMargin?: number; // Added for computed field
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  unit?: string;
  origin?: string;
  inStock?: boolean;
}

export interface GetProductsInput {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  description?: string;
  shortDesc?: string;
  sku?: string;
  barcode?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  unit: string;
  stock: number;
  minStock?: number;
  status?: string;
  thumbnail?: string;
  origin?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  weight?: number;
  attributes?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  categoryId?: string;
  description?: string;
  shortDesc?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  originalPrice?: number;
  costPrice?: number;
  unit?: string;
  stock?: number;
  minStock?: number;
  status?: string;
  thumbnail?: string;
  origin?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  weight?: number;
  attributes?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CreateProductImageInput {
  productId: string;
  url: string;
  alt?: string;
  title?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface CreateProductVariantInput {
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  stock?: number;
  attributes?: Record<string, any>;
  isActive?: boolean;
  order?: number;
}

export interface UpdateProductVariantInput {
  id: string;
  name?: string;
  sku?: string;
  barcode?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, any>;
  isActive?: boolean;
  order?: number;
}
