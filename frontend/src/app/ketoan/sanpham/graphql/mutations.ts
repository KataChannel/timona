import { gql } from '@apollo/client';

export const UPDATE_PRODUCTS_FROM_DETAILS = gql`
  mutation UpdateProductsFromDetails($dryRun: Boolean!, $limit: Int) {
    updateProductsFromDetails(dryRun: $dryRun, limit: $limit) {
      success
      message
      stats {
        totalDetails
        processed
        created
        updated
        skipped
        errors
      }
      output
    }
  }
`;

export const NORMALIZE_PRODUCTS = gql`
  mutation NormalizeProducts($productIds: [String!], $threshold: Float) {
    normalizeProducts(productIds: $productIds, threshold: $threshold) {
      updated
      skipped
      errors
    }
  }
`;

export const FIND_SIMILAR_PRODUCTS = gql`
  query FindSimilarProducts($searchText: String!, $threshold: Float) {
    findSimilarProducts(searchText: $searchText, threshold: $threshold) {
      id
      ten
      ten2
      ma
      similarityScore
    }
  }
`;

export const GET_PRODUCT_GROUPS = gql`
  query GetProductGroups($minGroupSize: Float) {
    getProductGroups(minGroupSize: $minGroupSize) {
      ten2
      productCount
      products {
        id
        ten
        ma
        dvt
        dgia
      }
    }
  }
`;
