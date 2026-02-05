import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from "lucide-react";

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex gap-1 p-1 border-b bg-gray-50 rounded-t-lg">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200 text-black" : "text-gray-600"}`}
                title="Bold"
            >
                <Bold size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200 text-black" : "text-gray-600"}`}
                title="Italic"
            >
                <Italic size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-black" : "text-gray-600"}`}
                title="Heading 1"
            >
                <Heading1 size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-black" : "text-gray-600"}`}
                title="Heading 2"
            >
                <Heading2 size={16} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200 text-black" : "text-gray-600"}`}
                title="Bullet List"
            >
                <List size={16} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200 text-black" : "text-gray-600"}`}
                title="Ordered List"
            >
                <ListOrdered size={16} />
            </button>
        </div>
    );
};

export default function Editor({ value, onChange, editable = true, placeholder = "Write something..." }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none max-w-none min-h-[100px] p-4',
            },
        },
    });

    // Effect to update content if value changes externally (and not focused? tricky loop)
    // For simplicity, we assume value is initial content or strictly controlled if needed.
    // TipTap doesn't like strict control easily. We'll treat `value` as initial only or use key key reset.

    if (!editor) {
        return null;
    }

    return (
        <div className={`border rounded-lg ${editable ? 'border-gray-300' : 'border-transparent'}`}>
            {editable && <MenuBar editor={editor} />}
            <EditorContent editor={editor} className={editable ? "bg-white rounded-b-lg" : ""} />
        </div>
    );
}
