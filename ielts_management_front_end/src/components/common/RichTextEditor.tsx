"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Highlighter } from 'lucide-react';
import React, { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onFocus?: () => void;
}

const extensions = [
    StarterKit,
    Highlight,
];

export const RichTextEditor = ({ value, onChange, placeholder, onFocus }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions,
        immediatelyRender: false,
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm prose-invert focus:outline-none min-h-[100px] max-h-[250px] overflow-y-auto px-4 py-3 bg-white/5 rounded-b-xl border-x border-b border-white/10 text-white placeholder:text-white/30',
                placeholder: placeholder || 'Type your note here...',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: () => {
            if (onFocus) onFocus();
        }
    });

    // Update content if value changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col w-full rounded-xl overflow-hidden border border-white/10 focus-within:border-white/30 transition-colors bg-black/20">
            <div className="flex items-center gap-1 border-b border-white/10 p-2 bg-white/5">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                    title="Underline"
                >
                    <UnderlineIcon size={16} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('highlight') ? 'bg-white/20 text-[#f4e900]' : 'text-white/50 hover:bg-white/10 hover:text-[#f4e900]'}`}
                    title="Highlight"
                >
                    <Highlighter size={16} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};
