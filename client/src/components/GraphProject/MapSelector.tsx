import { MenuItem, Select } from '@material-ui/core'
import React from 'react'

const maps = [
    {
        title: "Map 1"
    },
    {
        title: "Map 2"
    }
]

export default function MapSelector(props: {style?: any}) {
    return (
        <div
            {...props}
        >
            <Select
                defaultValue={0}
                disableUnderline
            >
                {
                    maps.map((m, i) => (
                        <MenuItem value={i}>
                            {m.title}
                        </MenuItem>
                    ))
                }
            </Select>
        </div>
    )
}
