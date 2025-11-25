import React from 'react';
import { PageBlock, GridBlockContent } from '@/types/page-builder';
import { Settings, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GridBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
  onAddChild?: (parentId: string) => void;
  children?: React.ReactNode;
}

export const GridBlock: React.FC<GridBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
  onAddChild,
  children,
}) => {
  const content = block.content as GridBlockContent;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState<GridBlockContent>(content || {
    columns: 3,
    gap: 16,
    responsive: {
      sm: 1,
      md: 2,
      lg: 3,
    },
  });

  // Debug logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GridBlock ${block.id}] Props Debug:`, {
        hasOnAddChild: !!onAddChild,
        onAddChildType: typeof onAddChild,
        hasChildren: !!children,
        childrenType: typeof children,
        blockType: block.type,
        blockId: block.id,
      });
    }
  }, [onAddChild, children, block.id, block.type]);

  const handleSave = () => {
    onUpdate(editContent);
    setIsEditing(false);
  };

  // Calculate responsive columns
  const cols = content.columns || 3;
  const responsive = content.responsive || { sm: 1, md: 2, lg: cols };

  // Grid inline styles (desktop default)
  // Merge block.style first, then override with grid-specific styles to ensure they take precedence
  const gridStyles: React.CSSProperties = {
    // First apply block.style from Properties Panel (padding, margin, background, etc.)
    ...block.style,
    // Then override with grid-specific styles that must not be changed
    display: 'grid',
    gap: `${content.gap || 16}px`,
    gridTemplateRows: content.rowTemplate || 'auto',
    gridTemplateColumns: content.columnTemplate || `repeat(${cols}, 1fr)`,
    width: '100%',
    position: 'relative',
    minHeight: children ? 'auto' : '200px',
    border: isEditable ? '2px dashed #cbd5e0' : 'none',
    borderRadius: '8px',
    // Only apply default padding if not set in block.style
    ...(isEditable && !block.style?.padding && !block.style?.paddingTop && !block.style?.paddingRight && !block.style?.paddingBottom && !block.style?.paddingLeft
      ? { padding: '16px' }
      : {}),
  };

  // Unique ID for responsive styles
  const gridId = `grid-block-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (!isEditable) {
    return (
      <div style={gridStyles} className={gridId}>
        {children}
        <style jsx>{`
          .${gridId} {
            display: grid;
            gap: ${content.gap || 16}px;
            grid-template-rows: ${content.rowTemplate || 'auto'};
            grid-template-columns: ${content.columnTemplate || `repeat(${cols}, 1fr)`};
            width: 100%;
          }
          @media (max-width: 640px) {
            .${gridId} {
              grid-template-columns: repeat(${responsive.sm || 1}, 1fr) !important;
            }
          }
          @media (min-width: 641px) and (max-width: 1024px) {
            .${gridId} {
              grid-template-columns: repeat(${responsive.md || 2}, 1fr) !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={gridStyles} className={`group ${gridId}`}>
      {/* Control Bar */}
      {isEditable && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {/* Debug: Show button status in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 absolute -bottom-6 right-0 whitespace-nowrap bg-white px-1 rounded">
              onAddChild={String(!!onAddChild)}
            </div>
          )}
          
          {onAddChild && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log(`[GridBlock ${block.id}] Add Block clicked:`, { 
                  hasOnAddChild: !!onAddChild, 
                  blockId: block.id,
                  blockType: block.type,
                });
                if (onAddChild) {
                  onAddChild(block.id);
                } else {
                  console.error('[GridBlock] onAddChild is undefined!');
                }
              }}
              className="bg-white shadow-sm hover:shadow-md"
              title="Add nested block to grid"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Block
            </Button>
          )}
          
          {/* Show warning if onAddChild is missing in development */}
          {process.env.NODE_ENV === 'development' && !onAddChild && (
            <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">
              ⚠️ No onAddChild
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Settings Panel */}
      {isEditing && (
        <div className="absolute top-12 right-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-20 w-96 max-h-[80vh] overflow-y-auto">
          <h3 className="font-semibold mb-3">Grid Settings</h3>
          
          <div className="space-y-4">
            {/* Quick Presets - Tailwind Style */}
            <div>
              <Label className="mb-2 block">Quick Presets (Tailwind)</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    size="sm"
                    variant={editContent.columns === num ? "default" : "outline"}
                    onClick={() => setEditContent({ 
                      ...editContent, 
                      columns: num,
                      columnTemplate: '', // Clear custom template
                      responsive: { sm: 1, md: Math.min(num, 2), lg: num }
                    })}
                    className="text-xs"
                  >
                    {num} col
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Auto-wraps to next row (like Tailwind grid)</p>
            </div>

            <div className="border-t pt-3">
              <Label>Columns (Desktop)</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={editContent.columns || 3}
                onChange={(e) => setEditContent({ ...editContent, columns: parseInt(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">Số cột trên desktop (≥1024px)</p>
            </div>

            <div>
              <Label>Gap (px)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editContent.gap || 16}
                  onChange={(e) => setEditContent({ ...editContent, gap: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {[0, 8, 16, 24, 32].map((gap) => (
                    <Button
                      key={gap}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditContent({ ...editContent, gap })}
                      className="text-xs px-2"
                    >
                      {gap}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Khoảng cách giữa các items</p>
            </div>

            <div>
              <Label>Custom Column Template (Advanced)</Label>
              <Input
                type="text"
                placeholder="e.g., 2fr 1fr 1fr or 300px auto 1fr"
                value={editContent.columnTemplate || ''}
                onChange={(e) => setEditContent({ ...editContent, columnTemplate: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Override columns với CSS Grid template</p>
            </div>

            <div>
              <Label>Custom Row Template (optional)</Label>
              <Input
                type="text"
                placeholder="e.g., auto auto"
                value={editContent.rowTemplate || ''}
                onChange={(e) => setEditContent({ ...editContent, rowTemplate: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                📱 Responsive Columns
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm flex items-center justify-between">
                    <span>📱 Mobile (sm) - ≤640px</span>
                    <span className="font-mono text-xs">{editContent.responsive?.sm || 1} col</span>
                  </Label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        size="sm"
                        variant={editContent.responsive?.sm === num ? "default" : "outline"}
                        onClick={() => setEditContent({
                          ...editContent,
                          responsive: { ...editContent.responsive, sm: num }
                        })}
                        className="flex-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm flex items-center justify-between">
                    <span>💻 Tablet (md) - 641-1024px</span>
                    <span className="font-mono text-xs">{editContent.responsive?.md || 2} col</span>
                  </Label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        size="sm"
                        variant={editContent.responsive?.md === num ? "default" : "outline"}
                        onClick={() => setEditContent({
                          ...editContent,
                          responsive: { ...editContent.responsive, md: num }
                        })}
                        className="flex-1"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm flex items-center justify-between">
                    <span>🖥️ Desktop (lg) - ≥1024px</span>
                    <span className="font-mono text-xs">{editContent.responsive?.lg || editContent.columns || 3} col</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <Button
                        key={num}
                        type="button"
                        size="sm"
                        variant={editContent.responsive?.lg === num ? "default" : "outline"}
                        onClick={() => setEditContent({
                          ...editContent,
                          responsive: { ...editContent.responsive, lg: num }
                        })}
                        className="text-xs"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="pt-3 border-t">
              <Label className="mb-2 block">Preview</Label>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1">
                <div>Mobile: {editContent.responsive?.sm || 1} column(s)</div>
                <div>Tablet: {editContent.responsive?.md || 2} column(s)</div>
                <div>Desktop: {editContent.responsive?.lg || editContent.columns || 3} column(s)</div>
                <div>Gap: {editContent.gap || 16}px</div>
                {editContent.columnTemplate && (
                  <div className="text-blue-600">Custom: {editContent.columnTemplate}</div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Children Blocks - Each child is a grid item */}
      {children ? (
        <>
          {children}
        </>
      ) : (
        <div className="col-span-full text-gray-400 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
          <div className="text-sm font-medium">Drop blocks here or click "Add Block"</div>
          <div className="text-xs mt-1 opacity-75">Add child blocks to grid cells</div>
          {process.env.NODE_ENV === 'development' && onAddChild && (
            <div className="text-xs mt-2 text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
              ✓ Ready to add blocks (onAddChild available)
            </div>
          )}
          {process.env.NODE_ENV === 'development' && !onAddChild && (
            <div className="text-xs mt-2 text-red-500 bg-red-50 inline-block px-2 py-1 rounded">
              ⚠ onAddChild callback missing
            </div>
          )}
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx>{`
        .${gridId} {
          display: grid;
          gap: ${content.gap || 16}px;
          grid-template-rows: ${content.rowTemplate || 'auto'};
          grid-template-columns: ${content.columnTemplate || `repeat(${cols}, 1fr)`};
          width: 100%;
        }
        @media (max-width: 640px) {
          .${gridId} {
            grid-template-columns: repeat(${responsive.sm || 1}, 1fr) !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .${gridId} {
            grid-template-columns: repeat(${responsive.md || 2}, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};
