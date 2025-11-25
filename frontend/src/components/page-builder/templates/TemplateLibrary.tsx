/**
 * PageBuilder Template System - Template Library Component
 * Phase 5.2: UI Components
 * 
 * Main template browser with grid, search, and filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { PageTemplate, TemplateCategory } from '@/types/template';
import { TemplateCard } from './TemplateCard';
import { TemplateCategoryFilter } from './TemplateCategoryFilter';
import { TemplatePreview } from './TemplatePreview';
import { ConfirmationDialog } from './ConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Upload, Download, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StorageWarning } from '../StorageWarning';

interface TemplateLibraryProps {
  onTemplateSelect?: (template: PageTemplate) => void;
  onCreateNew?: () => void;
  onImport?: () => void;
}

export function TemplateLibrary({
  onTemplateSelect,
  onCreateNew,
  onImport,
}: TemplateLibraryProps) {
  const {
    templates,
    filteredTemplates,
    isLoading,
    filter,
    setFilter,
    exportTemplate,
    duplicate,
    removeTemplate,
  } = useTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    template: PageTemplate | null;
  }>({
    isOpen: false,
    template: null,
  });

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<TemplateCategory, number> = {
      all: templates.length,
      landing: 0,
      blog: 0,
      ecommerce: 0,
      portfolio: 0,
      marketing: 0,
      custom: 0,
    };

    templates.forEach((template) => {
      counts[template.category] = (counts[template.category] || 0) + 1;
    });

    return counts;
  }, [templates]);

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilter({ search: value });
  };

  // Handle category change
  const handleCategoryChange = (category: TemplateCategory) => {
    setFilter({ category });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc'];
    setFilter({ sortBy, sortOrder });
  };

  // Handle template use
  const handleUseTemplate = (template: PageTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
    setPreviewTemplate(null);
  };

  // Handle template duplicate
  const handleDuplicate = async (template: PageTemplate) => {
    await duplicate(template.id);
  };

  // Handle template delete
  const handleDelete = (template: PageTemplate) => {
    setDeleteConfirmation({
      isOpen: true,
      template,
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.template) {
      await removeTemplate(deleteConfirmation.template.id);
      setDeleteConfirmation({ isOpen: false, template: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, template: null });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Warning */}
      <StorageWarning threshold={80} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Library</h2>
          <p className="text-gray-600 mt-1">Choose a template to get started quickly</p>
        </div>
        <div className="flex items-center gap-2">
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          )}
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={`${filter.sortBy}-${filter.sortOrder}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="category-asc">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <TemplateCategoryFilter
          activeCategory={filter.category || 'all'}
          onCategoryChange={handleCategoryChange}
          counts={categoryCounts}
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredTemplates.length} of {templates.length} templates
        </span>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Start by creating your first template'}
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
              onPreview={setPreviewTemplate}
              onExport={exportTemplate}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={handleUseTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteConfirmation.template?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
