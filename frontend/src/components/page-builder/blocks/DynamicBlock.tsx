/**
 * Dynamic Block Component - Refactored Version
 * Senior-level architecture with hooks separation
 * 
 * Features:
 * - Multiple template support (Static, API, GraphQL)
 * - JSON validation with blur triggers
 * - Repeater pattern with limit
 * - Advanced template syntax ({{#each}}, {{#if}}, {{#repeat}})
 * - No infinite loops - uses reducer pattern
 */

'use client';

import React, { useEffect } from 'react';
import { PageBlock, DynamicBlockConfig } from '@/types/page-builder';
import {
  Settings,
  Trash2,
  RefreshCw,
  Code,
  Check,
  Grid3x3,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Custom hooks
import {
  useDynamicBlockState,
  useDynamicBlockData,
  useTemplateSelection,
  useDataValidation,
  testAPIConnection,
} from './dynamicBlock';

// Utilities
import { processTemplate, evaluateAllConditions } from './dynamicBlock/templateUtils';
import { hasValidationErrors } from './dynamicBlock/validationUtils';
import { getAllSampleTemplates, type SampleTemplate } from '@/lib/dynamicBlockSampleTemplates';

// UI Components
import {
  TemplateSelectionPanel,
  TemplateEditorPanel,
  ConfigurationPanel,
} from './dynamicBlock/components';

interface DynamicBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
}

/**
 * Main Dynamic Block Component
 */
