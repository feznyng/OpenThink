import { Menu, MenuProps, Popover } from '@material-ui/core'
import React, { useEffect } from 'react'
import { isValidHttpUrl } from '../../utils/urlutils'
import Button from '../Shared/Button'
import TextField from '../Shared/TextField'
import Typography from '../Shared/Typography'

interface LinkEditorMenuProps {
    onConfirm: (link: string) => void,
    defaultLink?: string,
}

export default function LinkEditorMenu({onConfirm, defaultLink, ...props}: LinkEditorMenuProps & MenuProps) {
    const [state, setState] = React.useState({
        url: ''
    })
    
    useEffect(() => {
        setState({
            ...state,
            url: defaultLink ? defaultLink : ''
        })
    }, [defaultLink])

    const onConfirmEnter = () => {setState({...state, url: ''}); onConfirm(state.url)}

    useEffect(() => {
        const onEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onConfirmEnter()
                e.preventDefault()
                e.stopPropagation()
            }
        }
        document.addEventListener('keypress', onEnter)

        return () => document.removeEventListener('keypress', onEnter)
    }, [onConfirmEnter])

    const validUrl = isValidHttpUrl(state.url) || state.url.length === 0

    return (
        <Menu
            {...props}
            disableAutoFocus
        >
            <div style={{position: 'relative', padding: 10}}>
                <TextField
                    placeholder='Enter URL'
                    fullWidth
                    size="small"
                    autoFocus
                    onChange={e => setState({...state, url: e.target.value})}
                    error={!validUrl}
                    value={state.url}
                    helperText={validUrl ? '' : "Invalid URL"}
                />
        
                <div style={{height: 35}}/> 
                <Button 
                    variant="contained"
                    color="primary" 
                    size="small" 
                    style={{position: 'absolute', right: 10, bottom: 0}} 
                    disabled={!validUrl}
                    onClick={onConfirmEnter}
                >
                    Confirm
                </Button>
            </div>
        </Menu>
    )
}
