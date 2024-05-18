import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import React from 'react'

const LinkPreview = (props) => {
  const increase = () => {
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    })
  }

  return (
    <NodeViewWrapper className="react-component">
      
    </NodeViewWrapper>
  )
}


export default Node.create({
    name: 'reactComponent',
  
    group: 'block',
  
    atom: true,
  
    addAttributes() {
      return {
        count: {
          default: 0,
        },
      }
    },
  
    parseHTML() {
      return [
        {
          tag: 'react-component',
        },
      ]
    },
  
    renderHTML({ HTMLAttributes }) {
      return ['react-component', mergeAttributes(HTMLAttributes)]
    },
  
    addNodeView() {
      return ReactNodeViewRenderer(LinkPreview)
    },
  })