export const DynamicBlock: React.FC<DynamicBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
}) => {
  const config = block.config as DynamicBlockConfig;
  const sampleTemplates = getAllSampleTemplates();

  // Ref for fullscreen textarea
  const fullscreenTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Helper function to insert snippet in fullscreen editor
  const insertSnippetFullscreen = (snippet: string) => {
    if (!fullscreenTextareaRef.current) {
      // Fallback: append to end
      setTemplateEdit(state.templateEdit + '\n' + snippet);
      return;
    }

    const textarea = fullscreenTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = state.templateEdit.substring(0, start) + snippet + state.templateEdit.substring(end);
    
    setTemplateEdit(newValue);
    
    // Focus and position cursor after snippet
    setTimeout(() => {
      if (fullscreenTextareaRef.current) {
        const newPos = start + snippet.length;
        fullscreenTextareaRef.current.selectionStart = fullscreenTextareaRef.current.selectionEnd = newPos;
        fullscreenTextareaRef.current.focus();
      }
    }, 0);
  };

  // State management using custom hook with reducer
  const {
    state,
    setEditing,
    setFullscreenEditor,
    setEditConfig,
    setSelectedTemplate,
    setTemplateEdit,
    setLoading,
    setData,
    setError,
    setStaticDataText,
    setStaticDataError,
    setRepeaterDataText,
    setRepeaterDataError,
    setLimitText,
    setLimitError,
    setApiTestLoading,
    setApiTestResult,
    setApiTestError,
  } = useDynamicBlockState(config, block.content?.template || '');

  // Data fetching hook
  useDynamicBlockData({
    config: state.editConfig,
    onDataLoaded: setData,
    onLoading: setLoading,
    onError: setError,
  });

  // Template selection hook
  const { handleSelectTemplate, handleSelectBlankTemplate } = useTemplateSelection({
    onConfigChange: setEditConfig,
    onTemplateChange: setTemplateEdit,
    onSelectedTemplateChange: setSelectedTemplate,
    onDataChange: setData,
    onErrorsReset: () => {
      setStaticDataError(null, false);
      setRepeaterDataError(null, false, []);
      setLimitError(null, false);
    },
  });

  // Data validation hook
  const { validateAndSaveStaticData, validateAndSaveRepeaterData, validateAndSaveLimit } =
    useDataValidation({
      editConfig: state.editConfig,
      onConfigChange: setEditConfig,
      onDataChange: setData,
      onStaticDataError: setStaticDataError,
      onRepeaterDataError: setRepeaterDataError,
      onLimitError: setLimitError,
    });

  // Initialize static data text from config on mount/change
  useEffect(() => {
    if (state.editConfig.dataSource?.type === 'static') {
      const staticData = state.editConfig.dataSource?.staticData;
      const textValue = staticData
        ? typeof staticData === 'string'
          ? staticData
          : JSON.stringify(staticData, null, 2)
        : '{}';
      setStaticDataText(textValue);
    }
  }, [state.editConfig.dataSource?.type, state.editConfig.templateId, setStaticDataText]);

  // Initialize repeater data text from config on mount/change
  useEffect(() => {
    if (state.editConfig.repeater?.enabled) {
      const repeaterData = state.editConfig.repeater?.data;
      const textValue = repeaterData
        ? typeof repeaterData === 'string'
          ? repeaterData
          : JSON.stringify(repeaterData, null, 2)
        : '[]';
      setRepeaterDataText(textValue);

      // Initialize limit text
      if (state.editConfig.repeater?.limit) {
        setLimitText(String(state.editConfig.repeater.limit));
      } else {
        setLimitText('');
      }
    }
  }, [state.editConfig.repeater?.enabled, state.editConfig.templateId, setRepeaterDataText, setLimitText]);

  /**
   * Handle API/GraphQL testing
   */
  const handleTestApi = async () => {
    setApiTestLoading(true);
    setApiTestError(null);
    setApiTestResult(null);

    try {
      const result = await testAPIConnection(state.editConfig.dataSource);
      setApiTestResult(result);
    } catch (err) {
      setApiTestError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setApiTestLoading(false);
    }
  };

  /**
   * Render dynamic content based on configuration
   */
  const renderContent = () => {
    // Template-based rendering
    if (block.content?.componentType === 'template' && block.content?.template) {
      let renderData = state.data;

      // Fallback to sample template data
      if (!renderData && block.content?.templateId) {
        const matchingTemplate = sampleTemplates.find(t => t.id === block.content?.templateId);
        if (matchingTemplate?.dataSource?.staticData) {
          renderData = matchingTemplate.dataSource.staticData;
        }
      }

      if (!renderData) {
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-500 text-sm">
            No data available. Configure data source and save to preview.
          </div>
        );
      }

      const processedTemplate = processTemplate(block.content.template, renderData);
      return (
        <div className="template-content" dangerouslySetInnerHTML={{ __html: processedTemplate }} />
      );
    }

    // Loading state
    if (state.loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2">Loading...</span>
        </div>
      );
    }

    // Error state
    if (state.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
          <strong>Error:</strong> {state.error}
        </div>
      );
    }

    // Repeater pattern rendering
    if (config?.repeater?.enabled && state.data) {
      const items = Array.isArray(state.data) ? state.data : [];
      const filteredItems = items.filter(item =>
        evaluateAllConditions(item, config.conditions)
      );
      const limitedItems = config.repeater?.limit
        ? filteredItems.slice(0, config.repeater.limit)
        : filteredItems;

      return (
        <div className="grid gap-4">
          {limitedItems.map((item, index) => (
            <Card key={index} className="p-4">
              <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(item, null, 2)}</pre>
            </Card>
          ))}
        </div>
      );
    }

    // No data
    if (!state.data) {
      return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-gray-500 text-sm">
          No data available. Configure data source and save to preview.
        </div>
      );
    }

    // Default: show JSON
    return (
      <Card className="p-4">
        <pre className="text-sm overflow-auto max-h-96">{JSON.stringify(state.data, null, 2)}</pre>
      </Card>
    );
  };

  /**
   * Handle save
   */
  const handleSave = () => {
    // Check for validation errors
    if (
      hasValidationErrors(
        state.hasValidationError,
        state.repeaterValidationError,
        state.limitValidationError
      )
    ) {
      return;
    }

    const updatedContent = {
      ...block.content,
      componentType: 'template',
      template: state.templateEdit,
      config: state.editConfig,
    };

    onUpdate(updatedContent, block.style);
    setEditing(false);
  };

  // Non-editable mode
  if (!isEditable) {
    return <div className="dynamic-block-content">{renderContent()}</div>;
  }

  // Editable mode with dialog
  return (
    <div className="relative border-2 border-dashed border-purple-300 rounded-lg p-4 group">
      {/* Control Bar */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditing(!state.isEditing)}
          className="bg-white shadow-sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete} className="shadow-sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={state.isEditing} onOpenChange={setEditing}>
        <DialogContent className="max-w-7xl h-[95vh] p-0 flex flex-col">
          {/* Header */}
          <DialogHeader className="px-8 pt-8 pb-6 border-b bg-gradient-to-r from-slate-50 to-slate-100">
            <DialogTitle className="flex items-center text-2xl font-bold">
              <Grid3x3 className="w-6 h-6 mr-3 text-blue-600" />
              Dynamic Block Configuration
            </DialogTitle>
            <DialogDescription className="mt-2 text-base">
              Choose a template, configure data source, and customize your block
            </DialogDescription>
          </DialogHeader>

          {/* Main Content - 2 Column Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Template Selection */}
            <TemplateSelectionPanel
              sampleTemplates={sampleTemplates}
              selectedTemplate={state.selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onSelectBlank={() => handleSelectBlankTemplate(state.editConfig)}
              currentConfig={state.editConfig}
            />

            {/* RIGHT: Editor & Configuration */}
            {!state.isFullscreenEditor && (
              <div className="w-1/2 flex flex-col">
                {/* Template Editor */}
                <TemplateEditorPanel
                  templateEdit={state.templateEdit}
                  onTemplateChange={setTemplateEdit}
                  selectedTemplate={state.selectedTemplate}
                  isFullscreenEditor={state.isFullscreenEditor}
                  onFullscreenToggle={setFullscreenEditor}
                />

                {/* Configuration */}
                <ConfigurationPanel
                  editConfig={state.editConfig}
                  onConfigChange={setEditConfig}
                  staticDataText={state.staticDataText}
                  onStaticDataChange={setStaticDataText}
                  onStaticDataBlur={() => validateAndSaveStaticData(state.staticDataText)}
                  staticDataError={state.staticDataError}
                  hasStaticValidationError={state.hasValidationError}
                  repeaterEnabled={state.editConfig.repeater?.enabled || false}
                  onRepeaterEnabledChange={(checked) => {
                    setEditConfig({
                      ...state.editConfig,
                      repeater: checked
                        ? {
                            ...state.editConfig.repeater,
                            enabled: checked,
                            data: state.editConfig.repeater?.data || [],
                          }
                        : { enabled: false },
                    });
                  }}
                  repeaterDataText={state.repeaterDataText}
                  onRepeaterDataChange={setRepeaterDataText}
                  onRepeaterDataBlur={() => validateAndSaveRepeaterData(state.repeaterDataText)}
                  repeaterDataError={state.repeaterDataError}
                  hasRepeaterValidationError={state.repeaterValidationError}
                  repeaterItemsCount={state.repeaterItemsData.length}
                  limitText={state.limitText}
                  onLimitChange={setLimitText}
                  onLimitBlur={() => validateAndSaveLimit(state.limitText)}
                  limitError={state.limitError}
                  hasLimitValidationError={state.limitValidationError}
                  onTestApi={handleTestApi}
                  apiTestLoading={state.apiTestLoading}
                  apiTestResult={state.apiTestResult}
                  apiTestError={state.apiTestError}
                />
              </div>
            )}

            {/* Fullscreen Editor Modal */}
            {state.isFullscreenEditor && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="border-b px-8 py-5 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex items-center gap-4">
                      <Code className="w-6 h-6 text-blue-600" />
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Template HTML Editor</h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {state.selectedTemplate ? `Editing: ${state.selectedTemplate.name}` : 'Blank Template'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Format Button */}
                      <Button
                        onClick={() => {
                          try {
                            let formatted = state.templateEdit;
                            let indent = 0;
                            const lines = formatted.split('\n');
                            const formattedLines = lines.map(line => {
                              const trimmed = line.trim();
                              if (!trimmed) return '';
                              
                              if (trimmed.startsWith('</')) {
                                indent = Math.max(0, indent - 1);
                              }
                              
                              const indented = '  '.repeat(indent) + trimmed;
                              
                              if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                                indent++;
                              }
                              
                              return indented;
                            });
                            
                            setTemplateEdit(formattedLines.join('\n'));
                          } catch (error) {
                            console.error('Format error:', error);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Format
                      </Button>
                      
                      {/* Close Button */}
                      <Button
                        onClick={() => setFullscreenEditor(false)}
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0"
                        title="Exit fullscreen"
                      >
                        <Minimize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Insert Bar */}
                  <div className="border-b px-8 py-3 bg-gray-50 flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 mr-2">Quick Insert:</span>
                    <Button
                      onClick={() => insertSnippetFullscreen('{{variable}}')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-blue-100"
                    >
                      {'{{var}}'}
                    </Button>
                    <Button
                      onClick={() => insertSnippetFullscreen('{{#each items}}\n  \n{{/each}}')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-blue-100"
                    >
                      {'{{#each}}'}
                    </Button>
                    <Button
                      onClick={() => insertSnippetFullscreen('{{#if condition}}\n  \n{{/if}}')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-blue-100"
                    >
                      {'{{#if}}'}
                    </Button>
                    <div className="h-4 w-px bg-gray-300 mx-1" />
                    <Button
                      onClick={() => insertSnippetFullscreen('<div class="container">\n  \n</div>')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-green-100"
                    >
                      {'<div>'}
                    </Button>
                    <Button
                      onClick={() => insertSnippetFullscreen('<h2 class="title"></h2>')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-green-100"
                    >
                      {'<h2>'}
                    </Button>
                    <Button
                      onClick={() => insertSnippetFullscreen('<p class="text"></p>')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-green-100"
                    >
                      {'<p>'}
                    </Button>
                    <Button
                      onClick={() => insertSnippetFullscreen('<button class="btn"></button>')}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-mono hover:bg-green-100"
                    >
                      {'<button>'}
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-mono bg-white px-2 py-1 rounded border">
                        {state.templateEdit.split('\n').length} lines
                      </span>
                      <span className="font-mono bg-white px-2 py-1 rounded border">
                        {state.templateEdit.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Editor Area */}
                  <div className="flex-1 overflow-hidden flex">
                    {/* Left: Code Editor */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-auto p-6">
                        <textarea
                          ref={fullscreenTextareaRef}
                          placeholder={`<!-- Example HTML Template with Handlebars syntax -->\n<div class="container mx-auto p-6">\n  <h1 class="text-3xl font-bold">{{title}}</h1>\n  <p class="text-gray-600 mt-2">{{description}}</p>\n  \n  {{#each items}}\n    <div class="card mt-4 p-4 border rounded-lg shadow">\n      <h3 class="text-xl font-semibold">{{this.name}}</h3>\n      <p class="text-gray-700">{{this.description}}</p>\n      {{#if this.price}}\n        <span class="text-lg font-bold text-blue-600">\${{this.price}}</span>\n      {{/if}}\n    </div>\n  {{/each}}\n</div>`}
                          value={state.templateEdit}
                          onChange={(e) => setTemplateEdit(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              const start = e.currentTarget.selectionStart;
                              const end = e.currentTarget.selectionEnd;
                              const newValue = state.templateEdit.substring(0, start) + '  ' + state.templateEdit.substring(end);
                              setTemplateEdit(newValue);
                              setTimeout(() => {
                                if (fullscreenTextareaRef.current) {
                                  fullscreenTextareaRef.current.selectionStart = fullscreenTextareaRef.current.selectionEnd = start + 2;
                                }
                              }, 0);
                            }
                          }}
                          className="w-full h-full font-mono text-sm resize-none p-4 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none bg-white"
                          style={{
                            lineHeight: '1.6',
                            tabSize: 2,
                          }}
                        />
                      </div>
                    </div>

                    {/* Right: Syntax Guide */}
                    <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Handlebars Syntax</h3>
                          <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border">
                              <code className="text-xs font-mono text-blue-600">{'{{variable}}'}</code>
                              <p className="text-xs text-gray-600 mt-1">Display variable value</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <code className="text-xs font-mono text-blue-600">{'{{#each items}}'}<br/>{'  {{this.name}}'}<br/>{'{{/each}}'}</code>
                              <p className="text-xs text-gray-600 mt-1">Loop through array</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <code className="text-xs font-mono text-blue-600">{'{{#if condition}}'}<br/>{'  ...'}<br/>{'{{/if}}'}</code>
                              <p className="text-xs text-gray-600 mt-1">Conditional rendering</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg border">
                              <code className="text-xs font-mono text-blue-600">{'{{this.property}}'}</code>
                              <p className="text-xs text-gray-600 mt-1">Access property in loop</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">TailwindCSS Classes</h3>
                          <div className="space-y-2 text-xs">
                            <div className="bg-white p-2 rounded border">
                              <code className="font-mono text-purple-600">container mx-auto</code>
                              <p className="text-gray-600 mt-0.5">Center container</p>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <code className="font-mono text-purple-600">p-4 m-2</code>
                              <p className="text-gray-600 mt-0.5">Padding & margin</p>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <code className="font-mono text-purple-600">text-xl font-bold</code>
                              <p className="text-gray-600 mt-0.5">Text styles</p>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <code className="font-mono text-purple-600">bg-blue-500 text-white</code>
                              <p className="text-gray-600 mt-0.5">Colors</p>
                            </div>
                            <div className="bg-white p-2 rounded border">
                              <code className="font-mono text-purple-600">rounded-lg shadow</code>
                              <p className="text-gray-600 mt-0.5">Border & shadow</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-gray-900 mb-3">Tips</h3>
                          <ul className="text-xs text-gray-700 space-y-2">
                            <li className="flex gap-2">
                              <span className="text-green-600">✓</span>
                              <span>Press Tab for indentation</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-green-600">✓</span>
                              <span>Use Format button to auto-indent</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-green-600">✓</span>
                              <span>Quick insert adds snippets</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="text-green-600">✓</span>
                              <span>Combine HTML + Tailwind CSS</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t px-8 py-4 flex gap-3 justify-end bg-white">
                    <Button 
                      onClick={() => setFullscreenEditor(false)} 
                      variant="outline" 
                      size="sm"
                      className="h-9 px-4"
                    >
                      Close Editor
                    </Button>
                    <Button 
                      onClick={() => setFullscreenEditor(false)}
                      size="sm"
                      className="h-9 px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Apply Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Action Buttons */}
          <div className="border-t px-6 py-4 flex gap-2 justify-end bg-white">
            <Button onClick={() => setEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="min-w-32"
              size="sm"
              disabled={hasValidationErrors(
                state.hasValidationError,
                state.repeaterValidationError,
                state.limitValidationError
              )}
              title={
                hasValidationErrors(
                  state.hasValidationError,
                  state.repeaterValidationError,
                  state.limitValidationError
                )
                  ? 'Please fix errors before saving'
                  : ''
              }
            >
              Save Changes
            </Button>
            {hasValidationErrors(
              state.hasValidationError,
              state.repeaterValidationError,
              state.limitValidationError
            ) && (
              <span className="text-xs text-red-600 flex items-center">⚠️ Fix errors to save</span>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dynamic Content Display */}
      <div className="mt-8">
        <div className="text-xs text-gray-500 mb-2 flex items-center">
          <Code className="w-3 h-3 mr-1" />
          Dynamic Block
          {config?.templateName && ` - ${config.templateName}`}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default DynamicBlock;
