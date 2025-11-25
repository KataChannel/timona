import { gql } from '@apollo/client';

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

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
      viewCount
      soldCount
      discountPercentage
      profitMargin
      category {
        id
        name
        slug
        description
        image
      }
      images {
        id
        url
        alt
        title
        isPrimary
        order
      }
      variants {
        id
        name
        sku
        barcode
        price
        stock
        attributes
        isActive
        order
      }
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($input: GetProductsInput) {
    products(input: $input) {
      items {
        id
        name
        slug
        shortDesc
        price
        originalPrice
        thumbnail
        stock
        isFeatured
        category {
          id
          name
          slug
        }
      }
      total
    }
  }
`;

export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories($input: GetCategoriesInput) {
    categories(input: $input) {
      items {
        id
        name
        slug
        description
        image
        icon
        parentId
        displayOrder
        isActive
        isFeatured
        productCount
        children {
          id
          name
          slug
          productCount
        }
      }
      total
      page
      limit
      totalPages
      hasMore
    }
  }
`;

// ============================================================================
// CART QUERIES & MUTATIONS
// ============================================================================

export const GET_CART = gql`
  query GetCart($sessionId: String) {
    getCart(sessionId: $sessionId) {
      id
      userId
      sessionId
      items {
        id
        cartId
        productId
        variantId
        quantity
        price
        product {
          id
          name
          slug
          price
          thumbnail
          stock
        }
      }
      itemCount
      subtotal
      shippingFee
      tax
      discount
      total
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      success
      message
      cart {
        id
        items {
          id
          quantity
          price
          product {
            id
            name
            thumbnail
          }
        }
        itemCount
        total
      }
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($input: UpdateCartItemInput!, $sessionId: String) {
    updateCartItem(input: $input, sessionId: $sessionId) {
      success
      message
      cart {
        id
        items {
          id
          quantity
          price
        }
        itemCount
        total
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($input: RemoveFromCartInput!, $sessionId: String) {
    removeFromCart(input: $input, sessionId: $sessionId) {
      success
      message
      cart {
        id
        itemCount
        total
      }
    }
  }
`;

export const CLEAR_CART = gql`
  mutation ClearCart($sessionId: String) {
    clearCart(sessionId: $sessionId) {
      success
      message
    }
  }
`;

export const MERGE_CARTS = gql`
  mutation MergeCarts($input: MergeCartsInput!) {
    mergeCarts(input: $input) {
      success
      message
      cart {
        id
        itemCount
        total
      }
    }
  }
`;

