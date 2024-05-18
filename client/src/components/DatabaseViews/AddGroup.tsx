import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React from 'react'
import Button from '../Shared/Button'
import { Attribute, Group } from '../../types/database'

interface AddGroup {
    addGroup: (group: Group) => void, 
    addText?: string, 
    addIcon?: React.FC,
    attribute: Attribute
}

export default function AddGroup({addGroup, addText, addIcon}: AddGroup) {
    return (
        <div style={{width: '100%'}}>
            <Button
                startIcon={addIcon ? addIcon : <Add/>}
                fullWidth
            >
                {addText ? addText : 'New'}
            </Button>
        </div>
    )
}
