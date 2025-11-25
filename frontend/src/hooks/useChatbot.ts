import { useState, useEffect, useCallback } from 'react';
import { 
  ChatbotResponse, 
  CreateChatbotDto, 
  TrainingDataResponse, 
  CreateTrainingDataDto,
  ChatConversationResponse,
  ChatMessageResponse,
  SendMessageDto 
} from '@/types/chatbot';
import { chatbotApi } from '@/lib/chatbot-api';

// Hook for managing chatbots
export function useChatbots() {
  const [chatbots, setChatbots] = useState<ChatbotResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatbots = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.getChatbots();
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setChatbots(response.data);
    }
    
    setLoading(false);
  }, []);

  const createChatbot = useCallback(async (chatbotData: CreateChatbotDto) => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.createChatbot(chatbotData);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    } else if (response.data) {
      setChatbots(prev => [response.data!, ...prev]);
      setLoading(false);
      return response.data;
    }
    
    setLoading(false);
    return null;
  }, []);

  const updateChatbot = useCallback(async (id: string, chatbotData: Partial<CreateChatbotDto>) => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.updateChatbot(id, chatbotData);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setChatbots(prev => prev.map(bot => bot.id === id ? response.data! : bot));
    }
    
    setLoading(false);
    return response.data;
  }, []);

  const deleteChatbot = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.deleteChatbot(id);
    
    if (response.error) {
      setError(response.error);
    } else {
      setChatbots(prev => prev.filter(bot => bot.id !== id));
    }
    
    setLoading(false);
    return !response.error;
  }, []);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  return {
    chatbots,
    loading,
    error,
    createChatbot,
    updateChatbot,
    deleteChatbot,
    refetch: fetchChatbots,
  };
}

// Hook for managing single chatbot
export function useChatbot(chatbotId: string | null) {
  const [chatbot, setChatbot] = useState<ChatbotResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatbot = useCallback(async () => {
    if (!chatbotId) return;
    
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.getChatbot(chatbotId);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setChatbot(response.data);
    }
    
    setLoading(false);
  }, [chatbotId]);

  useEffect(() => {
    fetchChatbot();
  }, [fetchChatbot]);

  return {
    chatbot,
    loading,
    error,
    refetch: fetchChatbot,
  };
}

// Hook for managing training data
export function useTrainingData() {
  const [trainingData, setTrainingData] = useState<TrainingDataResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.getTrainingData();
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setTrainingData(response.data);
    }
    
    setLoading(false);
  }, []);

  const createTrainingData = useCallback(async (chatbotId: string, data: CreateTrainingDataDto) => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.createTrainingData(chatbotId, data);
    
    if (response.error) {
      setError(response.error);
      setLoading(false);
      return null;
    } else if (response.data) {
      setTrainingData(prev => [response.data!, ...prev]);
      setLoading(false);
      return response.data;
    }
    
    setLoading(false);
    return null;
  }, []);

  const deleteTrainingData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.deleteTrainingData(id);
    
    if (response.error) {
      setError(response.error);
    } else {
      setTrainingData(prev => prev.filter(data => data.id !== id));
    }
    
    setLoading(false);
    return !response.error;
  }, []);

  useEffect(() => {
    fetchTrainingData();
  }, [fetchTrainingData]);

  return {
    trainingData,
    loading,
    error,
    createTrainingData,
    deleteTrainingData,
    refetch: fetchTrainingData,
  };
}

// Hook for chat functionality
export function useChat(chatbotId: string | null) {
  const [conversations, setConversations] = useState<ChatConversationResponse[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!chatbotId) return;
    
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.getChatbotConversations(chatbotId);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setConversations(response.data);
    }
    
    setLoading(false);
  }, [chatbotId]);

  const sendMessage = useCallback(async (messageData: SendMessageDto) => {
    if (!chatbotId) return null;
    
    setError(null);
    
    // Add user message to current conversation immediately for better UX
    if (currentConversation) {
      const userMessage: ChatMessageResponse = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: messageData.message,
        role: 'user',
        timestamp: new Date(),
        conversationId: currentConversation.id || '',
      };
      
      setCurrentConversation(prev => ({
        ...prev!,
        messages: [...prev!.messages, userMessage],
      }));
    }
    
    // Send message to backend - if conversationId is empty, backend will create new conversation
    const actualMessageData = {
      ...messageData,
      conversationId: currentConversation?.id || undefined, // Don't send empty string
    };
    
    const response = await chatbotApi.sendMessage(chatbotId, actualMessageData);
    
    if (response.error) {
      setError(response.error);
      // Remove the optimistically added message on error
      if (currentConversation) {
        setCurrentConversation(prev => ({
          ...prev!,
          messages: prev!.messages.slice(0, -1),
        }));
      }
      return null;
    } else if (response.data) {
      // If this was a new conversation (no ID), update with the real conversation
      if (!currentConversation?.id || currentConversation.id === '') {
        // Load the full conversation to get proper data
        const conversationResponse = await chatbotApi.getConversation(response.data.conversationId);
        if (conversationResponse.data) {
          setCurrentConversation(conversationResponse.data);
        }
      } else {
        // Update existing conversation with AI response
        setCurrentConversation(prev => ({
          ...prev!,
          messages: [...prev!.messages.filter(m => !m.id.startsWith('temp-')), response.data!],
        }));
      }
      
      // Refresh conversations list
      fetchConversations();
      
      return response.data;
    }
    
    return null;
  }, [chatbotId, currentConversation, fetchConversations]);

  const loadConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    
    const response = await chatbotApi.getConversation(conversationId);
    
    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setCurrentConversation(response.data);
    }
    
    setLoading(false);
  }, []);

  const startNewConversation = useCallback(() => {
    // Clear current conversation to show a fresh chat interface
    setCurrentConversation({
      id: '', // Temporary empty ID - will be set when first message is sent
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }, []);

  useEffect(() => {
    if (chatbotId) {
      fetchConversations();
    }
  }, [fetchConversations, chatbotId]);

  return {
    conversations,
    currentConversation,
    loading,
    error,
    sendMessage,
    loadConversation,
    startNewConversation,
    refetchConversations: fetchConversations,
  };
}
