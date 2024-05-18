import { FiberManualRecord } from '@material-ui/icons'
import React from 'react'

export default function ColorCircle({style}: {style?: React.CSSProperties}) {
    return (
        <FiberManualRecord style={{color: 'lightgrey', ...style}}/>
    )
}
