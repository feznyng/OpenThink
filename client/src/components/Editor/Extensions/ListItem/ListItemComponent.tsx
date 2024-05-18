import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import BlockWrapper from '../BlockWrapper'

export default (props: any) => {const pos = props.getPos();
  let depth;
  let orderType;
  let unorderType;
  let parentType;
  try {
    const $pos = props.editor.state.doc.resolve(pos);
    depth = $pos.depth;
    parentType = $pos.parent.type.name
    if (depth % 2 !== 0) {
      depth--;
    }

    depth /= 2;
    depth %= 3;

    switch(depth) {
      case 0:
        unorderType = 'disc'
        break;
      case 1:
        orderType = 'lower-alpha';
        unorderType = 'circle'
        break;
      case 2:
        orderType = 'lower-roman';
        unorderType = 'square'
        break;
    }

  } catch(e) {
    
  }

  return (
    <BlockWrapper>
      <li style={{listStyleType: parentType === 'orderedList' ? orderType : unorderType}}>
        <NodeViewContent/>
      </li>
    </BlockWrapper>
  )
}
