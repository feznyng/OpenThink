import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React, { CSSProperties } from 'react'
import Button from '../Shared/Button'

interface AddEntry {
    addEntry: () => void, 
    addText?: string, 
    addIcon?: React.FC,
    style?: CSSProperties
}

export default function AddEntry({addEntry, style, addText, addIcon}: AddEntry) {
    return (
        <div style={{width: '100%', ...style}}>
            <Button
                fullWidth
                onClick={addEntry}
                startIcon={<Add/>}
            >
                {addText ? addText : 'New'} 
            </Button>
        </div>
    )
}