// ============================================================================
// ORDER QUERIES & MUTATIONS
// ============================================================================

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      success
      message
      order {
        id
        orderNumber
        status
        total
        paymentMethod
        shippingAddress
        items {
          id
          productId
          productName
          variantName
          sku
          thumbnail
          quantity
          price
          subtotal
        }
        createdAt
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($orderId: ID!) {
    getOrder(orderId: $orderId) {
      id
      orderNumber
      status
      paymentStatus
      subtotal
      discount
      shippingFee
      tax
      total
      paymentMethod
      shippingMethod
      shippingAddress
      billingAddress
      items {
        id
        productId
        productName
        variantName
        sku
        thumbnail
        quantity
        price
        subtotal
      }
      tracking {
        id
        status
        carrier
        trackingNumber
        trackingUrl
        estimatedDelivery
        actualDelivery
        events {
          id
          status
          description
          location
          eventTime
        }
      }
      customerNote
      internalNote
      confirmedAt
      shippedAt
      deliveredAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($skip: Int, $take: Int) {
    getMyOrders(skip: $skip, take: $take) {
      success
      message
      orders {
        id
        orderNumber
        status
        total
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($input: CancelOrderInput!) {
    cancelOrder(input: $input) {
      success
      message
      order {
        id
        orderNumber
        status
      }
    }
  }
`;

// ============================================================================
// REVIEW QUERIES & MUTATIONS
// ============================================================================

export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!, $page: Int, $limit: Int, $rating: Int) {
    productReviews(productId: $productId, page: $page, limit: $limit, rating: $rating) {
      items {
        id
        productId
        userId
        rating
        title
        comment
        images
        isVerifiedPurchase
        isApproved
        helpfulCount
        user {
          id
          email
          fullName
        }
        createdAt
        updatedAt
      }
      total
      page
      pageSize
      totalPages
      hasMore
    }
  }
`;

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      productId
      userId
      rating
      title
      comment
      images
      isVerifiedPurchase
      isApproved
      helpfulCount
      createdAt
      updatedAt
    }
  }
`;

// ============================================================================
// WISHLIST QUERIES & MUTATIONS
// ============================================================================

// ============================================================================
// WISHLIST QUERIES (Backend not implemented yet - commented out)
// ============================================================================

// export const GET_WISHLIST = gql`
//   query GetWishlist {
//     wishlist {
//       id
//       items {
//         id
//         product {
//           id
//           name
//           slug
//           price
//           salePrice
//           thumbnailUrl
//           stock
//           inStock
//         }
//         addedAt
//       }
//     }
//   }
// `;

// export const ADD_TO_WISHLIST = gql`
//   mutation AddToWishlist($productId: ID!) {
//     addToWishlist(productId: $productId) {
//       success
//       message
//     }
//   }
// `;

// export const REMOVE_FROM_WISHLIST = gql`
//   mutation RemoveFromWishlist($productId: ID!) {
//     removeFromWishlist(productId: $productId) {
//       success
//       message
//     }
//   }
// `;

// Temporary mock exports to prevent import errors
export const GET_WISHLIST = null;
export const ADD_TO_WISHLIST = null;
export const REMOVE_FROM_WISHLIST = null;

// ============================================================================
// ORDER TRACKING QUERIES
// ============================================================================

export const TRACK_ORDER = gql`
  query TrackOrder($orderNumber: String!) {
    getOrderByNumber(orderNumber: $orderNumber) {
      id
      orderNumber
      status
      createdAt
      confirmedAt
      shippedAt
      deliveredAt
      tracking {
        id
        status
        carrier
        trackingNumber
        trackingUrl
        estimatedDelivery
        actualDelivery
        events {
          id
          status
          description
          location
          eventTime
        }
      }
      items {
        id
        productName
        thumbnail
        quantity
        price
      }
      shippingAddress
    }
  }
`;

export const GET_USER_ORDERS = gql`
  query GetMyOrders($skip: Float, $take: Float) {
    getMyOrders(skip: $skip, take: $take) {
      orders {
        id
        orderNumber
        status
        total
        paymentMethod
        paymentStatus
        createdAt
        items {
          id
          productId
          productName
          thumbnail
          quantity
          price
          subtotal
        }
        shippingAddress
      }
      total
      hasMore
    }
  }
`;

export const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($orderNumber: String!) {
    getOrderByNumber(orderNumber: $orderNumber) {
      id
      orderNumber
      status
      total
      subtotal
      shippingFee
      tax
      discount
      paymentMethod
      paymentStatus
      shippingMethod
      customerNote
      internalNote
      createdAt
      updatedAt
      confirmedAt
      shippedAt
      deliveredAt
      cancelledAt
      items {
        id
        productId
        productName
        variantName
        sku
        thumbnail
        quantity
        price
        subtotal
      }
      shippingAddress
      billingAddress
      tracking {
        id
        status
        carrier
        trackingNumber
        trackingUrl
        estimatedDelivery
        actualDelivery
        events {
          id
          status
          description
          location
          eventTime
        }
      }
    }
  }
`;

// ============================================================================
// PAYMENT QUERIES & MUTATIONS
// ============================================================================

export const CREATE_PAYMENT = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      success
      message
      payment {
        id
        orderId
        method
        status
        amount
        transactionId
        gatewayResponse
      }
      paymentUrl
    }
  }
`;

export const VERIFY_PAYMENT = gql`
  query VerifyPayment($orderId: ID!, $transactionId: String!) {
    verifyPayment(orderId: $orderId, transactionId: $transactionId) {
      success
      message
      payment {
        id
        status
        paidAt
      }
    }
  }
`;

// ============================================================================
// CHECKOUT MUTATIONS
// ============================================================================

export const VALIDATE_CHECKOUT = gql`
  mutation ValidateCheckout($input: ValidateCheckoutInput!) {
    validateCheckout(input: $input) {
      valid
      errors {
        field
        message
      }
      warnings {
        field
        message
      }
      itemsAvailability {
        productId
        available
        requestedQuantity
        availableQuantity
      }
    }
  }
`;

export const APPLY_COUPON = gql`
  mutation ApplyCoupon($code: String!) {
    applyCoupon(code: $code) {
      success
      message
      discount {
        code
        type
        value
        discountAmount
      }
    }
  }
`;

export const REMOVE_COUPON = gql`
  mutation RemoveCoupon {
    removeCoupon {
      success
      message
    }
  }
`;
