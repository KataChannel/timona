import React, { useState } from 'react';
import { Edit3, Trash2, Plus, X, TrendingUp, Users, Star, Target } from 'lucide-react';
import { PageBlock, StatsBlockContent } from '@/types/page-builder';

interface StatsBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

const DEFAULT_ICONS = {
  users: Users,
  star: Star,
  target: Target,
  trending: TrendingUp,
};

export const StatsBlock: React.FC<StatsBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<StatsBlockContent>(block.content);

  const handleSave = () => {
    onUpdate?.(content, block.style);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  const addStat = () => {
    setContent(prev => ({
      ...prev,
      stats: [
        ...(prev.stats || []),
        {
          value: '100+',
          label: 'New Stat',
          description: '',
          icon: 'star'
        }
      ]
    }));
  };

  const removeStat = (index: number) => {
    setContent(prev => ({
      ...prev,
      stats: prev.stats?.filter((_, i) => i !== index) || []
    }));
  };

  const updateStat = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      stats: prev.stats?.map((stat, i) => 
        i === index ? { ...stat, [field]: value } : stat
      ) || []
    }));
  };

  if (isEditing && isEditable) {
    return (
      <div className="relative border-2 border-blue-500 rounded-lg p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Section Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Our Achievement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Numbers that speak for themselves"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Layout</label>
              <select
                value={content.layout || 'grid'}
                onChange={(e) => setContent(prev => ({ ...prev, layout: e.target.value as any }))}
                className="w-full p-2 border rounded"
              >
                <option value="grid">Grid</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={content.animated || false}
                  onChange={(e) => setContent(prev => ({ ...prev, animated: e.target.checked }))}
                  className="mr-2"
                />
                Animated counters
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">Statistics</label>
              <button
                onClick={addStat}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
              >
                <Plus size={14} />
                Add Stat
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {content.stats?.map((stat, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Stat #{index + 1}</h4>
                    <button
                      onClick={() => removeStat(index)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Value</label>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateStat(index, 'value', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="100+"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStat(index, 'label', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Happy Customers"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Icon</label>
                    <select
                      value={stat.icon || 'star'}
                      onChange={(e) => updateStat(index, 'icon', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="users">Users</option>
                      <option value="star">Star</option>
                      <option value="target">Target</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Description</label>
                    <textarea
                      value={stat.description || ''}
                      onChange={(e) => updateStat(index, 'description', e.target.value)}
                      className="w-full p-2 border rounded text-sm resize-none"
                      rows={2}
                      placeholder="Optional description..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const gridClass = content.layout === 'horizontal' 
    ? 'flex flex-wrap justify-center gap-8' 
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8';

  return (
    <div
      className={`relative group py-16 bg-gray-50 ${isEditable ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
      style={block.style}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(content.title || content.subtitle) && (
          <div className="text-center mb-12">
            {content.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        <div className={gridClass}>
          {content.stats?.map((stat, index) => {
            const IconComponent = DEFAULT_ICONS[stat.icon as keyof typeof DEFAULT_ICONS] || Star;
            
            return (
              <div key={index} className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {stat.label}
                </h3>
                
                {stat.description && (
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isEditable && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="Edit"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};