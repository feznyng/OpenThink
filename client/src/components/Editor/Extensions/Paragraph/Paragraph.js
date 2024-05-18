import { mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './ParagraphComponent';
import Paragraph from '@tiptap/extension-paragraph';
import { Plugin, PluginKey } from 'prosemirror-state'

export default Paragraph.extend({
  addAttributes() {
    return {
        ...this.parent?.(),
    }
  },
})