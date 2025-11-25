'use client';

import { useState } from 'react';
import { ChatbotList } from '@/components/chatbot/ChatbotList';
import { ChatInterface } from '@/components/chatbot/ChatInterface';
import { TrainingDataManager } from '@/components/chatbot/TrainingDataManager';
import { ChatbotForm } from '@/components/chatbot/ChatbotForm';
import { ChatbotResponse, CreateChatbotDto } from '@/types/chatbot';
import { useChatbots } from '@/hooks/useChatbot';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { LogIn, User } from 'lucide-react';

type ViewState = 
  | { type: 'list' }
  | { type: 'chat'; chatbot: ChatbotResponse }
  | { type: 'training'; chatbot: ChatbotResponse }
  | { type: 'form' };

export default function ChatbotPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { createChatbot, loading, error } = useChatbots();
  const [viewState, setViewState] = useState<ViewState>({ type: 'list' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access the chatbot features.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateChatbot = () => {
    setViewState({ type: 'form' });
  };

  const handleChatWithBot = (chatbot: ChatbotResponse) => {
    setViewState({ type: 'chat', chatbot });
  };

  const handleManageTraining = (chatbot: ChatbotResponse) => {
    setViewState({ type: 'training', chatbot });
  };

  const handleBackToList = () => {
    setViewState({ type: 'list' });
  };

  const handleSubmitForm = async (data: CreateChatbotDto) => {
    setFormLoading(true);
    setFormError(null);

    try {
      await createChatbot(data);
      setViewState({ type: 'list' });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create chatbot');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setFormError(null);
    setViewState({ type: 'list' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {viewState.type === 'list' && (
        <ChatbotList
          onChatWithBot={handleChatWithBot}
          onManageTraining={handleManageTraining}
          onCreateChatbot={handleCreateChatbot}
          onEditChatbot={(chatbot) => {
            // You can implement edit functionality later
            console.log('Edit chatbot:', chatbot);
          }}
        />
      )}

      {viewState.type === 'chat' && (
        <ChatInterface
          chatbot={viewState.chatbot}
          onBack={handleBackToList}
        />
      )}

      {viewState.type === 'training' && (
        <TrainingDataManager
          chatbotId={viewState.chatbot.id}
          onBack={handleBackToList}
        />
      )}

      {viewState.type === 'form' && (
        <ChatbotForm
          onSubmit={handleSubmitForm}
          onCancel={handleCancelForm}
          loading={formLoading}
          error={formError}
        />
      )}
    </div>
  );
}
