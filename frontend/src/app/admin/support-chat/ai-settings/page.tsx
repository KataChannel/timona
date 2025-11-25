'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_AI_PROVIDERS,
  GET_AI_PROVIDER_STATS,
  CREATE_AI_PROVIDER,
  UPDATE_AI_PROVIDER,
  DELETE_AI_PROVIDER,
  TEST_AI_PROVIDER,
  TOGGLE_AI_PROVIDER_STATUS,
  SET_DEFAULT_AI_PROVIDER,
  AIProvider,
  AIProviderStats,
  AIProviderType,
} from '@/graphql/support-chat/ai-provider.graphql';
import { motion } from 'framer-motion';

export default function AISettingsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Queries
  const { data: providersData, loading, refetch } = useQuery(GET_AI_PROVIDERS);
  const { data: statsData } = useQuery(GET_AI_PROVIDER_STATS);

  // Mutations
  const [createProvider] = useMutation(CREATE_AI_PROVIDER);
  const [updateProvider] = useMutation(UPDATE_AI_PROVIDER);
  const [deleteProvider] = useMutation(DELETE_AI_PROVIDER);
  const [testProvider] = useMutation(TEST_AI_PROVIDER);
  const [toggleStatus] = useMutation(TOGGLE_AI_PROVIDER_STATUS);
  const [setDefault] = useMutation(SET_DEFAULT_AI_PROVIDER);

  const providers: AIProvider[] = providersData?.getAIProviders || [];
  const stats: AIProviderStats = statsData?.getAIProviderStats || {
    totalProviders: 0,
    activeProviders: 0,
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
  };

  const handleCreateProvider = async (formData: any) => {
    try {
      await createProvider({
        variables: { input: formData },
      });
      await refetch();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create provider:', error);
      alert('Failed to create provider');
    }
  };

  const handleUpdateProvider = async (id: string, formData: any) => {
    try {
      await updateProvider({
        variables: { id, input: formData },
      });
      await refetch();
      setEditingProvider(null);
    } catch (error) {
      console.error('Failed to update provider:', error);
      alert('Failed to update provider');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;

    try {
      await deleteProvider({ variables: { id } });
      await refetch();
    } catch (error) {
      console.error('Failed to delete provider:', error);
      alert('Failed to delete provider');
    }
  };

  const handleTestProvider = async (id: string) => {
    setTestingProvider(id);
    try {
      const { data } = await testProvider({
        variables: {
          input: {
            providerId: id,
            testMessage: 'Hello, this is a test message.',
          },
        },
      });

      const result = data.testAIProvider;
      if (result.success) {
        alert(`✅ Test Successful!\n\nResponse: ${result.response}\n\nTime: ${result.responseTime}ms\nTokens: ${result.tokensUsed}`);
      } else {
        alert(`❌ Test Failed!\n\nError: ${result.error}\n\nTime: ${result.responseTime}ms`);
      }
    } catch (error: any) {
      alert(`❌ Test Failed!\n\n${error.message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleStatus({ variables: { id, isActive: !isActive } });
      await refetch();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to toggle status');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault({ variables: { id } });
      await refetch();
    } catch (error) {
      console.error('Failed to set default:', error);
      alert('Failed to set default');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Provider Settings</h1>
        <p className="text-gray-600">Quản lý các AI providers cho hệ thống chat support</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Providers</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProviders}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeProviders}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Response</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime.toFixed(0)}ms</div>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? '✕ Cancel' : '+ Add AI Provider'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingProvider) && (
        <AIProviderForm
          provider={editingProvider}
          onSubmit={editingProvider ? (data) => handleUpdateProvider(editingProvider.id, data) : handleCreateProvider}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProvider(null);
          }}
        />
      )}

      {/* Providers List */}
      <div className="grid gap-4">
        {providers.map((provider) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    provider.provider === 'CHATGPT' ? 'bg-green-100 text-green-800' :
                    provider.provider === 'GROK' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {provider.provider}
                  </span>
                  {provider.isDefault && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      DEFAULT
                    </span>
                  )}
                  <button
                    onClick={() => handleToggleStatus(provider.id, provider.isActive)}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      provider.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {provider.isActive ? '● Active' : '○ Inactive'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Model:</span>{' '}
                    <span className="font-medium">{provider.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Temperature:</span>{' '}
                    <span className="font-medium">{provider.temperature}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Tokens:</span>{' '}
                    <span className="font-medium">{provider.maxTokens}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>{' '}
                    <span className="font-medium">{provider.priority}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>Requests: <span className="font-medium text-gray-900">{provider.totalRequests}</span></div>
                  <div>Success: <span className="font-medium text-green-600">{provider.successCount}</span></div>
                  <div>Failed: <span className="font-medium text-red-600">{provider.failureCount}</span></div>
                  <div>Avg Time: <span className="font-medium text-purple-600">{provider.avgResponseTime?.toFixed(0) || 0}ms</span></div>
                </div>

                {provider.lastError && (
                  <div className="mt-2 text-sm text-red-600">
                    Last Error: {provider.lastError}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleTestProvider(provider.id)}
                  disabled={testingProvider === provider.id}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                >
                  {testingProvider === provider.id ? 'Testing...' : 'Test'}
                </button>
                {!provider.isDefault && (
                  <button
                    onClick={() => handleSetDefault(provider.id)}
                    className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => setEditingProvider(provider)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {providers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No AI providers configured. Click "Add AI Provider" to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== FORM COMPONENT ====================

function AIProviderForm({
  provider,
  onSubmit,
  onCancel,
}: {
  provider?: AIProvider | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    provider: provider?.provider || AIProviderType.CHATGPT,
    name: provider?.name || '',
    apiKey: provider?.apiKey || '',
    model: provider?.model || 'gpt-4',
    temperature: provider?.temperature || 0.7,
    maxTokens: provider?.maxTokens || 2000,
    systemPrompt: provider?.systemPrompt || '',
    isActive: provider?.isActive ?? false,
    priority: provider?.priority || 0,
    isDefault: provider?.isDefault ?? false,
    description: provider?.description || '',
    tags: provider?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-white rounded-lg shadow p-6 mb-6"
    >
      <h3 className="text-xl font-semibold mb-4">
        {provider ? 'Edit AI Provider' : 'Add New AI Provider'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value as AIProviderType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={AIProviderType.CHATGPT}>ChatGPT</option>
              <option value={AIProviderType.GROK}>Grok</option>
              <option value={AIProviderType.GEMINI}>Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ChatGPT Production"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sk-..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="gpt-4, grok-2, gemini-pro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (0-2)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
            <input
              type="number"
              min="1"
              max="8000"
              value={formData.maxTokens}
              onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              min="0"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="production, backup"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
          <textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="You are a helpful customer support assistant..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Optional description..."
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Set as Default</span>
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {provider ? 'Update Provider' : 'Create Provider'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
