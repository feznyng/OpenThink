import { MenuItem, Select } from '@material-ui/core'
import React from 'react'

const views = [
    {
        title: "View 1"
    },
    {
        title: "View 2"
    }
]

export default function ViewSelector(props: {style?: any}) {
    return (
        <div
            {...props}
        >
            <Select
                defaultValue={0}
                disableUnderline
            >
                {
                    views.map((m, i) => (
                        <MenuItem value={i}>
                            {m.title}
                        </MenuItem>
                    ))
                }
            </Select>
        </div>
    )
}
