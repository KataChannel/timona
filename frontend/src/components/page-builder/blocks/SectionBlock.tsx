import React from 'react';
import { PageBlock, SectionBlockContent } from '@/types/page-builder';
import { Settings, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SectionBlockProps {
  block: PageBlock;
  isEditable?: boolean;
  onUpdate: (content: any, style?: any) => void;
  onDelete: () => void;
  onAddChild?: (parentId: string) => void;
  children?: React.ReactNode;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  block,
  isEditable = true,
  onUpdate,
  onDelete,
  onAddChild,
  children,
}) => {
  const content = block.content as SectionBlockContent;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState<SectionBlockContent>(content || {
    fullWidth: false,
    containerWidth: 'lg',
    backgroundColor: 'transparent',
    padding: { top: 60, bottom: 60 },
  });

  // Debug logging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SectionBlock ${block.id}] Props Debug:`, {
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

  const maxWidthMap = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    full: '100%',
  };

  const sectionStyles: React.CSSProperties = {
    // First apply block.style from Properties Panel
    ...block.style,
    // Then override with section-specific styles
    width: '100%',
    backgroundColor: content.backgroundColor || 'transparent',
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    paddingTop: `${content.padding?.top || 60}px`,
    paddingBottom: `${content.padding?.bottom || 60}px`,
    position: 'relative',
    minHeight: children ? 'auto' : '200px',
    border: isEditable ? '2px dashed #cbd5e0' : 'none',
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: content.fullWidth ? '100%' : maxWidthMap[content.containerWidth || 'lg'],
    margin: '0 auto',
    padding: content.fullWidth ? 0 : '0 1rem',
  };

  if (!isEditable) {
    return (
      <section style={sectionStyles}>
        <div style={containerStyles}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section style={sectionStyles} className="group">
      {/* Control Bar */}
      {isEditable && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                console.log(`[SectionBlock ${block.id}] Add Block clicked:`, { 
                  hasOnAddChild: !!onAddChild, 
                  blockId: block.id,
                  blockType: block.type,
                });
                if (onAddChild) {
                  onAddChild(block.id);
                } else {
                  console.error('[SectionBlock] onAddChild is undefined!');
                }
              }}
              className="bg-white shadow-sm hover:shadow-md"
              title="Add nested block to section"
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
        <div className="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-20 w-80">
          <h3 className="font-semibold mb-3">Section Settings</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Full Width</Label>
              <Switch
                checked={editContent.fullWidth || false}
                onCheckedChange={(checked) => setEditContent({ ...editContent, fullWidth: checked })}
              />
            </div>

            {!editContent.fullWidth && (
              <div>
                <Label>Container Width</Label>
                <Select
                  value={editContent.containerWidth || 'lg'}
                  onValueChange={(value) => setEditContent({ ...editContent, containerWidth: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small (640px)</SelectItem>
                    <SelectItem value="md">Medium (768px)</SelectItem>
                    <SelectItem value="lg">Large (1024px)</SelectItem>
                    <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Background Color</Label>
              <Input
                type="text"
                placeholder="#ffffff or transparent"
                value={editContent.backgroundColor || 'transparent'}
                onChange={(e) => setEditContent({ ...editContent, backgroundColor: e.target.value })}
              />
            </div>

            <div>
              <Label>Background Image URL</Label>
              <Input
                type="text"
                placeholder="https://..."
                value={editContent.backgroundImage || ''}
                onChange={(e) => setEditContent({ ...editContent, backgroundImage: e.target.value })}
              />
            </div>

            <div>
              <Label>Padding Top (px)</Label>
              <Input
                type="number"
                value={editContent.padding?.top || 60}
                onChange={(e) => setEditContent({
                  ...editContent,
                  padding: { ...editContent.padding, top: parseInt(e.target.value) }
                })}
              />
            </div>

            <div>
              <Label>Padding Bottom (px)</Label>
              <Input
                type="number"
                value={editContent.padding?.bottom || 60}
                onChange={(e) => setEditContent({
                  ...editContent,
                  padding: { ...editContent.padding, bottom: parseInt(e.target.value) }
                })}
              />
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

      <div style={containerStyles}>
        {children ? (
          <>
            {children}
          </>
        ) : (
          <div className="text-gray-400 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
            <div className="text-sm font-medium">Drop blocks here or click "Add Block"</div>
            <div className="text-xs mt-1 opacity-75">Add child blocks to section</div>
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
      </div>
    </section>
  );
};
