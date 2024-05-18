import { ClickAwayListener } from '@material-ui/core'
import { ListItemButton } from '@mui/material'
import React from 'react'
import { Entry } from '../../types/database'
import TextField from '../Shared/TextField'

export interface AddTaskListItemProps {
    addEntry: (entry: Entry) => void,
    onClose: () => void
}

const task = {
    id: "new-task",
    attributeValues: {
        "Title": {
            value: ''
        }
    }
}

export default function AddTaskListItem({addEntry, onClose}: AddTaskListItemProps) {
    const [state, setState] = React.useState({
        task
    })

    const createTask = () => {
        addEntry(state.task)
        setState({
            ...state,
            task
        })
    }

    const onClickAway = () => {
        state.task.attributeValues["Title"].value.length > 0 && createTask()
        onClose()
    }

    return (
        <ClickAwayListener
            onClickAway={onClickAway}
        >
            <ListItemButton 
                disableRipple
                style={{position: 'relative', paddingLeft: 5}}
            >
                <span>
                    <TextField
                        variant="plain"
                        size="small"
                        placeholder="Enter Task..."
                        autoFocus
                        value={state.task.attributeValues["Title"].value}
                        onKeyDown={({key}) => {
                            if (key === 'Enter' && state.task.attributeValues["Title"].value.length > 0) {
                                createTask()
                            }
                            if (key === 'Escape' || (key === 'Backspace' && state.task.attributeValues["Title"].value.length === 0)) {
                                onClose()
                            }
                        }}
                        onChange={e => setState({...state,  task: {...state.task, attributeValues: {...state.task.attributeValues, "Title": {value: e.target.value}}}})}
                    />
                </span>
            </ListItemButton>
        </ClickAwayListener>
    )
}
