import React from 'react'
import { useEditor, EditorContent, BubbleMenu, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface EditorProps {
    readonly?: boolean,
    defaultValue?: any
}

export default function Editor({readonly, defaultValue}: EditorProps) {
    const editor = useEditor({
        editable: !readonly,
        extensions: [
            StarterKit,
        ],
        content: defaultValue
    });

    return (
        <div>
            
        </div>
    )
}
