import { IconButton, InputAdornment } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import React from 'react'

interface ShowPasswordProps {
    showPassword: boolean, 
    onChange: (showPassword: boolean) => void
}

export default function ShowPassword({showPassword, onChange}: ShowPasswordProps) {
    return (
        <InputAdornment position='end'> 
            <IconButton
                onClick={() => onChange(!showPassword)}
                tabIndex="-1"
            >
                {showPassword ? <VisibilityOff/> : <Visibility/>}
            </IconButton>
        </InputAdornment>
    )
}
