'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

/**
 * Memoized SubComponent: ToolbarSection
 * Prevents re-renders of sections that haven't changed
 */
const ToolbarModeSection = React.memo(function ToolbarModeSection({
  editorMode,
  onModeChange,
}: {
  editorMode: 'visual' | 'code';
  onModeChange: (mode: 'visual' | 'code') => void;
}) {
  return (
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
  );
});

/**
 * Memoized SubComponent: DeviceSection
 */
const ToolbarDeviceSection = React.memo(function ToolbarDeviceSection({
  device,
  onDeviceChange,
}: {
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}) {
  return (
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
  );
});

/**
 * Memoized SubComponent: TemplatesMenu
 */
const TemplatesMenu = React.memo(function TemplatesMenu({
  onSaveClick,
  onImportClick,
}: {
  onSaveClick: () => void;
  onImportClick: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Archive className="w-4 h-4" />
          <span className="hidden sm:inline">Templates</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onSaveClick}>
          <FileDown className="w-4 h-4 mr-2" />
          Save as Template
          <span className="ml-auto text-xs text-gray-500">⇧⌘S</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImportClick}>
          <FileUp className="w-4 h-4 mr-2" />
          Import Template
          <span className="ml-auto text-xs text-gray-500">⇧⌘O</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

/**
 * Memoized SubComponent: GlobalSettingsDialog
 */
const GlobalSettingsDialog = React.memo(function GlobalSettingsDialog({
  isOpen,
  onOpenChange,
  pageSettings,
  onSettingChange,
  isLoading,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pageSettings: any;
  onSettingChange: (field: string, value: any) => void;
  isLoading: boolean;
  onSave: () => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Global Developer Settings
          </DialogTitle>
          <DialogDescription>
            Configure global developer settings: SEO, custom code, and page options
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 border-b border-gray-200 space-y-6">
          {/* REMOVED: Page Settings moved to PageSettingsForm (PageBuilderHeader) */}
          {/* NOTE: Title, Slug, Description, Status are now managed in Page Settings dialog */}
          {/* This Global Settings dialog now focuses on developer-level configurations */}

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
                  onChange={(e) => onSettingChange('seoTitle', e.target.value)}
                  disabled={isLoading || isSaving}
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
                  onChange={(e) => onSettingChange('seoDescription', e.target.value)}
                  disabled={isLoading || isSaving}
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
                  onChange={(e) => onSettingChange('seoKeywords', e.target.value)}
                  disabled={isLoading || isSaving}
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
                  onCheckedChange={(checked) => onSettingChange('isPublished', checked)}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show in Navigation</Label>
                  <p className="text-xs text-gray-500">Include in main navigation menu</p>
                </div>
                <Switch
                  checked={pageSettings.showInNavigation}
                  onCheckedChange={(checked) => onSettingChange('showInNavigation', checked)}
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Indexing</Label>
                  <p className="text-xs text-gray-500">Allow search engines to index this page</p>
                </div>
                <Switch
                  checked={pageSettings.allowIndexing}
                  onCheckedChange={(checked) => onSettingChange('allowIndexing', checked)}
                  disabled={isLoading || isSaving}
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
                  onCheckedChange={(checked) => onSettingChange('requireAuth', checked)}
                  disabled={isLoading || isSaving}
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
                  onChange={(e) => onSettingChange('customCSS', e.target.value)}
                  disabled={isLoading || isSaving}
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
                  onChange={(e) => onSettingChange('customJS', e.target.value)}
                  disabled={isLoading || isSaving}
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
                  onChange={(e) => onSettingChange('headCode', e.target.value)}
                  disabled={isLoading || isSaving}
                  rows={4}
                  className="w-full font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? (
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
  );
});

/**
 * Main EditorToolbar Component (Senior-Level Optimization)
 * 
 * Features:
 * - Clean separation of concerns with memoized sub-components
 * - Efficient state management with useCallback and useMemo
 * - Keyboard shortcuts (Ctrl+Shift+S, Ctrl+Shift+O)
 * - Responsive design for mobile/tablet
 * - Proper loading and error handling
 * - Better performance with memoized components
 * 
 * Optimizations:
 * - Memoized sub-components prevent unnecessary re-renders
 * - useCallback for stable event handler references
 * - Efficient Apollo query management
 * - Keyboard event listener cleanup
 * - Better state isolation with local state
 */
export function EditorToolbar(props: EditorToolbarProps) {
  const {
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
  } = props;

  const { toast } = useToast();
  const { addTemplate, importFromJSON } = useTemplates();

  // ===== Dialog State =====
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  // ===== Global Settings State (Developer-focused only) =====
  const [pageSettings, setPageSettings] = useState({
    // SEO Settings
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    // Page Options
    isPublished: true,
    showInNavigation: true,
    allowIndexing: true,
    requireAuth: false,
    // Custom Code
    customCSS: '',
    customJS: '',
    headCode: '',
  });

  // ===== GraphQL Query =====
  const { data: pageData } = useQuery(GET_PAGE_BY_ID, {
    variables: { id: pageId },
    skip: !pageId,
    errorPolicy: 'all',
  });

  // ===== Keyboard Shortcuts =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsSaveDialogOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        setIsImportDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ===== Sync Page Data (Developer Settings Only) =====
  useEffect(() => {
    if (pageData?.getPageById) {
      const page = pageData.getPageById;
      setPageSettings((prev) => ({
        ...prev,
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        seoKeywords: Array.isArray(page.seoKeywords) ? page.seoKeywords.join(', ') : '',
      }));
    }
  }, [pageData]);

  // ===== Memoized Event Handlers =====
  const handleSettingChange = useCallback((field: string, value: any) => {
    setPageSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveTemplate = useCallback(
    async (template: PageTemplate) => {
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
    },
    [addTemplate, toast]
  );

  const handleImportTemplate = useCallback(
    async (data: ImportTemplateData) => {
      try {
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
    },
    [importFromJSON, toast]
  );

  const handleSaveSettings = useCallback(async () => {
    try {
      if (onSettingsSave) {
        setIsSettingsLoading(true);
        await onSettingsSave(pageSettings);
        toast({
          title: 'Settings saved',
          description: 'Global settings have been updated successfully.',
          type: 'success',
        });
        setIsSettingsOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSettingsLoading(false);
    }
  }, [onSettingsSave, pageSettings, toast]);

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4 overflow-x-auto">
      {/* Left Section - Logo & Mode */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="font-bold text-lg text-primary hidden sm:block">
          Kata Builder
        </div>

        <ToolbarModeSection editorMode={editorMode} onModeChange={onModeChange} />
      </div>

      {/* Center Section - Device Preview */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ToolbarDeviceSection device={device} onDeviceChange={onDeviceChange} />
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
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

        {/* Templates Menu */}
        <TemplatesMenu
          onSaveClick={() => setIsSaveDialogOpen(true)}
          onImportClick={() => setIsImportDialogOpen(true)}
        />

        {/* Save */}
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          className="gap-2"
          disabled={isLoading}
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">{isLoading ? 'Saving...' : 'Save'}</span>
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
      <GlobalSettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        pageSettings={pageSettings}
        onSettingChange={handleSettingChange}
        isLoading={isLoading || isSettingsLoading}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
