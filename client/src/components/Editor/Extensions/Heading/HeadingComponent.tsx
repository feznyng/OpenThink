import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import BlockWrapper from '../BlockWrapper'
import { Typography } from '@material-ui/core';
export default ({node}: any) => {
  const {level} = node.attrs;
  let type: 'h1' | 'h2' | 'h3' = 'h1'
  switch(level) {
    case 1: 
      type = 'h1'
      break;
    case 2: 
      type = 'h2'
      break;
    case 3: 
      type = 'h3'
      break;
  }

  return (
    <BlockWrapper
      empty={node.content.size === 0}
      placeholder={
        <h1
          style={{color: '#adb5bd'}}
        >
          Heading 1
        </h1>
      }
    >
      <NodeViewContent as={type}/>
    </BlockWrapper>
  )
}
