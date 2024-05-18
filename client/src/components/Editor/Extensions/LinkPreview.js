import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

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