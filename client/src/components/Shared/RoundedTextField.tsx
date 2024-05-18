import { TextFieldProps } from '@material-ui/core'
import { Search } from '@material-ui/icons'
import React from 'react'
import TextField from './TextField'

export default function RoundedTextField({variant, ...props}: TextFieldProps) {
    return (
        <TextField
            {...props}
            variant={variant ? variant : 'outlined'}
            InputProps={{
                ...props.InputProps,
                style: {...props.InputProps?.style, borderRadius: 25, cursor: 'pointer'},
            }}
        />
    )
}
