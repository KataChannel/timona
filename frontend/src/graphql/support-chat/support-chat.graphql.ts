import { gql } from '@apollo/client';

// ============================================
// Support Chat Queries
// ============================================

export const GET_SUPPORT_CONVERSATIONS = gql`
  query GetSupportConversations($where: SupportConversationWhereInput, $take: Int) {
    supportConversations(where: $where, take: $take) {
      id
      conversationCode
      customerName
      customerEmail
      customerPhone
      status
      priority
      platform
      platformUserName
      subject
      tags
      lastMessageAt
      lastMessagePreview
      rating
      startedAt
      closedAt
      createdAt
      customer {
        id
        email
        username
        firstName
        lastName
        avatar
      }
      assignedAgent {
        id
        username
        firstName
        lastName
        avatar
        email
      }
      messages {
        id
        content
        senderType
        senderName
        isAIGenerated
        aiConfidence
        isRead
        sentAt
        createdAt
        sender {
          id
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

export const GET_SUPPORT_CONVERSATION = gql`
  query GetSupportConversation($id: String!) {
    supportConversation(id: $id) {
      id
      conversationCode
      customerName
      customerEmail
      customerPhone
      customerIp
      customerLocation
      status
      priority
      platform
      platformUserId
      platformUserName
      subject
      tags
      notes
      lastMessageAt
      lastMessagePreview
      rating
      feedback
      startedAt
      closedAt
      createdAt
      updatedAt
      customer {
        id
        email
        username
        firstName
        lastName
        avatar
        phone
      }
      assignedAgent {
        id
        username
        firstName
        lastName
        avatar
        email
      }
      messages {
        id
        content
        senderType
        senderName
        isAIGenerated
        aiConfidence
        isRead
        sentAt
        createdAt
        sender {
          id
          username
          firstName
          lastName
          avatar
        }
      }
    }
  }
`;

// ============================================
// Support Chat Mutations
// ============================================

export const CREATE_SUPPORT_CONVERSATION = gql`
  mutation CreateSupportConversation($input: CreateSupportConversationInput!) {
    createSupportConversation(input: $input) {
      id
      conversationCode
      customerName
      customerEmail
      status
      platform
      createdAt
    }
  }
`;

export const ASSIGN_CONVERSATION_TO_AGENT = gql`
  mutation AssignConversationToAgent($conversationId: String!, $agentId: String!) {
    assignConversationToAgent(conversationId: $conversationId, agentId: $agentId) {
      id
      assignedAgent {
        id
        username
        firstName
        lastName
        avatar
        email
      }
      assignedAt
    }
  }
`;

export const SEND_SUPPORT_MESSAGE = gql`
  mutation SendSupportMessage($input: CreateSupportMessageInput!) {
    sendSupportMessage(input: $input) {
      id
      conversationId
      content
      senderType
      senderName
      isAIGenerated
      sentAt
      createdAt
    }
  }
`;

export const MARK_MESSAGES_AS_READ = gql`
  mutation MarkMessagesAsRead($conversationId: String!, $userId: String!) {
    markMessagesAsRead(conversationId: $conversationId, userId: $userId) {
      count
    }
  }
`;

export const UPDATE_CONVERSATION_STATUS = gql`
  mutation UpdateConversationStatus($conversationId: String!, $status: SupportConversationStatus!) {
    updateConversationStatus(conversationId: $conversationId, status: $status) {
      id
      status
      closedAt
    }
  }
`;

export const RATE_CONVERSATION = gql`
  mutation RateConversation($conversationId: String!, $rating: Int!, $feedback: String) {
    rateConversation(conversationId: $conversationId, rating: $rating, feedback: $feedback) {
      id
      rating
      feedback
    }
  }
`;

// ============================================
// Support Analytics Queries
// ============================================

export const GET_SUPPORT_ANALYTICS = gql`
  query GetSupportAnalytics {
    supportAnalytics {
      totalConversations
      activeConversations
      waitingConversations
      closedConversations
      averageResponseTime
      averageResolutionTime
      customerSatisfactionScore
      totalMessages
      aiGeneratedMessages
      platformBreakdown {
        platform
        count
      }
      agentPerformance {
        agentId
        agentName
        conversationsHandled
        averageResponseTime
        satisfactionScore
      }
    }
  }
`;

// ============================================
// TypeScript Types
// ============================================

export enum SupportConversationStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum SupportMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
}

export enum SupportSender {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  BOT = 'BOT',
}

export enum IntegrationPlatform {
  WEBSITE = 'WEBSITE',
  ZALO_OA = 'ZALO_OA',
  FACEBOOK = 'FACEBOOK',
}

export interface SupportConversation {
  id: string;
  conversationCode: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerIp?: string;
  customerLocation?: string;
  status: SupportConversationStatus;
  priority: string;
  platform: IntegrationPlatform;
  platformUserId?: string;
  platformUserName?: string;
  subject?: string;
  tags: string[];
  notes?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  rating?: number;
  feedback?: string;
  startedAt: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  assignedAgent?: any;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  conversationId: string;
  content: string;
  messageType: SupportMessageType;
  senderType: SupportSender;
  senderName?: string;
  isAIGenerated: boolean;
  aiConfidence?: number;
  aiSuggestions?: any;
  metadata?: any;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  sentAt: string;
  createdAt: string;
  sender?: any;
  attachments?: any[];
}

export interface CreateSupportConversationInput {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  platform?: IntegrationPlatform;
  subject?: string;
  customerId?: string;
}

export interface CreateSupportMessageInput {
  conversationId: string;
  content: string;
  senderType: SupportSender;
  senderName?: string;
  senderId?: string;
  messageType?: SupportMessageType;
  metadata?: any;
}
