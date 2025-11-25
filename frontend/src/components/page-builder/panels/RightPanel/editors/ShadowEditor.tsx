'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResponsiveToggle, ResponsiveIndicator } from '../../../components/ResponsiveToggle';
import { Device, ResponsiveValue } from '../../../types/responsive';
import { useResponsiveStyles } from '../../../hooks/useResponsiveStyles';

interface BoxShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

interface TextShadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

// Storage format (with ResponsiveValue)
interface ShadowSettingsStorage {
  boxShadow?: BoxShadow | ResponsiveValue<BoxShadow>;
  textShadow?: TextShadow | ResponsiveValue<TextShadow>;
}

// Resolved format (without ResponsiveValue, actual values)
interface ShadowSettings {
  boxShadow?: BoxShadow;
  textShadow?: TextShadow;
}

interface ShadowEditorProps {
  settings: ShadowSettingsStorage;
  onChange: (settings: ShadowSettingsStorage) => void;
  device?: Device;
}

const defaultBoxShadow: BoxShadow = {
  x: 0,
  y: 4,
  blur: 6,
  spread: 0,
  color: '#00000040',
  inset: false,
};

const defaultTextShadow: TextShadow = {
  x: 0,
  y: 2,
  blur: 4,
  color: '#00000040',
};

