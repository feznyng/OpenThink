import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react';

export const Component = (props) => {
  return (
    <NodeViewWrapper style={{display: 'inline-block'}}>
      <span className="mention" contentEditable={false}>#{props.node.attrs.label}</span>
    </NodeViewWrapper>
  )
}

export default Node.create({
  name: 'hashtag',

  group: 'block',
  inline: true,
  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})