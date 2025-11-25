import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($input: GetProductsInput) {
    products(input: $input) {
      items {
        id
        name
        slug
        description
        shortDesc
        price
        originalPrice
        costPrice
        sku
        barcode
        stock
        minStock
        maxStock
        unit
        weight
        origin
        status
        categoryId
        thumbnail
        attributes
        metaTitle
        metaDescription
        metaKeywords
        isFeatured
        isNewArrival
        isBestSeller
        isOnSale
        displayOrder
        category {
          id
          name
          slug
          description
        }
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
      hasMore
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      name
      slug
      description
      shortDesc
      price
      originalPrice
      costPrice
      sku
      barcode
      stock
      minStock
      maxStock
      unit
      status
      images {
        id
        url
        alt
        isPrimary
        order
      }
      category {
        id
        name
        slug
        description
      }
      variants {
        id
        name
        sku
        price
        stock
        attributes
      }
      metaTitle
      metaDescription
      metaKeywords
      isFeatured
      isNewArrival
      isBestSeller
      isOnSale
      viewCount
      soldCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      shortDesc
      price
      originalPrice
      costPrice
      sku
      barcode
      stock
      minStock
      maxStock
      unit
      status
      images {
        id
        url
        alt
        isPrimary
        order
      }
      category {
        id
        name
        slug
      }
      variants {
        id
        name
        sku
        price
        stock
        attributes
      }
      metaTitle
      metaDescription
      metaKeywords
      isFeatured
      isNewArrival
      isBestSeller
      isOnSale
      viewCount
      soldCount
      createdAt
      updatedAt
    }
  }
`;
