import { Chip, Divider, Typography, useTheme } from '@material-ui/core'
import React from 'react'
import { darkBorderStyle, lightBorderStyle } from '../../pages/Messaging'

interface DateDividerProps {
    date: string,
    style?: React.CSSProperties
}

export default function DateDivider({date, style}: DateDividerProps) {

    let dateString = new Date(date).toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long', })
    let lastDigit: string | number = dateString.substring(dateString.length - 1, dateString.length)
    lastDigit = lastDigit ? parseInt(lastDigit) : lastDigit
    
    if (lastDigit) {
        if (lastDigit == 1) {
            dateString += 'st'
        } else if (lastDigit == 2) {
            dateString += 'nd'
        }
        else if (lastDigit == 3) {
            dateString += 'rd'
        } else {
            dateString += 'th'
        }
    }

    const theme = useTheme()
    const borderStyle = theme.palette.type === 'dark' ? darkBorderStyle : lightBorderStyle
    return (
        <div style={{...style, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: '100%', borderBottom: 'solid', ...borderStyle}}/>
            <Chip
                label={
                    <Typography style={{marginLeft: 5}} variant="subtitle2">
                        {dateString}
                    </Typography>
                }
                variant="outlined"
            />
            <div style={{width: '100%', borderBottom: 'solid', ...borderStyle}}/>
        </div>
    )
}
