import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'
import React from 'react'
import { attributes } from './attribute'
import AttributeLabel from './AttributeLabel'


export default function AttributeTypeSelect({onChange, type, style}: {onChange: (value: string) => void, type: string, style?: React.CSSProperties}) {
    return (
        <div style={style}>
            <FormControl fullWidth size="small">
                <InputLabel style={{marginLeft: 14, marginTop: -8}}>Attribute Type</InputLabel>
                <Select
                    label="Attribute Type"
                    defaultValue={type}
                    onChange={(e) => onChange(e.target.value as string)}
                    variant="outlined"
                >
                    {
                        attributes.map(a => (
                            <MenuItem value={a}>
                                <AttributeLabel
                                    attribute={{type: a, name: a}}
                                />
                            </MenuItem>
                        ))
                    }
                    
                </Select>
            </FormControl>
        </div>
    )
}
