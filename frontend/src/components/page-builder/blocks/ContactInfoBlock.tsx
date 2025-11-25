import React, { useState } from 'react';
import { Edit3, Trash2, Plus, X, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { PageBlock, ContactInfoBlockContent } from '@/types/page-builder';

interface ContactInfoBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate?: (content: any, style?: any) => void;
  onDelete?: () => void;
}

const DEFAULT_ICONS = {
  address: MapPin,
  phone: Phone,
  email: Mail,
  hours: Clock,
};

export const ContactInfoBlock: React.FC<ContactInfoBlockProps> = ({
  block,
  isEditable = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<ContactInfoBlockContent>(block.content);

  const handleSave = () => {
    onUpdate?.(content, block.style);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(block.content);
    setIsEditing(false);
  };

  const addContact = () => {
    setContent(prev => ({
      ...prev,
      contacts: [
        ...(prev.contacts || []),
        {
          type: 'address',
          label: 'Address',
          value: '123 Main St, City, Country',
          icon: 'address'
        }
      ]
    }));
  };

  const removeContact = (index: number) => {
    setContent(prev => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index) || []
    }));
  };

  const updateContact = (index: number, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      contacts: prev.contacts?.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
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
                placeholder="Contact Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Get in touch with us"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={content.showMap || false}
                  onChange={(e) => setContent(prev => ({ ...prev, showMap: e.target.checked }))}
                  className="mr-2"
                />
                Show Map
              </label>
            </div>
            {content.showMap && (
              <div>
                <label className="block text-sm font-medium mb-1">Map Embed URL</label>
                <input
                  type="url"
                  value={content.mapEmbedUrl || ''}
                  onChange={(e) => setContent(prev => ({ ...prev, mapEmbedUrl: e.target.value }))}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Google Maps embed URL"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">Contact Information</label>
              <button
                onClick={addContact}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
              >
                <Plus size={14} />
                Add Contact
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {content.contacts?.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Contact #{index + 1}</h4>
                    <button
                      onClick={() => removeContact(index)}
                      className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Type</label>
                      <select
                        value={contact.type}
                        onChange={(e) => updateContact(index, 'type', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="address">Address</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Label</label>
                      <input
                        type="text"
                        value={contact.label}
                        onChange={(e) => updateContact(index, 'label', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Label"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Value</label>
                    <input
                      type="text"
                      value={contact.value}
                      onChange={(e) => updateContact(index, 'value', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Contact information"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {content.contacts?.map((contact, index) => {
              const IconComponent = DEFAULT_ICONS[contact.type] || MapPin;
              
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {contact.label}
                    </h3>
                    <p className="text-gray-600">
                      {contact.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map */}
          {content.showMap && content.mapEmbedUrl && (
            <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={content.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              />
            </div>
          )}
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