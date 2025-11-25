// Chatbot Types
export interface CreateChatbotDto {
  name: string;
  description?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  trainingDataIds?: string[];
}

export interface ChatbotResponse {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  status: ChatbotStatus;
  temperature: number;
  maxTokens: number;
  trainingDataCount: number;
  conversationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ChatbotStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRAINING = 'TRAINING',
}

// Training Data Types
export interface CreateTrainingDataDto {
  title: string;
  type: TrainingDataType;
  content?: string;
  filePath?: string;
}

export interface TrainingDataResponse {
  id: string;
  title: string;
  type: TrainingDataType;
  status: TrainingStatus;
  content?: string;
  filePath?: string;
  embeddings?: any;
  createdAt: Date;
  updatedAt: Date;
}

export enum TrainingDataType {
  DOCUMENT = 'DOCUMENT',
  TEXT = 'TEXT',
  FAQ = 'FAQ',
  CONVERSATION = 'CONVERSATION',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
}

export enum TrainingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// Chat Types
export interface SendMessageDto {
  message: string;
  conversationId?: string;
}

export interface ChatMessageResponse {
  id: string;
  content: string;
  role: string; // 'user' or 'assistant'
  timestamp: Date;
  conversationId: string;
}

export interface ChatConversationResponse {
  id: string;
  title: string;
  messages: ChatMessageResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
