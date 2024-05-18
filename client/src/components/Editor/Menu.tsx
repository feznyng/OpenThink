import { Paper } from '@material-ui/core'
import { AddComment, FormatBold, FormatColorFill, FormatItalic, FormatItalicOutlined, FormatUnderlined, Link } from '@material-ui/icons'
import React from 'react'
import Button from '../Shared/Button'

interface MenuProps {
    editor: any
}
const formattingOptions = {minHeight: 30, maxHeight: 30, height: 30, minWidth: 30, maxWidth: 30, width: 30, borderRadius: 5}

export default function Menu({editor}: MenuProps) {
    return (
        <Paper>
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
                style={formattingOptions}
            >
                <FormatBold/>
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
                style={formattingOptions}
            >
                <FormatItalicOutlined/>
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'is-active' : ''}
                style={formattingOptions}
            >
                <FormatUnderlined/>
            </Button>
            <Button
                onClick={() => editor.chain().focus().setColor('#70CFF8').run()}
                className={editor.isActive('textStyle', { color: '#70CFF8' }) ? 'is-active' : ''}
                style={formattingOptions}
            >
                <FormatColorFill/>
            </Button>
            <Button
                onClick={() => editor.chain().focus().setLink().run()}
                className={editor.isActive('link') ? 'is-active' : ''}
                style={formattingOptions}
            >
                <Link/>
            </Button>
        </Paper>
    )
}
