'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Code,
  Monitor,
  Tablet,
  Smartphone,
  Undo,
  Redo,
  Save,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  FileDown,
  FileUp,
  Archive,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SaveTemplateDialog } from '@/components/page-builder/templates';
import { ImportTemplateDialog } from '@/components/page-builder/templates';
import { PageTemplate, PageElement, ImportTemplateData } from '@/types/template';
import { useTemplates } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';
import { GET_PAGE_BY_ID } from '@/graphql/queries/pages';

interface EditorToolbarProps {
  editorMode: 'visual' | 'code';
  onModeChange: (mode: 'visual' | 'code') => void;
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onExit: () => void;
  leftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  currentPageStructure?: PageElement[];
  currentPageStyles?: any;
  onApplyTemplate?: (template: PageTemplate) => void;
  isLoading?: boolean;
  pageTitle?: string;
  pageId?: string;
  onSettingsSave?: (settings: any) => void;
}

export function EditorToolbar({
  editorMode,
  onModeChange,
  device,
  onDeviceChange,
  onSave,
  onExit,
  leftPanelOpen,
  onToggleLeftPanel,
  rightPanelOpen,
  onToggleRightPanel,
  currentPageStructure = [],
  currentPageStyles,
  onApplyTemplate,
  isLoading = false,
  pageTitle,
  pageId,
  onSettingsSave,
}: EditorToolbarProps) {
  const { toast } = useToast();
  const { addTemplate, importFromJSON } = useTemplates();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  // Page settings state
  const [pageSettings, setPageSettings] = useState({
    pageTitle: pageTitle || '',
    pageDescription: '',
    pageSlug: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isPublished: true,
    showInNavigation: true,
    allowIndexing: true,
    requireAuth: false,
    customCSS: '',
    customJS: '',
    headCode: '',
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + S - Save as Template
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsSaveDialogOpen(true);
      }
      // Ctrl/Cmd + Shift + O - Import Template
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        setIsImportDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load page settings from GraphQL
  const { data: pageData } = useQuery(GET_PAGE_BY_ID, {
    variables: { id: pageId },
    skip: !pageId,
    errorPolicy: 'all'
  });

  // Update page settings when data loads
  useEffect(() => {
    if (pageData?.getPageById) {
      const page = pageData.getPageById;
      setPageSettings(prev => ({
        ...prev,
        pageTitle: page.title || '',
        pageDescription: page.description || '',
        pageSlug: page.slug || '',
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoKeywords: Array.isArray(page.seoKeywords) ? page.seoKeywords.join(', ') : '',
      }));
    }
  }, [pageData]);

  // Update pageTitle in state when prop changes
  useEffect(() => {
    if (pageTitle) {
      setPageSettings(prev => ({ ...prev, pageTitle }));
    }
  }, [pageTitle]);

  // Handle page settings change
  const handleSettingChange = (field: string, value: any) => {
    setPageSettings(prev => ({ ...prev, [field]: value }));
  };

  // Handle save template
  const handleSaveTemplate = async (template: PageTemplate) => {
    try {
      const success = await addTemplate(template);
      if (success) {
        toast({
          title: 'Template saved',
          description: `"${template.name}" has been saved to your template library.`,
          type: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save template. Please try again.',
          type: 'error',
        });
      }
      return success;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template. Please try again.',
        type: 'error',
      });
      return false;
    }
  };

  // Handle import template
  const handleImportTemplate = async (data: ImportTemplateData) => {
    try {
      // Convert template to JSON string
      const jsonString = JSON.stringify(data.template);
      const result = await importFromJSON(jsonString);
      
      if (result.success) {
        toast({
          title: 'Template imported',
          description: `"${data.template.name}" has been imported successfully.`,
          type: 'success',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to import template. Please try again.',
          type: 'error',
        });
        return false;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import template. Please try again.',
        type: 'error',
      });
      return false;
    }
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4">
      {/* Left Section - Logo & Mode */}
      <div className="flex items-center gap-4">
        <div className="font-bold text-lg text-primary">
          Kata Builder
        </div>

        {/* Editor Mode Switcher */}
        <Tabs value={editorMode} onValueChange={(v) => onModeChange(v as 'visual' | 'code')}>
          <TabsList>
            <TabsTrigger value="visual" className="gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Center Section - Device Preview */}
      <div className="flex items-center gap-2">
        <Tabs value={device} onValueChange={(v) => onDeviceChange(v as 'desktop' | 'tablet' | 'mobile')}>
          <TabsList>
            <TabsTrigger value="desktop" className="gap-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden md:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="tablet" className="gap-2">
              <Tablet className="w-4 h-4" />
              <span className="hidden md:inline">Tablet</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Panel Toggles */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleLeftPanel}
          title={leftPanelOpen ? 'Hide left panel' : 'Show left panel'}
        >
          {leftPanelOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRightPanel}
          title={rightPanelOpen ? 'Hide right panel' : 'Show right panel'}
        >
          {rightPanelOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Undo/Redo */}
        <Button variant="ghost" size="icon" disabled title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled title="Redo (Ctrl+Y)">
          <Redo className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />
        {/* Template Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setIsSaveDialogOpen(true)}>
              <FileDown className="w-4 h-4 mr-2" />
              Save as Template
              <span className="ml-auto text-xs text-gray-500">⇧⌘S</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
              <FileUp className="w-4 h-4 mr-2" />
              Import Template
              <span className="ml-auto text-xs text-gray-500">⇧⌘O</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save */}
        <Button 
          variant="default" 
          size="sm" 
          onClick={onSave} 
          className="gap-2"
          disabled={isLoading}
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">{isLoading ? 'Loading...' : 'Save'}</span>
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon" 
          title="Global Settings"
          onClick={() => setIsSettingsOpen(true)}
          disabled={isLoading}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Exit */}
        <Button variant="ghost" size="icon" onClick={onExit} title="Exit Fullscreen (ESC)">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Template Dialogs */}
      <SaveTemplateDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveTemplate}
        currentPageStructure={currentPageStructure}
        currentPageStyles={currentPageStyles}
      />

      <ImportTemplateDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportTemplate}
      />

      {/* Global Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="flex flex-col max-w-2xl max-h-[90vh] p-0">
          {/* Fixed Header */}
          <DialogHeader className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Global Settings
            </DialogTitle>
            <DialogDescription>
              Configure global page settings that apply to the entire page
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 border-b border-gray-200">
            <div className="space-y-6">
            {/* Page Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                📄 Page Settings
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="page-title">Page Title</Label>
                  <Input
                    id="page-title"
                    placeholder="Enter page title..."
                    value={pageSettings.pageTitle}
                    onChange={(e) => handleSettingChange('pageTitle', e.target.value)}
                    disabled={isSettingsLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page-description">Page Description</Label>
                  <Textarea
                    id="page-description"
                    placeholder="Enter page description..."
                    value={pageSettings.pageDescription}
                    onChange={(e) => handleSettingChange('pageDescription', e.target.value)}
                    disabled={isSettingsLoading}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page-slug">Page Slug (URL)</Label>
                  <Input
                    id="page-slug"
                    placeholder="/my-page"
                    value={pageSettings.pageSlug}
                    onChange={(e) => handleSettingChange('pageSlug', e.target.value)}
                    disabled={isSettingsLoading}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                🔍 SEO Settings
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input
                    id="seo-title"
                    placeholder="SEO optimized title..."
                    value={pageSettings.seoTitle}
                    onChange={(e) => handleSettingChange('seoTitle', e.target.value)}
                    disabled={isSettingsLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Recommended: 50-60 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-description">Meta Description</Label>
                  <Textarea
                    id="seo-description"
                    placeholder="SEO meta description..."
                    value={pageSettings.seoDescription}
                    onChange={(e) => handleSettingChange('seoDescription', e.target.value)}
                    disabled={isSettingsLoading}
                    rows={3}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Recommended: 150-160 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Keywords</Label>
                  <Input
                    id="seo-keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={pageSettings.seoKeywords}
                    onChange={(e) => handleSettingChange('seoKeywords', e.target.value)}
                    disabled={isSettingsLoading}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Page Options */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                🎛️ Page Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Published</Label>
                    <p className="text-xs text-gray-500">Make this page publicly visible</p>
                  </div>
                  <Switch 
                    checked={pageSettings.isPublished}
                    onCheckedChange={(checked) => handleSettingChange('isPublished', checked)}
                    disabled={isSettingsLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show in Navigation</Label>
                    <p className="text-xs text-gray-500">Include in main navigation menu</p>
                  </div>
                  <Switch 
                    checked={pageSettings.showInNavigation}
                    onCheckedChange={(checked) => handleSettingChange('showInNavigation', checked)}
                    disabled={isSettingsLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Indexing</Label>
                    <p className="text-xs text-gray-500">Allow search engines to index this page</p>
                  </div>
                  <Switch 
                    checked={pageSettings.allowIndexing}
                    onCheckedChange={(checked) => handleSettingChange('allowIndexing', checked)}
                    disabled={isSettingsLoading}
                    defaultChecked 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Authentication</Label>
                    <p className="text-xs text-gray-500">Require users to login to view</p>
                  </div>
                  <Switch 
                    checked={pageSettings.requireAuth}
                    onCheckedChange={(checked) => handleSettingChange('requireAuth', checked)}
                    disabled={isSettingsLoading}
                  />
                </div>
              </div>
            </div>

            {/* Custom Code */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                💻 Custom Code
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea
                    id="custom-css"
                    placeholder=".my-class { color: red; }"
                    value={pageSettings.customCSS}
                    onChange={(e) => handleSettingChange('customCSS', e.target.value)}
                    disabled={isSettingsLoading}
                    rows={4}
                    className="w-full font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-js">Custom JavaScript</Label>
                  <Textarea
                    id="custom-js"
                    placeholder="console.log('Hello');"
                    value={pageSettings.customJS}
                    onChange={(e) => handleSettingChange('customJS', e.target.value)}
                    disabled={isSettingsLoading}
                    rows={4}
                    className="w-full font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="head-code">Head Code (Meta tags, Analytics)</Label>
                  <Textarea
                    id="head-code"
                    placeholder="<meta name='...'/>"
                    value={pageSettings.headCode}
                    onChange={(e) => handleSettingChange('headCode', e.target.value)}
                    disabled={isSettingsLoading}
                    rows={4}
                    className="w-full font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(false)}
              disabled={isSettingsLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  if (onSettingsSave) {
                    await onSettingsSave(pageSettings);
                  }
                  toast({
                    title: 'Settings saved',
                    description: 'Global settings have been updated successfully.',
                    type: 'success',
                  });
                  setIsSettingsOpen(false);
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to save settings. Please try again.',
                    type: 'error',
                  });
                }
              }}
              disabled={isSettingsLoading}
            >
              {isSettingsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
