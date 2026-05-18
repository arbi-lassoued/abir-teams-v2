// src/components/RichTextEditor.jsx
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

// Syntax highlighting example
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
lowlight.registerLanguage('js', javascript);
lowlight.registerLanguage('python', python);

export default function RichTextEditor({ value, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Underline,
            Link,
            Image,
            Highlight,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TaskList,
            TaskItem,
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            if (onChange) onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border p-2 rounded-t-lg bg-gray-50">
                {toolbarButton(editor, 'bold', 'B')}
                {toolbarButton(editor, 'italic', 'I')}
                {toolbarButton(editor, 'underline', 'U')}
                {toolbarButton(editor, 'strike', 'S')}
                {toolbarButton(editor, 'highlight', 'HL')}

                {headingButton(editor, 1)}
                {headingButton(editor, 2)}
                {headingButton(editor, 3)}

                {listButton(editor, 'bulletList', '• List')}
                {listButton(editor, 'orderedList', '1. List')}
                {listButton(editor, 'taskList', '☑ Tasks')}

                {alignButton(editor, 'left', '⯇')}
                {alignButton(editor, 'center', '≡')}
                {alignButton(editor, 'right', '⯈')}

                {codeBlockButton(editor)}
                <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)}>Table</button>
                <button
                    onClick={() => {
                        const url = window.prompt('Image URL');
                        if (url) editor.chain().focus().setImage({ src: url }).run();
                    }}
                    className={btn(false)}
                >
                    🖼
                </button>
                <button
                    onClick={() => {
                        const url = window.prompt('Link URL');
                        if (url) editor.chain().focus().setLink({ href: url }).run();
                    }}
                    className={btn(editor.isActive('link'))}
                >
                    🔗
                </button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="border border-t-0 rounded-b-lg p-2 min-h-[400px] bg-white prose max-w-none"
            />
        </div>
    );
}

// ----- Toolbar helpers -----
function btn(active) {
    return `px-2 py-1 border rounded ${active ? 'bg-blue-200 font-bold' : 'bg-white'}`;
}

function toolbarButton(editor, command, label) {
    const isActive = editor.isActive(command);
    return (
        <button
            onClick={() => editor.chain().focus()[`toggle${capitalize(command)}`]().run()}
            className={btn(isActive)}
        >
            {label}
        </button>
    );
}

function headingButton(editor, level) {
    const isActive = editor.isActive('heading', { level });
    return (
        <button onClick={() => editor.chain().focus().toggleHeading({ level }).run()} className={btn(isActive)}>
            H{level}
        </button>
    );
}

function listButton(editor, type, label) {
    const isActive = editor.isActive(type);
    return (
        <button onClick={() => editor.chain().focus()[`toggle${capitalize(type)}`]().run()} className={btn(isActive)}>
            {label}
        </button>
    );
}

function alignButton(editor, align, label) {
    const isActive = editor.isActive({ textAlign: align });
    return <button onClick={() => editor.chain().focus().setTextAlign(align).run()} className={btn(isActive)}>{label}</button>;
}

function codeBlockButton(editor) {
    const isActive = editor.isActive('codeBlock');
    return <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(isActive)}>{"</>"}</button>;
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
