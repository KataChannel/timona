/**
 * PageBuilder Template System - Save Template Dialog
 * Phase 5.3: Template Operations
 * 
 * Dialog for saving current page as a template
 */

'use client';

import React, { useState } from 'react';
import { PageTemplate, TemplateCategory, TEMPLATE_CATEGORIES, PageElement } from '@/types/template';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, X, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateTemplateId } from '@/lib/templateStore';

interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: PageTemplate) => Promise<boolean>;
  currentPageStructure: PageElement[];
  currentPageStyles?: any;
}

export function SaveTemplateDialog({
  isOpen,
  onClose,
  onSave,
  currentPageStructure,
  currentPageStyles,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isValid = name.trim().length > 0 && description.trim().length > 0 && category !== 'all';

  // Parse tags from comma-separated string
  const parsedTags = tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // Handle save
  const handleSave = async () => {
    if (!isValid) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const template: PageTemplate = {
        id: generateTemplateId(),
        name: name.trim(),
        description: description.trim(),
        category: category as Exclude<TemplateCategory, 'all'>,
        structure: currentPageStructure,
        styles: currentPageStyles,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: author.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        isDefault: false,
      };

      const success = await onSave(template);

      if (success) {
        // Reset form
        setName('');
        setDescription('');
        setCategory('custom');
        setTags('');
        setAuthor('');
        onClose();
      } else {
        setError('Failed to save template. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setName('');
    setDescription('');
    setCategory('custom');
    setTags('');
    setAuthor('');
    setError(null);
    onClose();
  };

  // Count elements
  const countElements = (elements: PageElement[]): number => {
    let count = elements.length;
    elements.forEach(el => {
      if (el.children && Array.isArray(el.children)) {
        count += countElements(el.children);
      }
    });
    return count;
  };

  const elementCount = countElements(currentPageStructure);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save your current page design as a reusable template. This includes all elements and styles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Template Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Current Page Structure
                </p>
                <p className="text-sm text-blue-700">
                  {elementCount} elements will be saved in this template
                </p>
              </div>
            </div>
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., My Landing Page"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              Choose a descriptive name for your template
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="template-description"
              placeholder="Describe what this template is for and what it includes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          {/* Category and Author */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={(value: TemplateCategory) => setCategory(value)}>
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-author">Author (optional)</Label>
              <Input
                id="template-author"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="template-tags">Tags (optional)</Label>
            <Input
              id="template-tags"
              placeholder="e.g., modern, minimal, hero"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Separate tags with commas. Tags help organize and search templates.
            </p>
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {parsedTags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
