import React from 'react'
import {Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress} from '@material-ui/core'

interface ButtonExtension {
    loading?: boolean
}

export type ButtonProps = ButtonExtension & MuiButtonProps

export default function Button({loading, ...props}: ButtonProps) {
    return (
        <MuiButton
            {...props}
            startIcon={loading ? <CircularProgress style={{color: 'white'}} size={20}/> : props.startIcon}
            endIcon={loading ? undefined : props.endIcon}
            style={{ borderRadius: 20, textTransform: 'none', ...props.style}}
            disableElevation
        />
    )
}
