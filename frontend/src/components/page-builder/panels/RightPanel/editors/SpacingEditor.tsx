'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, Unlink } from 'lucide-react';
import { ResponsiveToggle, ResponsiveIndicator } from '../../../components/ResponsiveToggle';
import { Device, ResponsiveValue } from '../../../types/responsive';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';

interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Storage format (with ResponsiveValue)
interface SpacingSettingsStorage {
  margin?: SpacingValue | ResponsiveValue<SpacingValue>;
  padding?: SpacingValue | ResponsiveValue<SpacingValue>;
  gap?: number | ResponsiveValue<number>;
}

// Resolved format (without ResponsiveValue, actual values)
interface SpacingSettings {
  margin?: SpacingValue;
  padding?: SpacingValue;
  gap?: number;
}

interface SpacingEditorProps {
  settings: SpacingSettingsStorage;
  onChange: (settings: SpacingSettingsStorage) => void;
  device?: Device;
}

const defaultSpacing: SpacingValue = { top: 0, right: 0, bottom: 0, left: 0 };

export function SpacingEditor({ settings, onChange, device = 'desktop' }: SpacingEditorProps) {
  const [marginLinked, setMarginLinked] = useState(true);
  const [paddingLinked, setPaddingLinked] = useState(true);
  const [isResponsive, setIsResponsive] = useState(false);

  // Convert settings to responsive format
  const initialValues = Object.keys(settings).reduce((acc, key) => {
    const value = settings[key as keyof SpacingSettingsStorage];
    if (value && typeof value === 'object' && 'desktop' in value) {
      acc[key as keyof SpacingSettings] = value;
    } else if (value !== undefined) {
      acc[key as keyof SpacingSettings] = { desktop: value };
    }
    return acc;
  }, {} as any);

  const {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    getOverrides,
  } = useResponsiveStyles<SpacingSettings>({
    device,
    initialValues,
    isResponsive,
  });

  // Sync changes back to parent
  React.useEffect(() => {
    const newSettings: SpacingSettingsStorage = {};
    Object.keys(responsiveValues).forEach((key) => {
      const k = key as keyof SpacingSettings;
      newSettings[k] = responsiveValues[k] as any;
    });
    onChange(newSettings);
  }, [responsiveValues, onChange]);

  const updateSetting = (key: keyof SpacingSettings, value: any) => {
    if (isResponsive) {
      updateValue(key, value);
    } else {
      updateValueAllDevices(key, value);
    }
  };

  const updateSpacing = (
    type: 'margin' | 'padding',
    side: keyof SpacingValue,
    value: number,
    linked: boolean
  ) => {
    const currentValue = currentValues[type] || defaultSpacing;
    
    if (linked) {
      // Update all sides
      updateSetting(type, {
        top: value,
        right: value,
        bottom: value,
        left: value,
      });
    } else {
      // Update single side
      updateSetting(type, {
        ...currentValue,
        [side]: value,
      });
    }
  };

  const renderSpacingControl = (
    label: string,
    type: 'margin' | 'padding',
    linked: boolean,
    setLinked: (linked: boolean) => void
  ) => {
    const value = currentValues[type] || defaultSpacing;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>{label}</Label>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides(type)[device] || false}
                device={device}
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setLinked(!linked)}
          >
            {linked ? (
              <Link className="w-4 h-4" />
            ) : (
              <Unlink className="w-4 h-4" />
            )}
          </Button>
        </div>

        {linked ? (
          // Single input when linked
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>All Sides</span>
              <span>{value.top}px</span>
            </div>
            <Input
              type="range"
              min={0}
              max={100}
              step={4}
              value={value.top}
              onChange={(e) =>
                updateSpacing(type, 'top', parseInt(e.target.value), linked)
              }
              className="w-full"
            />
          </div>
        ) : (
          // Individual inputs when unlinked
          <div className="space-y-2">
            {/* Top */}
            <div className="flex items-center gap-2">
              <span className="text-xs w-12 text-gray-500">Top</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={value.top}
                onChange={(e) =>
                  updateSpacing(type, 'top', parseInt(e.target.value) || 0, linked)
                }
                className="flex-1 h-8"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <span className="text-xs w-12 text-gray-500">Right</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={value.right}
                onChange={(e) =>
                  updateSpacing(type, 'right', parseInt(e.target.value) || 0, linked)
                }
                className="flex-1 h-8"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>

            {/* Bottom */}
            <div className="flex items-center gap-2">
              <span className="text-xs w-12 text-gray-500">Bottom</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={value.bottom}
                onChange={(e) =>
                  updateSpacing(type, 'bottom', parseInt(e.target.value) || 0, linked)
                }
                className="flex-1 h-8"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>

            {/* Left */}
            <div className="flex items-center gap-2">
              <span className="text-xs w-12 text-gray-500">Left</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={value.left}
                onChange={(e) =>
                  updateSpacing(type, 'left', parseInt(e.target.value) || 0, linked)
                }
                className="flex-1 h-8"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          </div>
        )}

        {/* Visual Box Model */}
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <div className="text-center text-xs font-mono text-gray-600">
            {value.top}px {value.right}px {value.bottom}px {value.left}px
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Responsive Toggle */}
      <ResponsiveToggle
        device={device}
        isResponsive={isResponsive}
        onToggle={setIsResponsive}
        hasOverrides={{
          desktop: getOverrides('margin').desktop || getOverrides('padding').desktop || getOverrides('gap').desktop,
          tablet: getOverrides('margin').tablet || getOverrides('padding').tablet || getOverrides('gap').tablet,
          mobile: getOverrides('margin').mobile || getOverrides('padding').mobile || getOverrides('gap').mobile,
        }}
        label="Spacing"
      />

      {/* Margin */}
      {renderSpacingControl('Margin', 'margin', marginLinked, setMarginLinked)}

      <div className="border-t border-gray-200" />

      {/* Padding */}
      {renderSpacingControl('Padding', 'padding', paddingLinked, setPaddingLinked)}

      <div className="border-t border-gray-200" />

      {/* Gap (for flex/grid) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Gap (Flex/Grid)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{currentValues.gap || 0}px</span>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('gap')[device] || false}
                device={device}
              />
            )}
          </div>
        </div>
        <Input
          type="range"
          min={0}
          max={50}
          step={2}
          value={currentValues.gap || 0}
          onChange={(e) => updateSetting('gap', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
