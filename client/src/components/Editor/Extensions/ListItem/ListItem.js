import { mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './ListItemComponent';
import ListItem from '@tiptap/extension-list-item';
import { Plugin, PluginKey } from 'prosemirror-state'

export default ListItem.extend({
  draggable: true,
  content: 'paragraph block*',
  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})