export function ShadowEditor({ settings, onChange, device = 'desktop' }: ShadowEditorProps) {
  const [isResponsive, setIsResponsive] = React.useState(false);

  // Convert settings to responsive format
  const initialValues = Object.keys(settings).reduce((acc, key) => {
    const value = settings[key as keyof ShadowSettingsStorage];
    if (value && typeof value === 'object' && 'desktop' in value) {
      acc[key as keyof ShadowSettings] = value;
    } else if (value !== undefined) {
      acc[key as keyof ShadowSettings] = { desktop: value };
    }
    return acc;
  }, {} as any);

  const {
    currentValues,
    responsiveValues,
    updateValue,
    updateValueAllDevices,
    getOverrides,
  } = useResponsiveStyles<ShadowSettings>({
    device,
    initialValues,
    isResponsive,
  });

  // Sync changes back to parent
  React.useEffect(() => {
    const newSettings: ShadowSettingsStorage = {};
    Object.keys(responsiveValues).forEach((key) => {
      const k = key as keyof ShadowSettings;
      newSettings[k] = responsiveValues[k] as any;
    });
    onChange(newSettings);
  }, [responsiveValues, onChange]);

  const updateSetting = (key: keyof ShadowSettings, value: any) => {
    if (isResponsive) {
      updateValue(key, value);
    } else {
      updateValueAllDevices(key, value);
    }
  };

  const updateBoxShadow = (key: keyof BoxShadow, value: any) => {
    updateSetting('boxShadow', {
      ...(currentValues.boxShadow || defaultBoxShadow),
      [key]: value,
    });
  };

  const updateTextShadow = (key: keyof TextShadow, value: any) => {
    updateSetting('textShadow', {
      ...(currentValues.textShadow || defaultTextShadow),
      [key]: value,
    });
  };

  const boxShadow = currentValues.boxShadow || defaultBoxShadow;
  const textShadow = currentValues.textShadow || defaultTextShadow;

  // Generate CSS shadow strings
  const boxShadowCSS = `${boxShadow.inset ? 'inset ' : ''}${boxShadow.x}px ${boxShadow.y}px ${boxShadow.blur}px ${boxShadow.spread}px ${boxShadow.color}`;
  const textShadowCSS = `${textShadow.x}px ${textShadow.y}px ${textShadow.blur}px ${textShadow.color}`;

  return (
    <div className="space-y-4">
      {/* Responsive Toggle */}
      <ResponsiveToggle
        device={device}
        isResponsive={isResponsive}
        onToggle={setIsResponsive}
        hasOverrides={{
          desktop: getOverrides('boxShadow').desktop || getOverrides('textShadow').desktop,
          tablet: getOverrides('boxShadow').tablet || getOverrides('textShadow').tablet,
          mobile: getOverrides('boxShadow').mobile || getOverrides('textShadow').mobile,
        }}
        label="Shadow"
      />

      <Tabs defaultValue="box" className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="box" className="flex-1">Box Shadow</TabsTrigger>
        <TabsTrigger value="text" className="flex-1">Text Shadow</TabsTrigger>
      </TabsList>

      {/* Box Shadow Tab */}
      <TabsContent value="box" className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Box Shadow Settings</span>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('boxShadow')[device] || false}
              device={device}
            />
          )}
        </div>

        {/* X Offset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Horizontal Offset</Label>
            <span className="text-sm text-gray-500">{boxShadow.x}px</span>
          </div>
          <Input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={boxShadow.x}
            onChange={(e) => updateBoxShadow('x', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Y Offset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Vertical Offset</Label>
            <span className="text-sm text-gray-500">{boxShadow.y}px</span>
          </div>
          <Input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={boxShadow.y}
            onChange={(e) => updateBoxShadow('y', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Blur Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Blur Radius</Label>
            <span className="text-sm text-gray-500">{boxShadow.blur}px</span>
          </div>
          <Input
            type="range"
            min={0}
            max={50}
            step={1}
            value={boxShadow.blur}
            onChange={(e) => updateBoxShadow('blur', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Spread Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Spread Radius</Label>
            <span className="text-sm text-gray-500">{boxShadow.spread}px</span>
          </div>
          <Input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={boxShadow.spread}
            onChange={(e) => updateBoxShadow('spread', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Shadow Color */}
        <div className="space-y-2">
          <Label>Shadow Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={boxShadow.color.substring(0, 7)}
              onChange={(e) => updateBoxShadow('color', e.target.value + (boxShadow.color.length > 7 ? boxShadow.color.substring(7) : ''))}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={boxShadow.color}
              onChange={(e) => updateBoxShadow('color', e.target.value)}
              placeholder="#00000040"
              className="flex-1"
            />
          </div>
        </div>

        {/* Inset */}
        <div className="flex items-center justify-between">
          <Label>Inset Shadow</Label>
          <Switch
            checked={boxShadow.inset}
            onCheckedChange={(checked) => updateBoxShadow('inset', checked)}
          />
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-100 rounded flex items-center justify-center">
          <div
            className="w-32 h-32 bg-white rounded-lg flex items-center justify-center text-xs text-gray-400"
            style={{ boxShadow: boxShadowCSS }}
          >
            Box Shadow<br />Preview
          </div>
        </div>

        {/* CSS Output */}
        <div className="p-3 bg-gray-900 rounded text-xs text-white font-mono break-all">
          box-shadow: {boxShadowCSS};
        </div>
      </TabsContent>

      {/* Text Shadow Tab */}
      <TabsContent value="text" className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Text Shadow Settings</span>
          {isResponsive && (
            <ResponsiveIndicator
              hasOverride={getOverrides('textShadow')[device] || false}
              device={device}
            />
          )}
        </div>

        {/* X Offset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Horizontal Offset</Label>
            <span className="text-sm text-gray-500">{textShadow.x}px</span>
          </div>
          <Input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={textShadow.x}
            onChange={(e) => updateTextShadow('x', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Y Offset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Vertical Offset</Label>
            <span className="text-sm text-gray-500">{textShadow.y}px</span>
          </div>
          <Input
            type="range"
            min={-20}
            max={20}
            step={1}
            value={textShadow.y}
            onChange={(e) => updateTextShadow('y', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Blur Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Blur Radius</Label>
            <span className="text-sm text-gray-500">{textShadow.blur}px</span>
          </div>
          <Input
            type="range"
            min={0}
            max={20}
            step={1}
            value={textShadow.blur}
            onChange={(e) => updateTextShadow('blur', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Shadow Color */}
        <div className="space-y-2">
          <Label>Shadow Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={textShadow.color.substring(0, 7)}
              onChange={(e) => updateTextShadow('color', e.target.value + (textShadow.color.length > 7 ? textShadow.color.substring(7) : ''))}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={textShadow.color}
              onChange={(e) => updateTextShadow('color', e.target.value)}
              placeholder="#00000040"
              className="flex-1"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-100 rounded flex items-center justify-center">
          <h2
            className="text-3xl font-bold text-gray-800"
            style={{ textShadow: textShadowCSS }}
          >
            Text Shadow
          </h2>
        </div>

        {/* CSS Output */}
        <div className="p-3 bg-gray-900 rounded text-xs text-white font-mono break-all">
          text-shadow: {textShadowCSS};
        </div>
      </TabsContent>
    </Tabs>
    </div>
  );
}
