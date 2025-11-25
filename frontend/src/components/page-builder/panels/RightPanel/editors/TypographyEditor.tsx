'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { ResponsiveToggle, ResponsiveIndicator } from '../../../components/ResponsiveToggle';
import { Device, ResponsiveValue } from '../../../types/responsive';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';

// Storage format (with ResponsiveValue)
interface TypographySettingsStorage {
  fontFamily?: string | ResponsiveValue<string>;
  fontSize?: number | ResponsiveValue<number>;
  fontWeight?: number | ResponsiveValue<number>;
  lineHeight?: number | ResponsiveValue<number>;
  letterSpacing?: number | ResponsiveValue<number>;
  textAlign?: ('left' | 'center' | 'right' | 'justify') | ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
  textTransform?: ('none' | 'uppercase' | 'lowercase' | 'capitalize') | ResponsiveValue<'none' | 'uppercase' | 'lowercase' | 'capitalize'>;
  textDecoration?: ('none' | 'underline' | 'line-through') | ResponsiveValue<'none' | 'underline' | 'line-through'>;
}

// Resolved format (without ResponsiveValue, actual values)
interface TypographySettings {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

interface TypographyEditorProps {
  settings: TypographySettingsStorage;
  onChange: (settings: TypographySettingsStorage) => void;
  device?: Device;
}

const fontFamilies = [
  { value: 'system-ui', label: 'System UI' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
];

const fontWeights = [
  { value: 100, label: 'Thin (100)' },
  { value: 200, label: 'Extra Light (200)' },
  { value: 300, label: 'Light (300)' },
  { value: 400, label: 'Normal (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi Bold (600)' },
  { value: 700, label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
  { value: 900, label: 'Black (900)' },
];

export function TypographyEditor({ settings, onChange, device = 'desktop' }: TypographyEditorProps) {
  const [isResponsive, setIsResponsive] = useState(false);

  // Convert settings to responsive format
  const initialValues = Object.keys(settings).reduce((acc, key) => {
    const value = settings[key as keyof TypographySettingsStorage];
    // If already responsive, keep it; otherwise wrap in desktop
    if (value && typeof value === 'object' && 'desktop' in value) {
      acc[key as keyof TypographySettings] = value;
    } else if (value !== undefined) {
      acc[key as keyof TypographySettings] = { desktop: value };
    }
    return acc;
  }, {} as any);

  const {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    getOverrides,
  } = useResponsiveStyles<TypographySettings>({
    device,
    initialValues,
    isResponsive,
  });

  // Sync changes back to parent
  React.useEffect(() => {
    const newSettings: TypographySettingsStorage = {};
    Object.keys(responsiveValues).forEach((key) => {
      const k = key as keyof TypographySettings;
      newSettings[k] = responsiveValues[k] as any;
    });
    onChange(newSettings);
  }, [responsiveValues, onChange]);

  const updateSetting = (key: keyof TypographySettings, value: any) => {
    if (isResponsive) {
      updateValue(key, value);
    } else {
      updateValueAllDevices(key, value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Responsive Toggle */}
      <ResponsiveToggle
        device={device}
        isResponsive={isResponsive}
        onToggle={setIsResponsive}
        hasOverrides={{
          desktop: getOverrides('fontSize').desktop,
          tablet: getOverrides('fontSize').tablet,
          mobile: getOverrides('fontSize').mobile,
        }}
        label="Typography"
      />

      {/* Font Family */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Font Family</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('fontFamily')[device] || false}
              device={device}
            />
          )}
        </div>
        <Select
          value={currentValues.fontFamily || 'system-ui'}
          onValueChange={(value) => updateSetting('fontFamily', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Font Size</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{currentValues.fontSize || 16}px</span>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('fontSize')[device] || false}
                device={device}
              />
            )}
          </div>
        </div>
        <Input
          type="range"
          min={12}
          max={72}
          step={1}
          value={currentValues.fontSize || 16}
          onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Font Weight</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('fontWeight')[device] || false}
              device={device}
            />
          )}
        </div>
        <Select
          value={String(currentValues.fontWeight || 400)}
          onValueChange={(value) => updateSetting('fontWeight', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontWeights.map((weight) => (
              <SelectItem key={weight.value} value={String(weight.value)}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line Height</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{(currentValues.lineHeight || 1.5).toFixed(1)}</span>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('lineHeight')[device] || false}
                device={device}
              />
            )}
          </div>
        </div>
        <Input
          type="range"
          min={1}
          max={2.5}
          step={0.1}
          value={currentValues.lineHeight || 1.5}
          onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Letter Spacing</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{currentValues.letterSpacing || 0}px</span>
            {isResponsive && (
              <ResponsiveIndicator
                hasOverride={getOverrides('letterSpacing')[device] || false}
                device={device}
              />
            )}
          </div>
        </div>
        <Input
          type="range"
          min={-2}
          max={10}
          step={0.5}
          value={currentValues.letterSpacing || 0}
          onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Text Align */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Text Align</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('textAlign')[device] || false}
              device={device}
            />
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant={currentValues.textAlign === 'left' ? 'default' : 'outline'}
            size="icon"
            onClick={() => updateSetting('textAlign', 'left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={currentValues.textAlign === 'center' ? 'default' : 'outline'}
            size="icon"
            onClick={() => updateSetting('textAlign', 'center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant={currentValues.textAlign === 'right' ? 'default' : 'outline'}
            size="icon"
            onClick={() => updateSetting('textAlign', 'right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant={currentValues.textAlign === 'justify' ? 'default' : 'outline'}
            size="icon"
            onClick={() => updateSetting('textAlign', 'justify')}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Text Transform */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Text Transform</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('textTransform')[device] || false}
              device={device}
            />
          )}
        </div>
        <Select
          value={currentValues.textTransform || 'none'}
          onValueChange={(value: any) => updateSetting('textTransform', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="uppercase">UPPERCASE</SelectItem>
            <SelectItem value="lowercase">lowercase</SelectItem>
            <SelectItem value="capitalize">Capitalize</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Text Decoration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Text Decoration</Label>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('textDecoration')[device] || false}
              device={device}
            />
          )}
        </div>
        <Select
          value={currentValues.textDecoration || 'none'}
          onValueChange={(value: any) => updateSetting('textDecoration', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="underline">Underline</SelectItem>
            <SelectItem value="line-through">Line Through</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
