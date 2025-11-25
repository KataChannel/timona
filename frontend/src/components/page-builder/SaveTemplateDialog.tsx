'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageBlock } from '@/types/page-builder';
import { BlockTemplate, TemplateCategory } from '@/data/blockTemplates';
import { CreateTemplateInput } from '@/utils/customTemplates';
import { Save, Loader2, Info } from 'lucide-react';
import { pageBuilderLogger, LOG_OPERATIONS } from './utils/pageBuilderLogger';

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: PageBlock[];
  onSave: (template: CreateTemplateInput) => Promise<void>;
  isSaving?: boolean;
}

const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string; description: string }[] = [
  { value: 'hero', label: 'Hero', description: 'Hero sections and banners' },
  { value: 'features', label: 'Features', description: 'Feature showcases' },
  { value: 'pricing', label: 'Pricing', description: 'Pricing tables and plans' },
  { value: 'cta', label: 'Call to Action', description: 'CTA sections' },
  { value: 'team', label: 'Team', description: 'Team member displays' },
  { value: 'contact', label: 'Contact', description: 'Contact forms and info' },
  { value: 'testimonials', label: 'Testimonials', description: 'Customer reviews' },
  { value: 'faq', label: 'FAQ', description: 'Frequently asked questions' },
  { value: 'footer', label: 'Footer', description: 'Footer sections' },
  { value: 'newsletter', label: 'Newsletter', description: 'Newsletter signups' },
  { value: 'custom', label: 'Custom', description: 'User-created templates' },
];

export function SaveTemplateDialog({
  open,
  onOpenChange,
  blocks,
  onSave,
  isSaving = false,
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('custom');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    // Validation
    if (!templateName.trim()) {
      setErrors({ name: 'Template name is required' });
      return;
    }

    const newErrors: Record<string, string> = {};
    setErrors(newErrors);

    try {
      // Prepare template data
      const template: CreateTemplateInput = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        category: templateCategory as any,
        blocks: blocks.map(block => convertToTemplateBlock(block, 0)),
      };
      
      // Call async handler
      await onSave(template);
      
      // Reset form
      setTemplateName('');
      setTemplateDescription('');
      setTemplateCategory('custom');
      setErrors({});
    } catch (error) {
      pageBuilderLogger.error(LOG_OPERATIONS.TEMPLATE_SAVE, 'Error saving template', { error });
      setErrors({ submit: 'Failed to save template. Please try again.' });
    }
  };

  const convertToTemplateBlock = (block: PageBlock, depth: number): any => {
    return {
      type: block.type,
      content: block.content,
      style: block.style,
      order: block.order,
      depth: depth,
      parentId: block.parentId || undefined,
      children: block.children ? block.children.map(child => convertToTemplateBlock(child, depth + 1)) : undefined,
    };
  };

  const resetBlockIds = (blocks: PageBlock[]): PageBlock[] => {
    return blocks.map(block => ({
      ...block,
      id: crypto.randomUUID(),
      children: block.children ? resetBlockIds(block.children) : undefined,
    }));
  };

  const handleNameChange = (value: string) => {
    setTemplateName(value);
    if (errors.name) {
      const newErrors = { ...errors };
      delete newErrors.name;
      setErrors(newErrors);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setTemplateDescription(value);
    if (errors.description) {
      const newErrors = { ...errors };
      delete newErrors.description;
      setErrors(newErrors);
    }
  };

  const blockCount = blocks.length;
  const totalBlocks = blocks.reduce((count, block) => {
    return count + 1 + (block.children?.length || 0);
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save your current page blocks as a reusable template. You can apply this template to any page later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template Info */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Template will include:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>{blockCount} root block{blockCount !== 1 ? 's' : ''}</li>
                <li>{totalBlocks} total block{totalBlocks !== 1 ? 's' : ''} (including nested)</li>
                <li>All block settings and content</li>
              </ul>
            </div>
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., My Hero Section, Custom Layout..."
              value={templateName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              disabled={isSaving}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Template Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="template-description"
              placeholder="Describe what this template is for and when to use it..."
              value={templateDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
              className={errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}
              disabled={isSaving}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Template Category */}
          <div className="space-y-2">
            <Label htmlFor="template-category">Category</Label>
            <Select
              value={templateCategory}
              onValueChange={(value) => setTemplateCategory(value as TemplateCategory)}
              disabled={isSaving}
            >
              <SelectTrigger id="template-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Stats */}
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="text-xs">
              {blockCount} root block{blockCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {totalBlocks} total block{totalBlocks !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {templateCategory}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
