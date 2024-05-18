import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import BlockWrapper from '../BlockWrapper'
export default (props: any) => {
  return (
    <BlockWrapper
    >
      <blockquote>
        <NodeViewContent/>
      </blockquote>
    </BlockWrapper>
  )
}
