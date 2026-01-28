import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react";
import { cn } from "../../lib/utils";

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center space-x-1 border-b p-2 bg-gray-50 rounded-t-lg">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition",
                    editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600'
                )}
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition",
                    editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600'
                )}
            >
                <Italic className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-gray-300 mx-2" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition",
                    editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600'
                )}
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition",
                    editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600'
                )}
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                    "p-1.5 rounded hover:bg-gray-200 transition",
                    editor.isActive('blockquote') ? 'bg-gray-200 text-black' : 'text-gray-600'
                )}
            >
                <Quote className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function RichTextEditor({ content, onChange, placeholder = "Write something..." }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none p-4 focus:outline-none min-h-[150px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="border rounded-lg bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
