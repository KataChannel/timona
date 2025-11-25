import { gql } from '@apollo/client';

export const GET_TECHNICAL_SUPPORT_TICKETS = gql`
  query GetTechnicalSupportTickets($where: TechnicalSupportTicketWhereInput, $take: Int, $skip: Int) {
    technicalSupportTickets(where: $where, take: $take, skip: $skip) {
      id
      ticketNumber
      subject
      description
      category
      priority
      status
      customerEmail
      customerName
      customerPhone
      relatedUrl
      tags
      createdAt
      updatedAt
      firstResponseAt
      lastResponseAt
    }
  }
`;

export const GET_TECHNICAL_SUPPORT_TICKET = gql`
  query GetTechnicalSupportTicket($id: String!) {
    technicalSupportTicket(id: $id) {
      id
      ticketNumber
      subject
      description
      category
      priority
      status
      customerId
      customerEmail
      customerName
      customerPhone
      assignedToId
      assignedAt
      environment
      browserInfo
      osInfo
      deviceInfo
      errorLogs
      attachmentUrls
      screenshotUrls
      relatedUrl
      relatedOrderId
      resolution
      resolvedAt
      resolvedById
      customerRating
      customerFeedback
      tags
      createdAt
      updatedAt
      closedAt
      firstResponseAt
      lastResponseAt
    }
  }
`;

export const GET_MY_TECHNICAL_SUPPORT_TICKETS = gql`
  query GetMyTechnicalSupportTickets($status: String) {
    myTechnicalSupportTickets(status: $status) {
      id
      ticketNumber
      subject
      description
      category
      priority
      status
      createdAt
      updatedAt
      firstResponseAt
      lastResponseAt
    }
  }
`;

export const CREATE_TECHNICAL_SUPPORT_TICKET = gql`
  mutation CreateTechnicalSupportTicket($input: CreateTechnicalSupportTicketInput!) {
    createTechnicalSupportTicket(input: $input) {
      id
      ticketNumber
      subject
      category
      priority
      status
      createdAt
    }
  }
`;

export const UPDATE_TECHNICAL_SUPPORT_TICKET = gql`
  mutation UpdateTechnicalSupportTicket($id: String!, $input: UpdateTechnicalSupportTicketInput!) {
    updateTechnicalSupportTicket(id: $id, input: $input) {
      id
      ticketNumber
      status
      priority
      updatedAt
    }
  }
`;

export const ASSIGN_TECHNICAL_SUPPORT_TICKET = gql`
  mutation AssignTechnicalSupportTicket($ticketId: String!, $assignedToId: String!) {
    assignTechnicalSupportTicket(ticketId: $ticketId, assignedToId: $assignedToId) {
      id
      ticketNumber
      assignedToId
      assignedAt
      status
    }
  }
`;

export const RESOLVE_TECHNICAL_SUPPORT_TICKET = gql`
  mutation ResolveTechnicalSupportTicket($ticketId: String!, $resolution: String!) {
    resolveTechnicalSupportTicket(ticketId: $ticketId, resolution: $resolution) {
      id
      ticketNumber
      status
      resolution
      resolvedAt
      resolvedById
    }
  }
`;

export const CREATE_TECHNICAL_SUPPORT_MESSAGE = gql`
  mutation CreateTechnicalSupportMessage($input: CreateTechnicalSupportMessageInput!) {
    createTechnicalSupportMessage(input: $input) {
      id
      content
      isInternal
      attachmentUrls
      authorId
      authorName
      authorEmail
      createdAt
    }
  }
`;

export const RATE_TECHNICAL_SUPPORT_TICKET = gql`
  mutation RateTechnicalSupportTicket($input: RateTicketInput!) {
    rateTechnicalSupportTicket(input: $input) {
      id
      ticketNumber
      customerRating
      customerFeedback
      status
      closedAt
    }
  }
`;
