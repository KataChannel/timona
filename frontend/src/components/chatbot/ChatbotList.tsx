'use client';

import { useState } from 'react';
import { Plus, Bot, MessageSquare, Database, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { ChatbotResponse, ChatbotStatus } from '@/types/chatbot';
import { useChatbots } from '@/hooks/useChatbot';

interface ChatbotListProps {
  onChatWithBot: (chatbot: ChatbotResponse) => void;
  onManageTraining: (chatbot: ChatbotResponse) => void;
  onCreateChatbot: () => void;
  onEditChatbot: (chatbot: ChatbotResponse) => void;
}

export function ChatbotList({ onChatWithBot, onManageTraining, onCreateChatbot, onEditChatbot }: ChatbotListProps) {
  const { chatbots, loading, error, deleteChatbot } = useChatbots();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (chatbot: ChatbotResponse) => {
    if (confirm(`Are you sure you want to delete "${chatbot.name}"? This action cannot be undone.`)) {
      setDeletingId(chatbot.id);
      await deleteChatbot(chatbot.id);
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: ChatbotStatus) => {
    switch (status) {
      case ChatbotStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200';
      case ChatbotStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ChatbotStatus.TRAINING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading chatbots: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            My Chatbots
          </h2>
          <button
            onClick={onCreateChatbot}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chatbot
          </button>
        </div>
      </div>

      {/* Chatbot List */}
      <div className="flex-1 overflow-y-auto">
        {chatbots.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chatbots yet</h3>
              <p className="text-gray-500 mb-4">Create your first AI chatbot to get started.</p>
              <button
                onClick={onCreateChatbot}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Chatbot
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {chatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bot className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{chatbot.name}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(chatbot.status)}`}>
                          {chatbot.status}
                        </span>
                      </div>
                    </div>
                    
                    {chatbot.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{chatbot.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {chatbot.conversationCount} conversations
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {chatbot.trainingDataCount} training data
                      </div>
                      <div>
                        Created {new Date(chatbot.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onChatWithBot(chatbot)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Chat
                      </button>
                      <button
                        onClick={() => onManageTraining(chatbot)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Database className="h-3 w-3" />
                        Training
                      </button>
                    </div>
                  </div>
                  
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditChatbot(chatbot);
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit chatbot"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(chatbot);
                        }}
                        disabled={deletingId === chatbot.id}
                        className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        title="Delete chatbot"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
