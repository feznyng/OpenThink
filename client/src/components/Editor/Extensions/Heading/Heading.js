import { mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './HeadingComponent';
import Heading from '@tiptap/extension-heading';
import { Plugin, PluginKey } from 'prosemirror-state'

export default Heading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})