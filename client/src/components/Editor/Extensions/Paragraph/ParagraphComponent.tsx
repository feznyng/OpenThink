import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import BlockWrapper from '../BlockWrapper'
import { Typography } from '@material-ui/core';

const styles = {
  draggableItem: {
    display: 'flex',
    padding: '0.5rem',
    margin: '0.5rem 0',
    alignItems: 'center'
  },

  dragHandle: {
    flex: '0 0 auto',
    position: 'relative',
    width: '1rem',
    height: '1rem',
    top: '0.1rem',
    marginLeft: '-1.5rem',
    paddingRight: '0.5rem',
    cursor: 'grab',
    backgroundImage:
      'url(\'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.2" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>\')',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center'
  }
};


export default (props: any) => {

  return (
    <BlockWrapper>
      <NodeViewContent/>
    </BlockWrapper>
  )
}