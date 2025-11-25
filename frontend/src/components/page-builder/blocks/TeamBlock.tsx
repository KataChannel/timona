import React, { useState } from 'react';
import { Edit3, Trash2, Plus, X, Linkedin, Twitter, Mail } from 'lucide-react';
import { PageBlock, TeamBlockContent } from '@/types/page-builder';

interface TeamBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

export const TeamBlock: React.FC<TeamBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<TeamBlockContent>(block.content);

  const handleSave = () => {
    onUpdate?.(content, block.style);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  const addMember = () => {
    setContent(prev => ({
      ...prev,
      members: [
        ...(prev.members || []),
        {
          name: 'New Member',
          position: 'Position',
          bio: '',
          image: '',
          social: {}
        }
      ]
    }));
  };

  const removeMember = (index: number) => {
    setContent(prev => ({
      ...prev,
      members: prev.members?.filter((_, i) => i !== index) || []
    }));
  };

  const updateMember = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      members: prev.members?.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      ) || []
    }));
  };

  const updateMemberSocial = (index: number, platform: string, value: string) => {
    setContent(prev => ({
      ...prev,
      members: prev.members?.map((member, i) => 
        i === index ? { 
          ...member, 
          social: { ...member.social, [platform]: value }
        } : member
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
                placeholder="Our Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Meet the amazing people behind our success"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Layout</label>
              <select
                value={content.layout || 'grid'}
                onChange={(e) => setContent(prev => ({ ...prev, layout: e.target.value as any }))}
                className="w-full p-2 border rounded"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Columns</label>
              <select
                value={content.columns || 3}
                onChange={(e) => setContent(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">Team Members</label>
              <button
                onClick={addMember}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
              >
                <Plus size={14} />
                Add Member
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {content.members?.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Member #{index + 1}</h4>
                    <button
                      onClick={() => removeMember(index)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Position</label>
                      <input
                        type="text"
                        value={member.position}
                        onChange={(e) => updateMember(index, 'position', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="CEO & Founder"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={member.image || ''}
                      onChange={(e) => updateMember(index, 'image', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Bio</label>
                    <textarea
                      value={member.bio || ''}
                      onChange={(e) => updateMember(index, 'bio', e.target.value)}
                      className="w-full p-2 border rounded text-sm resize-none"
                      rows={2}
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-2">Social Links</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="url"
                        value={member.social?.linkedin || ''}
                        onChange={(e) => updateMemberSocial(index, 'linkedin', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="LinkedIn URL"
                      />
                      <input
                        type="url"
                        value={member.social?.twitter || ''}
                        onChange={(e) => updateMemberSocial(index, 'twitter', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Twitter URL"
                      />
                      <input
                        type="email"
                        value={member.social?.email || ''}
                        onChange={(e) => updateMemberSocial(index, 'email', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Email"
                      />
                    </div>
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

  const gridClass = `grid gap-8 ${
    content.columns === 2 ? 'md:grid-cols-2' : 
    content.columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
    'md:grid-cols-2 lg:grid-cols-3'
  }`;

  return (
    <div
      className={`relative group py-16 ${isEditable ? 'hover:ring-2 hover:ring-blue-300' : ''}`}
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
          {content.members?.map((member, index) => (
            <div key={index} className="text-center group/member">
              <div className="relative mb-6">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 mx-auto rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400 font-bold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {member.name}
              </h3>
              
              <p className="text-blue-600 font-medium mb-3">
                {member.position}
              </p>

              {member.bio && (
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {member.bio}
                </p>
              )}

              {(member.social?.linkedin || member.social?.twitter || member.social?.email) && (
                <div className="flex justify-center space-x-3">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {member.social.email && (
                    <a
                      href={`mailto:${member.social.email}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Mail size={20} />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
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