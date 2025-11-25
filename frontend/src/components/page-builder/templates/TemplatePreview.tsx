/**
 * PageBuilder Template System - Template Preview Modal
 * Phase 5.2: UI Components
 * 
 * Full-screen preview modal with template details
 */

'use client';

import React from 'react';
import { PageTemplate } from '@/types/template';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, User, Tag, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplatePreviewProps {
  template: PageTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse?: (template: PageTemplate) => void;
}

export function TemplatePreview({ template, isOpen, onClose, onUse }: TemplatePreviewProps) {
  if (!template) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const countElements = (elements: any[]): number => {
    let count = elements.length;
    elements.forEach(el => {
      if (el.children && Array.isArray(el.children)) {
        count += countElements(el.children);
      }
    });
    return count;
  };

  const elementCount = countElements(template.structure);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="text-2xl">{template.name}</DialogTitle>
                {template.isDefault && (
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    Default
                  </Badge>
                )}
                <Badge className="capitalize">{template.category}</Badge>
              </div>
              <DialogDescription className="text-base">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {/* Preview Image */}
          <div className="mb-6">
            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-200">
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <div className="text-lg">No Preview Available</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {template.author && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Author</div>
                  <div className="text-sm font-medium text-gray-900">{template.author}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(template.updatedAt)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Elements</div>
                <div className="text-sm font-medium text-gray-900">{elementCount} elements</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(template.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Structure Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Template Structure</h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-2 text-sm font-mono text-gray-600">
                {template.structure.map((element, index) => (
                  <div key={element.id} className="pl-4 border-l-2 border-blue-300">
                    <span className="text-blue-600">{element.type}</span>
                    {element.content && (
                      <span className="text-gray-500 ml-2">
                        "{element.content.slice(0, 30)}{element.content.length > 30 ? '...' : ''}"
                      </span>
                    )}
                    {element.children && element.children.length > 0 && (
                      <span className="text-gray-400 ml-2">
                        ({element.children.length} children)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onUse && (
            <Button onClick={() => onUse(template)} className="bg-blue-600 hover:bg-blue-700">
              Use This Template
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
