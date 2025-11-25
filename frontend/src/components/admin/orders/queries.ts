/**
 * Order Management GraphQL Queries & Mutations
 * Chứa tất cả GraphQL operations cho order management
 */

import { gql } from '@apollo/client';

// ================================
// Queries
// ================================

export const LIST_ORDERS = gql`
  query ListOrders($filter: OrderFilterInput) {
    listOrders(filter: $filter) {
      orders {
        id
        orderNumber
        status
        paymentStatus
        total
        shippingMethod
        createdAt
        updatedAt
        userId
        guestName
        guestEmail
        guestPhone
        shippingAddress
        items {
          id
          quantity
          price
          productId
          productName
          thumbnail
          sku
          variantName
        }
      }
      total
      hasMore
    }
  }
`;

export const GET_ORDER_STATS = gql`
  query GetOrderStatistics {
    getOrderStatistics {
      success
      message
      totalOrders
      totalRevenue
      byStatus
      byPaymentStatus
    }
  }
`;

export const GET_ORDER_DETAIL = gql`
  query GetOrderDetail($orderId: ID!) {
    getOrder(orderId: $orderId) {
      id
      orderNumber
      status
      paymentStatus
      paymentMethod
      total
      subtotal
      shippingFee
      tax
      discount
      shippingMethod
      createdAt
      updatedAt
      userId
      guestName
      guestEmail
      guestPhone
      shippingAddress
      billingAddress
      items {
        id
        quantity
        price
        subtotal
        productId
        productName
        thumbnail
        sku
        variantName
      }
      tracking {
        id
        carrier
        trackingNumber
        status
        estimatedDelivery
        trackingUrl
        actualDelivery
        events {
          id
          status
          location
          description
          eventTime
        }
      }
    }
  }
`;

// ================================
// Mutations
// ================================

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(input: $input) {
      success
      message
      order {
        id
        status
        updatedAt
      }
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      success
      message
      order {
        id
        status
        updatedAt
      }
    }
  }
`;

export const ADD_ORDER_NOTE = gql`
  mutation AddOrderNote($input: AddOrderNoteInput!) {
    addOrderNote(input: $input) {
      success
      message
      note {
        id
        content
        type
        createdBy
        createdAt
      }
    }
  }
`;

export const UPDATE_TRACKING = gql`
  mutation UpdateTracking($input: UpdateTrackingInput!) {
    updateTracking(input: $input) {
      success
      message
      tracking {
        id
        carrier
        trackingNumber
        status
        estimatedDelivery
      }
    }
  }
`;
