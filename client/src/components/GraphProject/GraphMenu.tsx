import { ButtonGroup, IconButton, Tooltip } from '@material-ui/core'
import { Edit, GetApp, MoreHoriz, MultilineChart, Reply, Share, TableChart } from '@material-ui/icons'
import { Timeline } from '@material-ui/lab'
import React, { CSSProperties } from 'react'

const actions = [
    {
        name: 'Table',
        icon: <TableChart/>
    },
    {
        name: 'Download',
        icon: <GetApp/>,
    },
    {
        name: 'Share',
        icon: <Reply style={{transform: 'scaleX(-1)'}} />
    }
]

interface GraphMenuProps {
    style?: CSSProperties
}

export default function GraphMenu({style}: GraphMenuProps) {
    return (
        <div style={style}>
            {
                actions.map(({name, icon}) => (
                    <Tooltip title={name}>
                        <IconButton
                            size="small"
                            style={{marginRight: 15}}
                        >
                            {icon}
                        </IconButton>
                    </Tooltip>
                ))
            }
        </div>
    )
}
