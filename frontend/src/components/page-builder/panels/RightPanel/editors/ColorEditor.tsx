'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResponsiveToggle, ResponsiveIndicator } from '../../../components/ResponsiveToggle';
import { Device, ResponsiveValue } from '../../../types/responsive';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';

// Storage format (with ResponsiveValue)
interface ColorSettingsStorage {
  textColor?: string | ResponsiveValue<string>;
  backgroundColor?: string | ResponsiveValue<string>;
  borderColor?: string | ResponsiveValue<string>;
  opacity?: number | ResponsiveValue<number>;
}

// Resolved format (without ResponsiveValue, actual values)
interface ColorSettings {
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  opacity?: number;
}

interface ColorEditorProps {
  settings: ColorSettingsStorage;
  onChange: (settings: ColorSettingsStorage) => void;
  device?: Device;
}

const colorPresets = [
  { name: 'Primary', color: '#3b82f6' },
  { name: 'Secondary', color: '#8b5cf6' },
  { name: 'Success', color: '#10b981' },
  { name: 'Warning', color: '#f59e0b' },
  { name: 'Danger', color: '#ef4444' },
  { name: 'Dark', color: '#1f2937' },
  { name: 'Light', color: '#f3f4f6' },
  { name: 'White', color: '#ffffff' },
  { name: 'Black', color: '#000000' },
  { name: 'Transparent', color: 'transparent' },
];

export function ColorEditor({ settings, onChange, device = 'desktop' }: ColorEditorProps) {
  const [isResponsive, setIsResponsive] = useState(false);

  // Convert settings to responsive format
  const initialValues = Object.keys(settings).reduce((acc, key) => {
    const value = settings[key as keyof ColorSettingsStorage];
    if (value && typeof value === 'object' && 'desktop' in value) {
      acc[key as keyof ColorSettings] = value;
    } else if (value !== undefined) {
      acc[key as keyof ColorSettings] = { desktop: value };
    }
    return acc;
  }, {} as any);

  const {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    getOverrides,
  } = useResponsiveStyles<ColorSettings>({
    device,
    initialValues,
    isResponsive,
  });

  // Sync changes back to parent
  React.useEffect(() => {
    const newSettings: ColorSettingsStorage = {};
    Object.keys(responsiveValues).forEach((key) => {
      const k = key as keyof ColorSettings;
      newSettings[k] = responsiveValues[k] as any;
    });
    onChange(newSettings);
  }, [responsiveValues, onChange]);

  const updateSetting = (key: keyof ColorSettings, value: any) => {
    if (isResponsive) {
      updateValue(key, value);
    } else {
      updateValueAllDevices(key, value);
    }
  };

  const renderColorInput = (
    label: string,
    key: keyof ColorSettings,
    currentValue: string | undefined
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {isResponsive && (
          <ResponsiveIndicator
            hasOverride={getOverrides(key)[device] || false}
            device={device}
          />
        )}
      </div>
      
      {/* Color Presets */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {colorPresets.map((preset) => (
          <button
            key={preset.name}
            className="w-full aspect-square rounded border-2 hover:border-primary transition-colors"
            style={{
              backgroundColor: preset.color,
              borderColor: currentValue === preset.color ? '#3b82f6' : '#e5e7eb',
            }}
            onClick={() => updateSetting(key, preset.color)}
            title={preset.name}
          />
        ))}
      </div>

      {/* Color Picker + Hex Input */}
      <div className="flex gap-2">
        <Input
          type="color"
          value={currentValue || '#000000'}
          onChange={(e) => updateSetting(key, e.target.value)}
          className="w-20 h-10 p-1 cursor-pointer"
        />
        <Input
          type="text"
          value={currentValue || ''}
          onChange={(e) => updateSetting(key, e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Responsive Toggle */}
      <ResponsiveToggle
        device={device}
        isResponsive={isResponsive}
        onToggle={setIsResponsive}
        hasOverrides={{
          desktop: getOverrides('textColor').desktop || getOverrides('backgroundColor').desktop || getOverrides('borderColor').desktop,
          tablet: getOverrides('textColor').tablet || getOverrides('backgroundColor').tablet || getOverrides('borderColor').tablet,
          mobile: getOverrides('textColor').mobile || getOverrides('backgroundColor').mobile || getOverrides('borderColor').mobile,
        }}
        label="Colors"
      />

      {/* Text Color */}
      {renderColorInput('Text Color', 'textColor', currentValues.textColor)}

      {/* Background Color */}
      {renderColorInput('Background Color', 'backgroundColor', currentValues.backgroundColor)}

      {/* Border Color */}
      {renderColorInput('Border Color', 'borderColor', currentValues.borderColor)}

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Opacity</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{currentValues.opacity || 100}%</span>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('opacity')[device] || false}
                device={device}
              />
            )}
          </div>
        </div>
        <Input
          type="range"
          min={0}
          max={100}
          step={5}
          value={currentValues.opacity || 100}
          onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
