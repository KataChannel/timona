import { 
  ChatbotResponse, 
  CreateChatbotDto, 
  TrainingDataResponse, 
  CreateTrainingDataDto,
  ChatMessageResponse,
  ChatConversationResponse,
  SendMessageDto,
  ApiResponse 
} from '@/types/chatbot';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:12001';

class ChatbotApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        return { error: errorData.message || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Chatbot Management
  async createChatbot(chatbotData: CreateChatbotDto): Promise<ApiResponse<ChatbotResponse>> {
    return this.request<ChatbotResponse>('/chatbot', {
      method: 'POST',
      body: JSON.stringify(chatbotData),
    });
  }

  async getChatbots(): Promise<ApiResponse<ChatbotResponse[]>> {
    return this.request<ChatbotResponse[]>('/chatbot');
  }

  async getChatbot(id: string): Promise<ApiResponse<ChatbotResponse>> {
    return this.request<ChatbotResponse>(`/chatbot/${id}`);
  }

  async updateChatbot(id: string, chatbotData: Partial<CreateChatbotDto>): Promise<ApiResponse<ChatbotResponse>> {
    return this.request<ChatbotResponse>(`/chatbot/${id}`, {
      method: 'PUT',
      body: JSON.stringify(chatbotData),
    });
  }

  async deleteChatbot(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/chatbot/${id}`, {
      method: 'DELETE',
    });
  }

  // Training Data Management
  async createTrainingData(
    chatbotId: string, 
    trainingData: CreateTrainingDataDto
  ): Promise<ApiResponse<TrainingDataResponse>> {
    return this.request<TrainingDataResponse>(`/ai-training/${chatbotId}`, {
      method: 'POST',
      body: JSON.stringify(trainingData),
    });
  }

  async getTrainingData(): Promise<ApiResponse<TrainingDataResponse[]>> {
    return this.request<TrainingDataResponse[]>('/ai-training');
  }

  async getTrainingDataById(id: string): Promise<ApiResponse<TrainingDataResponse>> {
    return this.request<TrainingDataResponse>(`/ai-training/${id}`);
  }

  async deleteTrainingData(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/ai-training/${id}`, {
      method: 'DELETE',
    });
  }

  // Chat Functionality
  async sendMessage(
    chatbotId: string, 
    messageData: SendMessageDto
  ): Promise<ApiResponse<ChatMessageResponse>> {
    return this.request<ChatMessageResponse>(`/chatbot/${chatbotId}/message`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getChatbotConversations(chatbotId: string): Promise<ApiResponse<ChatConversationResponse[]>> {
    return this.request<ChatConversationResponse[]>(`/chatbot/${chatbotId}/conversations`);
  }

  async getConversation(conversationId: string): Promise<ApiResponse<ChatConversationResponse>> {
    return this.request<ChatConversationResponse>(`/chatbot/conversation/${conversationId}`);
  }
}

export const chatbotApi = new ChatbotApiClient();
