/**
 * Custom Hook: useDataValidation
 * Handles all data validation logic
 */

import { useCallback } from 'react';
import { DynamicBlockConfig } from '@/types/page-builder';
import { validateJSON, validateLimit } from './validationUtils';

interface UseDataValidationParams {
  editConfig: DynamicBlockConfig;
  onConfigChange: (config: DynamicBlockConfig) => void;
  onDataChange: (data: any) => void;
  // Static Data
  onStaticDataError: (error: string | null, hasError: boolean) => void;
  // Repeater Data
  onRepeaterDataError: (error: string | null, hasError: boolean, items: any[]) => void;
  // Limit
  onLimitError: (error: string | null, hasError: boolean) => void;
}

export function useDataValidation({
  editConfig,
  onConfigChange,
  onDataChange,
  onStaticDataError,
  onRepeaterDataError,
  onLimitError,
}: UseDataValidationParams) {
  /**
   * Validate and save static data
   */
  const validateAndSaveStaticData = useCallback(
    (jsonText: string) => {
      const validation = validateJSON(jsonText, false);

      if (!validation.isValid) {
        onStaticDataError(validation.error || 'Invalid JSON', true);
        return;
      }

      // Update config and data
      onConfigChange({
        ...editConfig,
        dataSource: {
          ...editConfig.dataSource,
          type: 'static',
          staticData: validation.data,
        },
      });

      onDataChange(validation.data);
      onStaticDataError(null, false);
    },
    [editConfig, onConfigChange, onDataChange, onStaticDataError]
  );

  /**
   * Validate and save repeater data
   */
  const validateAndSaveRepeaterData = useCallback(
    (jsonText: string) => {
      const validation = validateJSON(jsonText, true);

      if (!validation.isValid) {
        onRepeaterDataError(validation.error || 'Invalid JSON', true, []);
        return;
      }

      const items = validation.data as any[];

      onConfigChange({
        ...editConfig,
        repeater: {
          ...editConfig.repeater,
          data: items,
          enabled: editConfig.repeater?.enabled ?? true,
        },
      });

      onRepeaterDataError(null, false, items);
    },
    [editConfig, onConfigChange, onRepeaterDataError]
  );

  /**
   * Validate and save limit
   */
  const validateAndSaveLimit = useCallback(
    (limitStr: string) => {
      const validation = validateLimit(limitStr);

      if (!validation.isValid) {
        onLimitError(validation.error || 'Invalid limit', true);
        return;
      }

      onConfigChange({
        ...editConfig,
        repeater: {
          ...editConfig.repeater,
          enabled: true,
          limit: validation.value || undefined,
        },
      });

      onLimitError(null, false);
    },
    [editConfig, onConfigChange, onLimitError]
  );

  return {
    validateAndSaveStaticData,
    validateAndSaveRepeaterData,
    validateAndSaveLimit,
  };
}
