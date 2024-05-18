import React, { CSSProperties } from 'react'
import Typography from './Typography'

interface BulletDelimiterProps {
    style?: CSSProperties
}

export default function BulletDelimiter({style}: BulletDelimiterProps) {
    return (
        <Typography style={style}>
            {'\u2022 '}
        </Typography>
    )
}
