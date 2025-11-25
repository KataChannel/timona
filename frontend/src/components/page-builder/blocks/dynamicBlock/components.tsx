/**
 * Dynamic Block UI Components
 * Extracted from main component for better organization
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Check, Maximize2 } from 'lucide-react';
import { DynamicBlockConfig } from '@/types/page-builder';
import type { SampleTemplate } from '@/lib/dynamicBlockSampleTemplates';

/**
 * Template Selection Panel
 */
export const TemplateSelectionPanel: React.FC<{
  sampleTemplates: SampleTemplate[];
  selectedTemplate: any | null;
  onSelectTemplate: (template: SampleTemplate) => void;
  onSelectBlank: () => void;
  currentConfig: DynamicBlockConfig;
}> = ({ sampleTemplates, selectedTemplate, onSelectTemplate, onSelectBlank }) => (
  <div className="w-1/2 border-r border-gray-200 overflow-y-auto flex flex-col">
    <div className="px-6 py-6 space-y-4 flex-1 overflow-y-auto">
      <div>
        <h3 className="text-lg font-bold mb-2">Choose Template</h3>
        <p className="text-sm text-gray-600 mb-6">Select from professional templates or start with blank</p>

        <div className="space-y-3">
          {/* Blank Template */}
          <button
            onClick={onSelectBlank}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
              selectedTemplate === null ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-base mb-1">Blank Template</div>
            <p className="text-xs text-gray-600">Start with empty HTML</p>
            {selectedTemplate === null && (
              <div className="mt-2 flex items-center text-blue-600 text-xs font-semibold">
                <Check className="w-3 h-3 mr-1" /> Selected
              </div>
            )}
          </button>

          {/* Sample Templates */}
          {sampleTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-base mb-1">{template.name}</div>
              <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
              {selectedTemplate?.id === template.id && (
                <div className="mt-2 flex items-center text-blue-600 text-xs font-semibold">
                  <Check className="w-3 h-3 mr-1" /> Selected
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Template Editor Panel - Enhanced with better UI
 */
export const TemplateEditorPanel: React.FC<{
  templateEdit: string;
  onTemplateChange: (template: string) => void;
  selectedTemplate: any | null;
  isFullscreenEditor: boolean;
  onFullscreenToggle: (value: boolean) => void;
}> = ({ templateEdit, onTemplateChange, selectedTemplate, onFullscreenToggle }) => {
  const [lineCount, setLineCount] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Count lines when template changes
  React.useEffect(() => {
    const lines = templateEdit.split('\n').length;
    setLineCount(lines);
  }, [templateEdit]);

  // Handle Tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = templateEdit.substring(0, start) + '  ' + templateEdit.substring(end);
      onTemplateChange(newValue);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Format HTML with basic indentation
  const formatHTML = () => {
    try {
      let formatted = templateEdit;
      let indent = 0;
      const lines = formatted.split('\n');
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        
        // Decrease indent for closing tags
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        
        const indented = '  '.repeat(indent) + trimmed;
        
        // Increase indent for opening tags (not self-closing)
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          indent++;
        }
        
        return indented;
      });
      
      onTemplateChange(formattedLines.join('\n'));
    } catch (error) {
      console.error('Format error:', error);
    }
  };

  // Insert template snippet at cursor
  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newValue = templateEdit.substring(0, start) + snippet + templateEdit.substring(end);
    onTemplateChange(newValue);
    
    // Set cursor position after the inserted snippet
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = start + snippet.length;
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="flex-1 border-b border-gray-200 overflow-hidden flex flex-col bg-gray-50">
      <div className="px-6 py-4 space-y-3 flex flex-col h-full">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold">Template HTML</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded border">
              <span className="font-mono">{lineCount} lines</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={formatHTML}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              title="Format HTML"
            >
              Format
            </Button>
            <Button
              onClick={() => onFullscreenToggle(true)}
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              title="Fullscreen edit"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Template info */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">Template:</span>
          <span className="font-semibold text-blue-600">
            {selectedTemplate ? selectedTemplate.name : 'Blank'}
          </span>
        </div>

        {/* Quick insert snippets */}
        <div className="flex flex-wrap gap-1.5">
          <Button
            onClick={() => insertSnippet('{{variable}}')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-mono bg-white hover:bg-blue-50"
          >
            {'{{var}}'}
          </Button>
          <Button
            onClick={() => insertSnippet('{{#each items}}\n  \n{{/each}}')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-mono bg-white hover:bg-blue-50"
          >
            {'{{#each}}'}
          </Button>
          <Button
            onClick={() => insertSnippet('{{#if condition}}\n  \n{{/if}}')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-mono bg-white hover:bg-blue-50"
          >
            {'{{#if}}'}
          </Button>
          <Button
            onClick={() => insertSnippet('<div class="container">\n  \n</div>')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-mono bg-white hover:bg-blue-50"
          >
            {'<div>'}
          </Button>
          <Button
            onClick={() => insertSnippet('<h2 class="title"></h2>')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-mono bg-white hover:bg-blue-50"
          >
            {'<h2>'}
          </Button>
          <Button
            onClick={() => insertSnippet('<button class="btn"></button>')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs font-mono bg-white hover:bg-blue-50"
          >
            {'<button>'}
          </Button>
        </div>

        {/* Code editor */}
        <div className="flex-1 flex flex-col overflow-hidden border border-gray-300 rounded-lg bg-white shadow-sm">
          <Textarea
            ref={textareaRef}
            placeholder={`<!-- Example HTML Template with Handlebars syntax -->\n<div class="p-6 bg-white rounded-lg shadow">\n  <h2 class="text-2xl font-bold">{{title}}</h2>\n  <p class="text-gray-600">{{description}}</p>\n  \n  {{#each items}}\n    <div class="mt-4 p-4 border rounded">\n      <h3>{{this.name}}</h3>\n      <p>{{this.description}}</p>\n      {{#if this.price}}\n        <span class="font-bold">{{this.price}}</span>\n      {{/if}}\n    </div>\n  {{/each}}\n</div>`}
            value={templateEdit}
            onChange={(e) => onTemplateChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="font-mono text-xs resize-none flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              lineHeight: '1.5',
              tabSize: 2,
            }}
          />
        </div>

        {/* Syntax help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-900 mb-1.5">Syntax Guide:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border">{'{{name}}'}</code>
              <span className="text-gray-600">Variable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border">{'{{#each}}'}</code>
              <span className="text-gray-600">Loop array</span>
            </div>
            <div className="flex items-center gap-1.5">
              <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border">{'{{#if}}'}</code>
              <span className="text-gray-600">Condition</span>
            </div>
            <div className="flex items-center gap-1.5">
              <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono border">{'{{this.prop}}'}</code>
              <span className="text-gray-600">Loop item property</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Configuration Panel
 */
export const ConfigurationPanel: React.FC<{
  editConfig: DynamicBlockConfig;
  onConfigChange: (config: DynamicBlockConfig) => void;
  staticDataText: string;
  onStaticDataChange: (text: string) => void;
  onStaticDataBlur: () => void;
  staticDataError: string | null;
  hasStaticValidationError: boolean;
  repeaterEnabled: boolean;
  onRepeaterEnabledChange: (checked: boolean) => void;
  repeaterDataText: string;
  onRepeaterDataChange: (text: string) => void;
  onRepeaterDataBlur: () => void;
  repeaterDataError: string | null;
  hasRepeaterValidationError: boolean;
  repeaterItemsCount: number;
  limitText: string;
  onLimitChange: (text: string) => void;
  onLimitBlur: () => void;
  limitError: string | null;
  hasLimitValidationError: boolean;
  onTestApi: () => void;
  apiTestLoading: boolean;
  apiTestResult: any | null;
  apiTestError: string | null;
}> = ({
  editConfig,
  onConfigChange,
  staticDataText,
  onStaticDataChange,
  onStaticDataBlur,
  staticDataError,
  hasStaticValidationError,
  repeaterEnabled,
  onRepeaterEnabledChange,
  repeaterDataText,
  onRepeaterDataChange,
  onRepeaterDataBlur,
  repeaterDataError,
  hasRepeaterValidationError,
  repeaterItemsCount,
  limitText,
  onLimitChange,
  onLimitBlur,
  limitError,
  hasLimitValidationError,
  onTestApi,
  apiTestLoading,
  apiTestResult,
  apiTestError,
}) => (
  <div className="flex-1 overflow-y-auto">
    <div className="px-6 py-6 space-y-4">
      {/* Template Name */}
      <div>
        <Label className="text-xs font-semibold">Template Name</Label>
        <Input
          type="text"
          placeholder="my-dynamic-block"
          value={editConfig.templateName || ''}
          onChange={(e) => onConfigChange({ ...editConfig, templateName: e.target.value })}
          className="bg-white mt-1 text-sm h-9"
        />
      </div>

      {/* Data Source Type */}
      <div>
        <Label className="text-xs font-semibold">Data Source Type</Label>
        <Select
          value={editConfig.dataSource?.type || 'static'}
          onValueChange={(value) =>
            onConfigChange({
              ...editConfig,
              dataSource: {
                ...editConfig.dataSource,
                type: value as any,
                method: editConfig.dataSource?.method || 'GET',
                token: editConfig.dataSource?.token || '',
              },
            })
          }
        >
          <SelectTrigger className="bg-white mt-1 text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Static Data</SelectItem>
            <SelectItem value="api">REST API</SelectItem>
            <SelectItem value="graphql">GraphQL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* API/GraphQL Configuration */}
      {(editConfig.dataSource?.type === 'api' || editConfig.dataSource?.type === 'graphql') && (
        <>
          <div>
            <Label className="text-xs font-semibold">Endpoint</Label>
            <Input
              type="text"
              placeholder="/api/data or /graphql"
              value={editConfig.dataSource?.endpoint || ''}
              onChange={(e) =>
                onConfigChange({
                  ...editConfig,
                  dataSource: {
                    type: editConfig.dataSource?.type || 'api',
                    ...editConfig.dataSource,
                    endpoint: e.target.value,
                  },
                })
              }
              className="bg-white mt-1 text-sm h-9"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Authorization Token</Label>
            <Input
              type="password"
              placeholder="Bearer token or API key"
              value={editConfig.dataSource?.token || ''}
              onChange={(e) =>
                onConfigChange({
                  ...editConfig,
                  dataSource: {
                    type: editConfig.dataSource?.type || 'api',
                    ...editConfig.dataSource,
                    token: e.target.value,
                  },
                })
              }
              className="bg-white mt-1 text-sm h-9"
            />
          </div>

          <div className="flex gap-2 items-center pt-2">
            <Button
              onClick={onTestApi}
              disabled={apiTestLoading || !editConfig.dataSource?.endpoint}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
            >
              {apiTestLoading ? 'Testing...' : 'Test'}
            </Button>
            {apiTestResult && <span className="text-xs text-green-600 font-semibold">✓ Success</span>}
            {apiTestError && <span className="text-xs text-red-600 font-semibold">✗ Error</span>}
          </div>
        </>
      )}

      {/* Static Data */}
      {editConfig.dataSource?.type === 'static' && (
        <div>
          <Label className="text-xs font-semibold">Static Data (JSON)</Label>
          <Textarea
            placeholder='{"title": "My Data", "items": [{"id": 1, "name": "Item 1"}]}'
            value={staticDataText}
            onChange={(e) => onStaticDataChange(e.target.value)}
            onBlur={onStaticDataBlur}
            rows={6}
            className={`font-mono text-xs mt-1 resize-none ${
              hasStaticValidationError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300'
            }`}
          />
          {hasStaticValidationError && (
            <p className="text-xs text-red-600 mt-2 flex items-start">
              <span className="mr-1 mt-0.5">❌</span>
              <span>{staticDataError}</span>
            </p>
          )}
        </div>
      )}

      {/* Repeater */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-semibold">Enable Repeater</Label>
          <Switch checked={repeaterEnabled} onCheckedChange={onRepeaterEnabledChange} />
        </div>
        {repeaterEnabled && (
          <div className="space-y-3 mt-3">
            {/* Repeater Data */}
            <div>
              <Label className="text-xs font-semibold">Repeater Data (JSON Array)</Label>
              <Textarea
                placeholder='[{"id": 1, "name": "Item 1"}]'
                value={repeaterDataText}
                onChange={(e) => onRepeaterDataChange(e.target.value)}
                onBlur={onRepeaterDataBlur}
                rows={4}
                className={`font-mono text-xs mt-1 resize-none ${
                  hasRepeaterValidationError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300'
                }`}
              />
              {hasRepeaterValidationError && (
                <p className="text-xs text-red-600 mt-2 flex items-start">
                  <span className="mr-1 mt-0.5">❌</span>
                  <span>{repeaterDataError}</span>
                </p>
              )}
              {!hasRepeaterValidationError && repeaterItemsCount > 0 && (
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <span className="mr-1">✓</span>
                  JSON valid - {repeaterItemsCount} items
                </p>
              )}
            </div>

            {/* Limit */}
            <div>
              <Label className="text-xs font-semibold">Limit (optional)</Label>
              <Input
                type="text"
                placeholder="Max items to display"
                value={limitText}
                onChange={(e) => onLimitChange(e.target.value)}
                onBlur={onLimitBlur}
                className={`text-xs h-8 mt-1 ${
                  hasLimitValidationError
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300'
                }`}
              />
              {hasLimitValidationError && (
                <p className="text-xs text-red-600 mt-2 flex items-start">
                  <span className="mr-1 mt-0.5">❌</span>
                  <span>{limitError}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
