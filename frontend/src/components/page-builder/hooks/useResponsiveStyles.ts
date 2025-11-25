/**
 * useResponsiveStyles Hook
 * 
 * Manages responsive style state with device-specific overrides
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Device,
  ResponsiveValue,
  ResponsiveStyleSettings,
  mergeResponsiveValue,
  updateResponsiveValue,
  hasResponsiveOverride,
} from '../types/responsive';

interface UseResponsiveStylesOptions<T> {
  /**
   * Current device being edited
   */
  device: Device;
  
  /**
   * Initial responsive values
   */
  initialValues?: Partial<Record<keyof T, ResponsiveValue<any>>>;
  
  /**
   * Whether responsive mode is enabled (device-specific)
   */
  isResponsive?: boolean;
}

interface UseResponsiveStylesReturn<T> {
  /**
   * Current values for the active device (merged with inheritance)
   */
  currentValues: Partial<T>;
  
  /**
   * Raw responsive values (all devices)
   */
  responsiveValues: Partial<Record<keyof T, ResponsiveValue<any>>>;
  
  /**
   * Update a value for the current device
   */
  updateValue: <K extends keyof T>(key: K, value: T[K] | undefined) => void;
  
  /**
   * Update a value for all devices (reset responsive overrides)
   */
  updateValueAllDevices: <K extends keyof T>(key: K, value: T[K] | undefined) => void;
  
  /**
   * Check if a key has device-specific override
   */
  hasOverride: <K extends keyof T>(key: K) => boolean;
  
  /**
   * Get all overrides for a key
   */
  getOverrides: <K extends keyof T>(key: K) => { desktop?: boolean; tablet?: boolean; mobile?: boolean };
  
  /**
   * Clear device-specific override for a key
   */
  clearOverride: <K extends keyof T>(key: K, targetDevice?: Device) => void;
}

export function useResponsiveStyles<T = any>({
  device,
  initialValues = {},
  isResponsive = false,
}: UseResponsiveStylesOptions<T>): UseResponsiveStylesReturn<T> {
  const [responsiveValues, setResponsiveValues] = useState<
    Partial<Record<keyof T, ResponsiveValue<any>>>
  >(initialValues);

  /**
   * Get current values for the active device (with inheritance)
   * Returns actual values, not ResponsiveValue wrappers
   */
  const currentValues: Partial<T> = useMemo(() => {
    return Object.keys(responsiveValues).reduce((acc, key) => {
      const k = key as keyof T;
      const responsiveValue = responsiveValues[k];
      const mergedValue = mergeResponsiveValue(responsiveValue, device);
      
      if (mergedValue !== undefined) {
        acc[k] = mergedValue as T[keyof T];
      }
      
      return acc;
    }, {} as Partial<T>);
  }, [responsiveValues, device]);

  /**
   * Update a value for the current device
   */
  const updateValue = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) => {
      setResponsiveValues((prev) => {
        const currentResponsiveValue = prev[key];
        
        if (isResponsive) {
          // Device-specific mode: only update current device
          const updated = updateResponsiveValue(currentResponsiveValue, device, value);
          return { ...prev, [key]: updated };
        } else {
          // All-devices mode: set desktop value, clear others
          return {
            ...prev,
            [key]: { desktop: value } as ResponsiveValue<any>,
          };
        }
      });
    },
    [device, isResponsive]
  );

  /**
   * Update a value for all devices (reset responsive overrides)
   */
  const updateValueAllDevices = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) => {
      setResponsiveValues((prev) => ({
        ...prev,
        [key]: { desktop: value } as ResponsiveValue<any>,
      }));
    },
    []
  );

  /**
   * Check if a key has device-specific override
   */
  const hasOverride = useCallback(
    <K extends keyof T>(key: K): boolean => {
      const responsiveValue = responsiveValues[key];
      return hasResponsiveOverride(responsiveValue, device);
    },
    [responsiveValues, device]
  );

  /**
   * Get all overrides for a key
   */
  const getOverrides = useCallback(
    <K extends keyof T>(key: K) => {
      const responsiveValue = responsiveValues[key];
      if (!responsiveValue) {
        return { desktop: false, tablet: false, mobile: false };
      }

      return {
        desktop: responsiveValue.desktop !== undefined,
        tablet: responsiveValue.tablet !== undefined,
        mobile: responsiveValue.mobile !== undefined,
      };
    },
    [responsiveValues]
  );

  /**
   * Clear device-specific override for a key
   */
  const clearOverride = useCallback(
    <K extends keyof T>(key: K, targetDevice: Device = device) => {
      setResponsiveValues((prev) => {
        const current = prev[key];
        if (!current) return prev;

        const updated = { ...current };
        delete updated[targetDevice];

        return { ...prev, [key]: updated };
      });
    },
    [device]
  );

  return {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    hasOverride,
    getOverrides,
    clearOverride,
  };
}

/**
 * Simple hook for a single responsive value
 */
export function useResponsiveValue<T>(
  initialValue: ResponsiveValue<T> | undefined,
  device: Device,
  isResponsive: boolean = false
) {
  const [responsiveValue, setResponsiveValue] = useState<ResponsiveValue<T> | undefined>(
    initialValue
  );

  const currentValue = mergeResponsiveValue(responsiveValue, device);

  const updateValue = useCallback(
    (value: T | undefined) => {
      if (isResponsive) {
        setResponsiveValue((prev) => updateResponsiveValue(prev, device, value));
      } else {
        setResponsiveValue({ desktop: value });
      }
    },
    [device, isResponsive]
  );

  const hasOverride = hasResponsiveOverride(responsiveValue, device);

  return {
    currentValue,
    responsiveValue,
    updateValue,
    hasOverride,
  };
}
