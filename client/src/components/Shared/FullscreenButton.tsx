import { ButtonProps, IconButton, IconButtonProps } from '@material-ui/core'
import { Fullscreen, FullscreenExit } from '@material-ui/icons'
import React from 'react'

interface FullscreenButtonProps {
    expanded?: boolean
} 

export default function FullscreenButton({expanded, ...props}: FullscreenButtonProps & Partial<IconButtonProps>) {
    return (
        <IconButton
            {...props}
        >
            {
                expanded ? <FullscreenExit/> : <Fullscreen/>
            }
        </IconButton>
    )
}
