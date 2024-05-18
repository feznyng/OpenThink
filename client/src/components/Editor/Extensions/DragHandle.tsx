
import { ArrowDownward, ArrowUpward, Link, MoreVert } from '@material-ui/icons';
import { MouseEvent, useState } from 'react';
import { Menu, IconButton, MenuItem, ListItemIcon, ListItemText, ThemeProvider } from '@material-ui/core';
import { Anchor } from '../../Post/PostContentEditor';
import { Editor } from '@tiptap/react';
import { getBlockNode } from './helpers';
import { useHistory } from 'react-router';

const menuActions = [
    {
        name: 'Copy Link',
        icon: <Link/>,
        editable: false
    },
    /* 
    {
        name: 'Move up',
        icon: <ArrowUpward/>,
        editable: true
    },
    {
        name: 'Move up',
        icon: <ArrowDownward/>,
        editable: true
    },
    */
]

interface DragHandleProps {
    editable?: boolean,
    editor: Editor
}

const DragHandle = ({editable, editor}: DragHandleProps) => {
    const [state, setState] = useState<{anchorEl: Anchor, coords: {left: number, top: number}}>({
        anchorEl: null,
        coords: {
            left: 0,
            top: 0
        }
    })

    const history = useHistory()

    const onMenuAction = (e: MouseEvent, type: string) => {
        setState({
            ...state,
            anchorEl: null
        })
        switch(type) {
            case 'Copy Link': {
                let coords = { left: state.coords.left + 20, top: state.coords.top - 5  }
                let node = getBlockNode(coords, editor.view)
                const blockId = node?.getAttribute('data-id')
                navigator.clipboard.writeText(`${window.location.origin}${history.location.pathname}#${blockId}`)
                break
            }
        }
    }

    return (
        <div id='drag-handle' style={{zIndex: 300, visibility: 'hidden'}}>
            <span>
                <IconButton  style={{marginTop: -3}} size="small" onClick={e => setState({...state, anchorEl: e.currentTarget, coords: {left: e.clientX + 20, top: e.clientY}})}>
                    <MoreVert/>
                </IconButton>
                <Menu anchorEl={state.anchorEl} open={!!state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                    {
                        menuActions.filter(action => !action.editable || !!action.editable === !!editable).map(({name, icon}) => (
                            <MenuItem
                                onClick={(e) => onMenuAction(e, name)}
                            >
                                <ListItemIcon>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={name}
                                />
                            </MenuItem>
                        ))
                    }
                </Menu>
            </span>
        </div>
    )
}


export default DragHandle