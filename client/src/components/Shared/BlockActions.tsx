import { IconButton } from '@material-ui/core'
import { Add, DragHandle, DragIndicator, MoreVert } from '@material-ui/icons'
import { Tooltip } from '@mui/material'
import React, { CSSProperties } from 'react'

interface BlockActionsProps {
    displayActions?: boolean,
    onAdd?: () => void,
    onOptions?: (e: any) => void,
    style?: CSSProperties
}


export default function BlockActions({displayActions, style, onAdd, onOptions}: BlockActionsProps) {
    return (
        <div
            onClick={e => {e.stopPropagation(); e.preventDefault()}}
            style={style ? style : {position: 'absolute', left: -25, top: 0, height: '100%', display: 'flex', alignItems: 'center', minWidth: 55}}
        >
            {
                displayActions && 
                <React.Fragment>
                    <IconButton
                        size="small"
                        style={{marginLeft: -5}}
                        onClick={onOptions}
                    >
                        <MoreVert/>
                    </IconButton>
                </React.Fragment>
            }
        </div>
    )
}
