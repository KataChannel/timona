'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code2,
  Minus,
  Table as TableIcon,
  Palette,
  Highlighter,
  FileCode,
  Eye,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilePicker } from '@/components/file-manager/FilePicker';
import { FileType } from '@/types/file';
import type { File } from '@/types/file';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  editable = true,
  placeholder = 'Nhập nội dung...',
  className,
}: RichTextEditorProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [sourceViewOpen, setSourceViewOpen] = useState(false);
  const [imageEditOpen, setImageEditOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [sourceHtml, setSourceHtml] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [imageEditData, setImageEditData] = useState({
    src: '',
    alt: '',
    title: '',
    width: '',
    align: 'center' as 'left' | 'center' | 'right',
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-gray-300 my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 font-bold px-3 py-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-3 py-2',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 cursor-pointer',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl',
          'max-w-none focus:outline-none',
          'min-h-[200px] px-4 py-3',
          className
        ),
      },
      handleClickOn: (view, pos, node, nodePos, event) => {
        if (node.type.name === 'image') {
          event.preventDefault();
          openImageEdit();
        }
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border rounded-md p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải editor...</p>
      </div>
    );
  }

  const handleImageSelect = (fileOrUrl: File | string) => {
    if (!editor) return;
    const imageUrl = typeof fileOrUrl === 'string' ? fileOrUrl : fileOrUrl.url;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImagePickerOpen(false);
  };

  const openImageEdit = () => {
    if (!editor) return;
    const { src, alt, title, width } = editor.getAttributes('image');
    if (!src) return;
    
    setImageEditData({
      src: src || '',
      alt: alt || '',
      title: title || '',
      width: width || '',
      align: 'center',
    });
    setImageEditOpen(true);
  };

  const handleImageEdit = () => {
    if (!editor) return;
    
    const attrs: any = {
      src: imageEditData.src,
      alt: imageEditData.alt,
      title: imageEditData.title,
    };
    
    if (imageEditData.width) {
      attrs.width = imageEditData.width;
      attrs.style = `width: ${imageEditData.width}${imageEditData.width.includes('%') ? '' : 'px'}; max-width: 100%;`;
    }
    
    // Apply alignment via style
    const alignStyles = {
      left: 'margin-right: auto;',
      center: 'margin-left: auto; margin-right: auto; display: block;',
      right: 'margin-left: auto;',
    };
    
    if (attrs.style) {
      attrs.style += ` ${alignStyles[imageEditData.align]}`;
    } else {
      attrs.style = alignStyles[imageEditData.align];
    }
    
    editor.chain().focus().updateAttributes('image', attrs).run();
    setImageEditOpen(false);
  };

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '');
    setLinkUrl(previousUrl);
    setLinkText(text);
    setLinkDialogOpen(true);
  };

  const handleSetLink = () => {
    if (!editor || !linkUrl) return;
    let url = linkUrl.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    if (linkText) {
      editor.chain().focus().insertContent('<a href="' + url + '">' + linkText + '</a>').run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const openSourceView = () => {
    if (!editor) return;
    setSourceHtml(editor.getHTML());
    setSourceViewOpen(true);
  };

  const applySourceChanges = () => {
    if (!editor) return;
    editor.commands.setContent(sourceHtml);
    onChange?.(sourceHtml);
    setSourceViewOpen(false);
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addColumnAfter = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const addRowAfter = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      {editable && (
        <div className="border-b bg-muted/20">
          {/* Toolbar - Optimized with grouping */}
          <div className="p-2 flex flex-wrap items-center gap-1.5">
            {/* Group 1: Text Formatting */}
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('bold') && 'bg-background')}
                title="Đậm (Ctrl+B)"
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('italic') && 'bg-background')}
                title="Nghiêng (Ctrl+I)"
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('underline') && 'bg-background')}
                title="Gạch chân (Ctrl+U)"
              >
                <UnderlineIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('strike') && 'bg-background')}
                title="Gạch ngang"
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('code') && 'bg-background')}
                title="Code inline"
              >
                <CodeIcon className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Group 2: Headings Dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1 text-xs"
                  title="Tiêu đề"
                >
                  {editor.isActive('heading', { level: 1 }) && <span className="font-semibold">H1</span>}
                  {editor.isActive('heading', { level: 2 }) && <span className="font-semibold">H2</span>}
                  {editor.isActive('heading', { level: 3 }) && <span className="font-semibold">H3</span>}
                  {!editor.isActive('heading') && <span>Tiêu đề</span>}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn('w-full justify-start gap-2', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
                  >
                    <Heading1 className="h-4 w-4" />
                    <span>Heading 1</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn('w-full justify-start gap-2', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
                  >
                    <Heading2 className="h-4 w-4" />
                    <span>Heading 2</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn('w-full justify-start gap-2', editor.isActive('heading', { level: 3 }) && 'bg-muted')}
                  >
                    <Heading3 className="h-4 w-4" />
                    <span>Heading 3</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Group 3: Colors */}
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Màu chữ"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Màu chữ</div>
                    <div className="grid grid-cols-5 gap-2">
                      {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => editor.chain().focus().setColor(color).run()}
                          className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().unsetColor().run()}
                      className="w-full"
                    >
                      Xóa màu
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title="Tô sáng"
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Tô sáng</div>
                    <div className="grid grid-cols-4 gap-2">
                      {['#fef08a', '#fdba74', '#fca5a5', '#c7d2fe', '#a7f3d0', '#e9d5ff', '#fecdd3', '#cbd5e1'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => editor.chain().focus().setHighlight({ color }).run()}
                          className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editor.chain().focus().unsetHighlight().run()}
                      className="w-full"
                    >
                      Xóa tô sáng
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Group 4: Alignment */}
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-background')}
                title="Căn trái"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'center' }) && 'bg-background')}
                title="Căn giữa"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-background')}
                title="Căn phải"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={cn('h-7 w-7 p-0', editor.isActive({ textAlign: 'justify' }) && 'bg-background')}
                title="Căn đều"
              >
                <AlignJustify className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Group 5: Lists */}
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('bulletList') && 'bg-background')}
                title="Danh sách dấu đầu dòng"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('orderedList') && 'bg-background')}
                title="Danh sách số"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Group 6: Blocks */}
            <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('blockquote') && 'bg-background')}
                title="Trích dẫn"
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn('h-7 w-7 p-0', editor.isActive('codeBlock') && 'bg-background')}
                title="Code block"
              >
                <Code2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="h-7 w-7 p-0"
                title="Đường kẻ ngang"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setImagePickerOpen(true)}
              className="h-8 w-8 p-0"
              title="Chèn hình ảnh"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openLinkDialog}
              className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-muted')}
              title="Chèn liên kết"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            {/* Table Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn('h-8 w-8 p-0', editor.isActive('table') && 'bg-muted')}
                  title="Bảng"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quản lý bảng</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={insertTable}
                      disabled={editor.isActive('table')}
                    >
                      Tạo bảng 3x3
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deleteTable}
                      disabled={!editor.isActive('table')}
                    >
                      Xóa bảng
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addColumnAfter}
                      disabled={!editor.isActive('table')}
                    >
                      Thêm cột
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deleteColumn}
                      disabled={!editor.isActive('table')}
                    >
                      Xóa cột
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRowAfter}
                      disabled={!editor.isActive('table')}
                    >
                      Thêm hàng
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deleteRow}
                      disabled={!editor.isActive('table')}
                    >
                      Xóa hàng
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-6 bg-border mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="h-8 w-8 p-0"
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="h-8 w-8 p-0"
              title="Làm lại (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* View Source */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openSourceView}
              className="h-8 px-3 gap-2"
              title="Xem HTML Source"
            >
              <FileCode className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Source</span>
            </Button>

            {/* Preview Toggle */}
            <Button
              type="button"
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="h-8 px-3 gap-2"
              title={viewMode === 'edit' ? 'Xem trước' : 'Chỉnh sửa'}
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">
                {viewMode === 'edit' ? 'Preview' : 'Edit'}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      {viewMode === 'edit' ? (
        <EditorContent editor={editor} />
      ) : (
        <ScrollArea className="min-h-[200px] max-h-[600px] p-4">
          <div
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }}
          />
        </ScrollArea>
      )}
      {/* Image Picker */}
      <FilePicker
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelect={handleImageSelect}
        fileTypes={[FileType.IMAGE]}
        allowUrl={true}
      />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chèn Liên Kết</DialogTitle>
            <DialogDescription>Nhập URL và text hiển thị cho liên kết</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="link-text">Text hiển thị (tùy chọn)</Label>
                <Input
                  id="link-text"
                  placeholder="Nhập text hiển thị..."
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSetLink();
                    }
                  }}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLinkDialogOpen(false);
                setLinkUrl('');
                setLinkText('');
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSetLink} disabled={!linkUrl}>
              Chèn Liên Kết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Source View Dialog */}
      <Dialog open={sourceViewOpen} onOpenChange={setSourceViewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>HTML Source Code</DialogTitle>
            <DialogDescription>
              Xem và chỉnh sửa HTML source code của nội dung
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="edit" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
              <TabsTrigger value="preview">Xem trước</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="flex-1 mt-4">
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Textarea
                  value={sourceHtml}
                  onChange={(e) => setSourceHtml(e.target.value)}
                  className="min-h-[400px] font-mono text-sm border-0 focus-visible:ring-0"
                  placeholder="HTML source code..."
                />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 mt-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div
                  className="prose prose-sm sm:prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: sourceHtml }}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSourceViewOpen(false);
                setSourceHtml('');
              }}
            >
              Hủy
            </Button>
            <Button onClick={applySourceChanges}>
              Áp dụng thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
