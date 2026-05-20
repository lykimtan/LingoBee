"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";

interface RichTextEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  className?: string;
  editorClassName?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  className,
  editorClassName,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight.configure({ multicolor: true })],
    content: value || "",
    immediatelyRender: true,
    editorProps: {
      attributes: {
        class:
          editorClassName ||
          "min-h-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:outline-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_mark]:px-0.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const buttonBaseClass =
    "rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900";

  return (
    <div className={className}>
      {editor && (
        <div className="mb-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("bold") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("italic") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Italic
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("strike") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Strike
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("highlight") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Highlight
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className={`${buttonBaseClass} bg-white`}
          >
            Clear HL
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHighlight({ color: "#fde68a" }).run()}
            className={`${buttonBaseClass} bg-yellow-100 text-gray-900`}
          >
            Yellow
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHighlight({ color: "#bbf7d0" }).run()}
            className={`${buttonBaseClass} bg-green-100 text-gray-900`}
          >
            Green
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHighlight({ color: "#fecdd3" }).run()}
            className={`${buttonBaseClass} bg-rose-100 text-gray-900`}
          >
            Pink
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHighlight({ color: "#bfdbfe" }).run()}
            className={`${buttonBaseClass} bg-blue-100 text-gray-900`}
          >
            Blue
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${buttonBaseClass} ${
              editor.isActive("heading", { level: 2 }) ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${buttonBaseClass} ${
              editor.isActive("heading", { level: 1 }) ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${buttonBaseClass} ${
              editor.isActive("heading", { level: 3 }) ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("bulletList") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Bullets
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("orderedList") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Numbered
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${buttonBaseClass} ${
              editor.isActive("blockquote") ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            Quote
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
