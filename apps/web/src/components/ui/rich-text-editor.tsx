'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';

const richTextEditorVariants = cva(
  'min-h-[200px] w-full rounded-md border border-input bg-background text-foreground text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border-2',
      },
      size: {
        sm: 'min-h-[150px]',
        md: 'min-h-[200px]',
        lg: 'min-h-[300px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        isActive && 'bg-muted text-primary',
        !isActive && 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

interface ToolbarProps {
  editor: Editor;
}

function Toolbar({ editor }: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
      <div className="flex gap-1 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <Code className="w-4 h-4 text-current" />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4 text-current" />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4 text-current" />
        </ToolbarButton>
      </div>

      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4 text-current" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4 text-current" />
        </ToolbarButton>
      </div>
    </div>
  );
}

export interface RichTextEditorHandle {
  focus: () => void;
  setContent: (content: string) => void;
  getHTML: () => string;
  getText: () => string;
}

export interface RichTextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof richTextEditorVariants> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    {
      className,
      variant,
      size,
      value,
      onChange,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || 'Start writing...',
        }),
      ],
      content: '',
      immediatelyRender: false,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
      },
    });

    useEffect(() => {
      if (editor && value !== undefined) {
        const currentContent = editor.getHTML();
        if (currentContent !== value) {
          editor.commands.setContent(value || '');
        }
      }
    }, [editor, value]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.commands.focus();
      },
      setContent: (content: string) => {
        editor?.commands.setContent(content);
      },
      getHTML: () => editor?.getHTML() || '',
      getText: () => editor?.getText() || '',
    }));

    if (!editor) {
      return (
        <div
          className={cn(richTextEditorVariants({ variant, size }), className)}
          {...props}
        >
          <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
            Loading editor...
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(richTextEditorVariants({ variant, size }), className)}
        {...props}
      >
        <Toolbar editor={editor} />
        <div className="p-3">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor, richTextEditorVariants };
