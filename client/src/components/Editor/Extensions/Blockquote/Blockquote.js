import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './BlockquoteComponent';
import Blockquote from '@tiptap/extension-blockquote';
import { Plugin, PluginKey } from 'prosemirror-state'

export default Blockquote.extend({
  draggable: true,
  content: 'inline*',
  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})