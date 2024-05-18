import { ClickAwayListener, Popover } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React, { useState } from 'react'
import { Anchor } from '../Post/PostContentEditor'
import Button from '../Shared/Button'
import TextField from '../Shared/TextField'

interface CreateSectionButtonProps {
    createSection: ({value}: {value: string}) => void
}

interface CreateSectionButtonState {
    anchorEl: Anchor,
    section: {
        value: string,
    }
}

export default function CreateSectionButton({createSection}: CreateSectionButtonProps) {
    const [state, setState] = useState<CreateSectionButtonState>({
        anchorEl: null,
        section: {
            value: ''
        }
    })

    const onClose = () => setState({...state, anchorEl: null, section: {value: ''}})

    const onFinish = () => {
        if (state.section.value.length > 0) {
            onClose()
            createSection(state.section)
        }
       
    }

    return (
        <ClickAwayListener
            onClickAway={onClose}
        >
            <div>
                <Button 
                    startIcon={<Add/>} 
                    style={{minWidth: 150}}
                    onClick={(e) => setState({...state, anchorEl: e.currentTarget})}
                >
                    Create Section
                </Button>
                <Popover open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={onClose}>
                    <div style={{padding: 10, display: 'flex', alignItems: 'center'}}>
                        <TextField
                            variant='plain'
                            autoFocus
                            onKeyPress={({key}) => key === 'Enter' && onFinish()}
                            placeholder="Name Section"
                            value={state.section.value}
                            onChange={e => setState({...state, section: {value: e.target.value}})}
                        />
                        <Button 
                            size="small" 
                            variant='contained' 
                            color="primary" 
                            disabled={state.section.value.length == 0}
                            onClick={onFinish}
                        >
                            Create
                        </Button>
                    </div>
                </Popover>
            </div>
        </ClickAwayListener>
    )
}
