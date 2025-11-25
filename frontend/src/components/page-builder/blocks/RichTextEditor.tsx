'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  showToolbar?: boolean;
}

const MenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    icon: React.ReactNode;
  }
>(({ active, icon, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900',
      active && 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      className
    )}
    {...props}
  >
    {icon}
  </button>
));
MenuButton.displayName = 'MenuButton';

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className = '',
  showToolbar = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          languageClassPrefix: 'language-',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
    immediatelyRender: false,
  });

  const addLink = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter URL:');
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return <div className="p-4 text-gray-500">Loading editor...</div>;
  }

  return (
    <div className={cn('border rounded-lg bg-white overflow-hidden', className)}>
      {showToolbar && editable && (
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 overflow-x-auto">
          {/* Text Formatting */}
          <MenuButton
            icon={<Bold className="w-4 h-4" />}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          />
          <MenuButton
            icon={<Italic className="w-4 h-4" />}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          />
          <MenuButton
            icon={<UnderlineIcon className="w-4 h-4" />}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          />
          <MenuButton
            icon={<Strikethrough className="w-4 h-4" />}
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          />

          <Divider />

          {/* Headings */}
          <MenuButton
            icon={<Heading1 className="w-4 h-4" />}
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          />
          <MenuButton
            icon={<Heading2 className="w-4 h-4" />}
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          />
          <MenuButton
            icon={<Heading3 className="w-4 h-4" />}
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          />

          <Divider />

          {/* Lists */}
          <MenuButton
            icon={<List className="w-4 h-4" />}
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          />
          <MenuButton
            icon={<ListOrdered className="w-4 h-4" />}
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered list"
          />

          <Divider />

          {/* Blocks */}
          <MenuButton
            icon={<Quote className="w-4 h-4" />}
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          />
          <MenuButton
            icon={<Code className="w-4 h-4" />}
            active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code block"
          />

          <Divider />

          {/* Media & Links */}
          <MenuButton
            icon={<LinkIcon className="w-4 h-4" />}
            active={editor.isActive('link')}
            onClick={addLink}
            title="Add link"
          />
          <MenuButton
            icon={<ImageIcon className="w-4 h-4" />}
            onClick={addImage}
            title="Add image"
          />

          <Divider />

          {/* History */}
          <MenuButton
            icon={<Undo2 className="w-4 h-4" />}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          />
          <MenuButton
            icon={<Redo2 className="w-4 h-4" />}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          />
        </div>
      )}

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent
          editor={editor}
          className={cn(
            'prose prose-sm max-w-none focus:outline-none',
            'prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2',
            'prose-li:my-0',
            !editable && 'pointer-events-none'
          )}
        />
      </div>
    </div>
  );
};
