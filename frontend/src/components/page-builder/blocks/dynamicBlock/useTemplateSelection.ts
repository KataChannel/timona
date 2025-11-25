/**
 * Custom Hook: useTemplateSelection
 * Handles template selection and initialization logic
 */

import { useCallback } from 'react';
import { DynamicBlockConfig } from '@/types/page-builder';

interface UseTemplateSelectionParams {
  onConfigChange: (config: DynamicBlockConfig) => void;
  onTemplateChange: (template: string) => void;
  onSelectedTemplateChange: (template: any) => void;
  onDataChange: (data: any) => void;
  onErrorsReset: () => void;
}

export function useTemplateSelection({
  onConfigChange,
  onTemplateChange,
  onSelectedTemplateChange,
  onDataChange,
  onErrorsReset,
}: UseTemplateSelectionParams) {
  /**
   * Handle template selection
   */
  const handleSelectTemplate = useCallback(
    (template: any) => {
      // Validate template structure
      if (!template || !template.id) {
        console.warn('Invalid template structure');
        return;
      }      
      // Select the template
      onSelectedTemplateChange(template);
      onTemplateChange(template.template);

      // Create new config with deep copy
      const newConfig: DynamicBlockConfig = {
        templateId: template.id,
        templateName: template.name,
        dataSource: {
          type: template.dataSource?.type || 'static',
          staticData: template.dataSource?.staticData
            ? JSON.parse(JSON.stringify(template.dataSource.staticData))
            : undefined,
          endpoint: template.dataSource?.endpoint,
          query: template.dataSource?.query,
          variables: template.dataSource?.variables
            ? JSON.parse(JSON.stringify(template.dataSource.variables))
            : undefined,
        },
        variables: template.variables 
          ? JSON.parse(JSON.stringify(template.variables))
          : {},
      };

      onConfigChange(newConfig);

      // Update preview data
      if (newConfig.dataSource?.type === 'static' && newConfig.dataSource?.staticData) {
        onDataChange(newConfig.dataSource.staticData);
      }

      // Reset validation errors
      onErrorsReset();
    },
    [onConfigChange, onTemplateChange, onSelectedTemplateChange, onDataChange, onErrorsReset]
  );

  /**
   * Handle blank template selection
   */
  const handleSelectBlankTemplate = useCallback(
    (currentConfig: DynamicBlockConfig) => {
      const blankConfig: DynamicBlockConfig = {
        ...currentConfig,
        templateId: undefined,
        templateName: 'Custom Template',
        dataSource: { type: 'static', staticData: {} },
        variables: {},
      };

      onSelectedTemplateChange(null);
      onTemplateChange('');
      onConfigChange(blankConfig);
      onErrorsReset();
    },
    [onConfigChange, onTemplateChange, onSelectedTemplateChange, onErrorsReset]
  );

  return {
    handleSelectTemplate,
    handleSelectBlankTemplate,
  };
}
