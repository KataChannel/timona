'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import { BLOCK_TEMPLATES, BlockTemplate } from '@/data/blockTemplates';
import { 
  CustomTemplatesService,
  initCustomTemplatesService,
  TemplateBlocksData,
  CreateTemplateInput,
} from '@/utils/customTemplates';

/**
 * Template Context - Manages template state and operations
 * NOW WITH DATABASE STORAGE - Uses GraphQL for persistence
 */
interface TemplateContextType {
  // Template state
  allTemplates: BlockTemplate[];
  customTemplates: TemplateBlocksData[];
  selectedTemplate: BlockTemplate | null;
  templateSearchQuery: string;
  selectedTemplateCategory: string;
  showPreviewModal: boolean;
  isApplyingTemplate: boolean;
  showSaveTemplateDialog: boolean;
  isSavingTemplate: boolean;
  isLoadingTemplates: boolean;
  
  // State setters
  setTemplateSearchQuery: (query: string) => void;
  setSelectedTemplateCategory: (category: string) => void;
  setShowPreviewModal: (show: boolean) => void;
  setSelectedTemplate: (template: BlockTemplate | null) => void;
  setIsApplyingTemplate: (applying: boolean) => void;
  setShowSaveTemplateDialog: (show: boolean) => void;
  setIsSavingTemplate: (saving: boolean) => void;
  
  // Template operations
  handlePreviewTemplate: (template: BlockTemplate) => void;
  handleClosePreview: () => void;
  handleSaveAsTemplate: (template: CreateTemplateInput) => Promise<void>;
  handleDeleteCustomTemplate: (id: string) => Promise<void>;
  handleDuplicateTemplate: (id: string, newName?: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

interface TemplateProviderProps {
  children: ReactNode;
}

export function TemplateProvider({ children }: TemplateProviderProps) {
  // Get Apollo client for GraphQL operations
  const apolloClient = useApolloClient();
  
  // Initialize service on mount
  useEffect(() => {
    initCustomTemplatesService(apolloClient as any);
  }, [apolloClient]);
  
  // Template state
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BlockTemplate | null>(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<TemplateBlocksData[]>([]);
  const [allTemplates, setAllTemplates] = useState<BlockTemplate[]>(BLOCK_TEMPLATES);
  
  // Load custom templates from database
  const refreshTemplates = React.useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      
      // Initialize service
      const service = new CustomTemplatesService(apolloClient as any);
      
      // Note: initSampleTemplates requires client and userId - should be called elsewhere
      // in a hook that has access to current user context
      
      const custom = await service.getMyTemplates();
      
      setCustomTemplates(custom);
      
      // Merge with default templates
      const merged: BlockTemplate[] = [
        ...BLOCK_TEMPLATES,
        ...custom.map((ct: TemplateBlocksData) => ({
          id: ct.id,
          name: ct.name,
          description: ct.description,
          category: ct.category as any,
          thumbnail: ct.thumbnail || '/placeholder-template.png',
          blocks: [], // Will be loaded on demand
          isCustom: true,
        })),
      ];
      
      setAllTemplates(merged);
    } catch (error) {
      console.error('Error loading templates from database:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [apolloClient]);
  
  // Load custom templates on mount
  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);
  
  // Template operations
  const handlePreviewTemplate = React.useCallback((template: BlockTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  }, []);
  
  const handleClosePreview = React.useCallback(() => {
    setShowPreviewModal(false);
    setSelectedTemplate(null);
  }, []);
  
  // Save new template to database
  const handleSaveAsTemplate = React.useCallback(async (template: CreateTemplateInput) => {
    try {
      setIsSavingTemplate(true);
      
      const service = new CustomTemplatesService(apolloClient as any);
      await service.createTemplate(template);
      
      console.log(`Template "${template.name}" saved successfully!`);
      
      // Refresh templates list
      await refreshTemplates();
      setShowSaveTemplateDialog(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSavingTemplate(false);
    }
  }, [apolloClient, refreshTemplates]);
  
  // Delete template from database
  const handleDeleteCustomTemplate = React.useCallback(async (id: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this template?');
      if (!confirmed) return;
      
      const service = new CustomTemplatesService(apolloClient as any);
      await service.deleteTemplate(id);
      
      console.log('Template deleted successfully');
      
      // Refresh templates list
      await refreshTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  }, [apolloClient, refreshTemplates]);
  
  // Duplicate template
  const handleDuplicateTemplate = React.useCallback(async (id: string, newName?: string) => {
    try {
      const service = new CustomTemplatesService(apolloClient as any);
      await service.duplicateTemplate(id, newName);
      
      console.log('Template duplicated successfully');
      
      // Refresh templates list
      await refreshTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  }, [apolloClient, refreshTemplates]);
  
  const value: TemplateContextType = {
    allTemplates,
    customTemplates,
    selectedTemplate,
    templateSearchQuery,
    selectedTemplateCategory,
    showPreviewModal,
    isApplyingTemplate,
    showSaveTemplateDialog,
    isSavingTemplate,
    isLoadingTemplates,
    setTemplateSearchQuery,
    setSelectedTemplateCategory,
    setShowPreviewModal,
    setSelectedTemplate,
    setIsApplyingTemplate,
    setShowSaveTemplateDialog,
    setIsSavingTemplate,
    handlePreviewTemplate,
    handleClosePreview,
    handleSaveAsTemplate,
    handleDeleteCustomTemplate,
    handleDuplicateTemplate,
    refreshTemplates,
  };
  
  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    // Return default values instead of throwing during SSR or initial render
    if (typeof window === 'undefined') {
      return {
        allTemplates: [],
        customTemplates: [],
        selectedTemplate: null,
        templateSearchQuery: '',
        selectedTemplateCategory: 'all',
        showPreviewModal: false,
        isApplyingTemplate: false,
        showSaveTemplateDialog: false,
        isSavingTemplate: false,
        isLoadingTemplates: false,
        setTemplateSearchQuery: () => {},
        setSelectedTemplateCategory: () => {},
        setShowPreviewModal: () => {},
        setSelectedTemplate: () => {},
        setIsApplyingTemplate: () => {},
        setShowSaveTemplateDialog: () => {},
        setIsSavingTemplate: () => {},
        handlePreviewTemplate: () => {},
        handleClosePreview: () => {},
        handleSaveAsTemplate: async () => {},
        handleDeleteCustomTemplate: async () => {},
        handleDuplicateTemplate: async () => {},
        refreshTemplates: async () => {},
      } as TemplateContextType;
    }
    throw new Error(
      'useTemplate must be used within a TemplateProvider. ' +
      'Make sure your component is wrapped with <PageBuilderProvider>'
    );
  }
  return context;
}
