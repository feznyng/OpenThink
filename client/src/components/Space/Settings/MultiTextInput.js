import { IconButton, Switch, TextField, Typography } from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React from 'react'
import { SpaceOptionButton } from '../SpaceOptionButton'

const MultiTextInput = ({onChange, values, disabled}) => {
    return (
        <div style={{position: 'relative'}}>
            {
                values.map(v => (
                    <TextField
                        disabled={disabled}
                        value={v.value}
                        onChange={e => {
                            v.value = e.target.value;
                            onChange(values);
                        }}
                        InputProps={{
                            endAdornment: <Add/>
                        }}
                        fullWidth
                        style={{marginTop: 10}}
                    />
                ))
            }
        </div>
    )
}

export default MultiTextInput;