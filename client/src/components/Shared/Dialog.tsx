import React from 'react'
import {Dialog as MuiDialog, DialogProps, IconButton} from '@material-ui/core'
import { Close } from '@material-ui/icons';

export default function Dialog(props: DialogProps & {disableCloseButton?: boolean}) {
    const {open, children, onClose, disableCloseButton} = props;

    return (
        <MuiDialog
            {...props}
            style={{
                ...props.style,
                overflow: 'none',
            }}
        >
            {
                !disableCloseButton &&
                <IconButton
                    size="small"
                    style={{position: 'absolute', right: 15, top: 10, zIndex: 1000}}
                    onClick={(e) => onClose && onClose(e, 'backdropClick')}
                >
                    <Close/>
                </IconButton>
            }
            
            {children}
        </MuiDialog>
    )
}
