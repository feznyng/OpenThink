import { InputAdornment, OutlinedInputProps, TextFieldProps, OutlinedInput as OInput, TextField } from '@material-ui/core'
import React from 'react'

export default function OutlinedInput(props: TextFieldProps) {
    return (
        <TextField 
            {...props}
            variant="outlined"
            InputProps={{
                style: {borderRadius: 30},
                ...props.InputProps
            }}
        />
    )
}
