/**
 * Page Builder - Page Layout Hook
 * Clean Architecture - Application Layer
 * 
 * Hook quản lý layout settings cho page (header/footer customization)
 */

'use client';

import { useCallback, useMemo } from 'react';
import { PageLayoutSettings } from '@/types/page-builder';

interface UsePageLayoutOptions {
  initialSettings?: PageLayoutSettings;
  onChange?: (settings: PageLayoutSettings) => void;
}

interface UsePageLayoutResult {
  settings: PageLayoutSettings;
  updateSetting: <K extends keyof PageLayoutSettings>(
    key: K,
    value: PageLayoutSettings[K]
  ) => void;
  toggleHeader: () => void;
  toggleFooter: () => void;
  setHeaderMenu: (menuId: string | null) => void;
  setFooterMenu: (menuId: string | null) => void;
  setHeaderStyle: (style: PageLayoutSettings['headerStyle']) => void;
  setFooterStyle: (style: PageLayoutSettings['footerStyle']) => void;
  resetSettings: () => void;
  hasCustomSettings: boolean;
}

const DEFAULT_SETTINGS: PageLayoutSettings = {
  hasHeader: true,
  hasFooter: true,
  headerMenuId: null,
  footerMenuId: null,
  headerStyle: 'default',
  footerStyle: 'default',
  headerVariant: 'default',
  footerVariant: 'default',
};

/**
 * Hook quản lý page layout settings với optimizations
 */
export function usePageLayout(options: UsePageLayoutOptions = {}): UsePageLayoutResult {
  const { initialSettings, onChange } = options;

  const settings = useMemo<PageLayoutSettings>(() => {
    return {
      ...DEFAULT_SETTINGS,
      ...initialSettings,
    };
  }, [initialSettings]);

  const updateSetting = useCallback(
    <K extends keyof PageLayoutSettings>(
      key: K,
      value: PageLayoutSettings[K]
    ) => {
      const newSettings = {
        ...settings,
        [key]: value,
      };
      onChange?.(newSettings);
    },
    [settings, onChange]
  );

  const toggleHeader = useCallback(() => {
    updateSetting('hasHeader', !settings.hasHeader);
  }, [settings.hasHeader, updateSetting]);

  const toggleFooter = useCallback(() => {
    updateSetting('hasFooter', !settings.hasFooter);
  }, [settings.hasFooter, updateSetting]);

  const setHeaderMenu = useCallback(
    (menuId: string | null) => {
      updateSetting('headerMenuId', menuId);
    },
    [updateSetting]
  );

  const setFooterMenu = useCallback(
    (menuId: string | null) => {
      updateSetting('footerMenuId', menuId);
    },
    [updateSetting]
  );

  const setHeaderStyle = useCallback(
    (style: PageLayoutSettings['headerStyle']) => {
      updateSetting('headerStyle', style);
    },
    [updateSetting]
  );

  const setFooterStyle = useCallback(
    (style: PageLayoutSettings['footerStyle']) => {
      updateSetting('footerStyle', style);
    },
    [updateSetting]
  );

  const resetSettings = useCallback(() => {
    onChange?.(DEFAULT_SETTINGS);
  }, [onChange]);

  const hasCustomSettings = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);
  }, [settings]);

  return {
    settings,
    updateSetting,
    toggleHeader,
    toggleFooter,
    setHeaderMenu,
    setFooterMenu,
    setHeaderStyle,
    setFooterStyle,
    resetSettings,
    hasCustomSettings,
  };
}
