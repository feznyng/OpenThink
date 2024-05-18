import React, {ReactElement} from 'react';
import { ButtonGroup, IconButton } from '@material-ui/core';
import { Add, DragIndicator, MoreVert } from '@material-ui/icons';
import { NodeViewWrapper } from '@tiptap/react'

interface BlockWrapperProps {
    children: ReactElement | ReactElement[] | string,
    type?: string,
    hideActions?: boolean,
    placeholder?: ReactElement,
    empty?: boolean
}

export default function BlockWrapper({children, empty, hideActions, placeholder}: BlockWrapperProps) {
    const [state, setState] = React.useState({
        hover: false,
    })

    return (
        <NodeViewWrapper as="p">
            <div 
                style={{ position: 'relative', marginLeft: hideActions ? 0 : -100, userSelect: 'text'}}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
                draggable="true"
                onDragStart={() => console.log('start drag')}
            >
                {
                    !hideActions && 
                    <div
                        draggable="true"
                        data-drag-handle
                        style={{userSelect: 'none', display: state.hover ? 'inline' : 'none', position: 'absolute', left: 70, top: 0}}
                    >
                        <span style={{cursor: ''}}>
                            <MoreVert fontSize="small"/>
                        </span>
                    </div>
                }
                
                <div style={{marginLeft: hideActions ? 0 : 85, position: 'relative', userSelect: 'text'}}>
                    {children}
                    {
                        empty && 
                        <div style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}>
                            <p>{placeholder}</p>
                        </div>
                    }
                </div>
            </div>
        </NodeViewWrapper>
    )
}