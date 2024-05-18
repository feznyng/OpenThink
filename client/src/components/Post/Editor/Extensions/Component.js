import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';

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