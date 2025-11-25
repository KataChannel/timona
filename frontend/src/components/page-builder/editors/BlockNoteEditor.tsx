'use client';

/**
 * BlockNote-style Rich Text Editor
 * Senior-level implementation với mobile-first, PWA-ready
 * Sử dụng Tiptap với custom extensions và dynamic GraphQL
 */

import React, { useCallback, useMemo } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Plus,
} from 'lucide-react';

interface BlockNoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

// Toolbar button component - mobile-optimized
const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}> = ({ onClick, active, disabled, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center rounded-md transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} border border-gray-200`}
    title={label}
    aria-label={label}
  >
    {icon}
  </button>
);

// Toolbar separator
const ToolbarSeparator = () => (
  <div className="w-px h-8 bg-gray-300 mx-1" />
);

export default function BlockNoteEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className = '',
  minHeight = '200px',
}: BlockNoteEditorProps) {
  
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `
          prose prose-sm md:prose-base max-w-none
          focus:outline-none
          px-4 py-3
        `,
      },
    },
  });

  // Toolbar actions
  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter link URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  // Mobile-optimized toolbar groups
  const toolbarGroups = useMemo(() => {
    if (!editor) return [];

    return [
      // Text formatting
      {
        label: 'Format',
        buttons: [
          {
            icon: <Bold className="w-4 h-4" />,
            label: 'Bold',
            onClick: () => editor.chain().focus().toggleBold().run(),
            active: editor.isActive('bold'),
          },
          {
            icon: <Italic className="w-4 h-4" />,
            label: 'Italic',
            onClick: () => editor.chain().focus().toggleItalic().run(),
            active: editor.isActive('italic'),
          },
          {
            icon: <Strikethrough className="w-4 h-4" />,
            label: 'Strikethrough',
            onClick: () => editor.chain().focus().toggleStrike().run(),
            active: editor.isActive('strike'),
          },
          {
            icon: <Code className="w-4 h-4" />,
            label: 'Code',
            onClick: () => editor.chain().focus().toggleCode().run(),
            active: editor.isActive('code'),
          },
        ],
      },
      // Headings
      {
        label: 'Headings',
        buttons: [
          {
            icon: <Heading1 className="w-4 h-4" />,
            label: 'Heading 1',
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            active: editor.isActive('heading', { level: 1 }),
          },
          {
            icon: <Heading2 className="w-4 h-4" />,
            label: 'Heading 2',
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            active: editor.isActive('heading', { level: 2 }),
          },
          {
            icon: <Heading3 className="w-4 h-4" />,
            label: 'Heading 3',
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            active: editor.isActive('heading', { level: 3 }),
          },
        ],
      },
      // Lists
      {
        label: 'Lists',
        buttons: [
          {
            icon: <List className="w-4 h-4" />,
            label: 'Bullet List',
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            active: editor.isActive('bulletList'),
          },
          {
            icon: <ListOrdered className="w-4 h-4" />,
            label: 'Ordered List',
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            active: editor.isActive('orderedList'),
          },
          {
            icon: <Quote className="w-4 h-4" />,
            label: 'Quote',
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
            active: editor.isActive('blockquote'),
          },
        ],
      },
      // Media
      {
        label: 'Media',
        buttons: [
          {
            icon: <ImageIcon className="w-4 h-4" />,
            label: 'Image',
            onClick: addImage,
            active: false,
          },
          {
            icon: <LinkIcon className="w-4 h-4" />,
            label: 'Link',
            onClick: addLink,
            active: editor.isActive('link'),
          },
        ],
      },
      // History
      {
        label: 'History',
        buttons: [
          {
            icon: <Undo className="w-4 h-4" />,
            label: 'Undo',
            onClick: () => editor.chain().focus().undo().run(),
            active: false,
            disabled: !editor.can().undo(),
          },
          {
            icon: <Redo className="w-4 h-4" />,
            label: 'Redo',
            onClick: () => editor.chain().focus().redo().run(),
            active: false,
            disabled: !editor.can().redo(),
          },
        ],
      },
    ];
  }, [editor, addImage, addLink]);

  if (!editor) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-t-lg mb-2" />
        <div className="h-64 bg-gray-100 rounded-b-lg" />
      </div>
    );
  }

  return (
    <div 
      className={`blocknote-editor border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}
      onClick={() => editor?.chain().focus().run()}
    >
      {/* Toolbar - sticky on mobile for better UX */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
        <div className="flex gap-1 p-2 min-w-max">
          {toolbarGroups.map((group, groupIndex) => (
            <React.Fragment key={group.label}>
              {groupIndex > 0 && <ToolbarSeparator />}
              <div className="flex gap-1">
                {group.buttons.map((button, buttonIndex) => (
                  <ToolbarButton
                    key={`${group.label}-${buttonIndex}`}
                    {...button}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Editor content */}
      <EditorContent 
        editor={editor} 
        className="blocknote-content bg-white overflow-y-auto max-h-[600px]"
        style={{ minHeight }}
      />

      {/* Character count - optional */}
      {editable && (
        <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
          {editor.storage.characterCount?.characters() || 0} characters
        </div>
      )}
    </div>
  );
}
