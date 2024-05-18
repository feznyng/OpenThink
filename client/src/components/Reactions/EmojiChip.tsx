import { Chip, ChipProps } from '@material-ui/core'
import React from 'react'
import Typography from '../Shared/Typography'

interface EmojiChipProps {

}

export default function EmojiChip({icon, label, ...props}: Partial<ChipProps> & EmojiChipProps) {
    return (
        <Chip
            {...props}
            size="small"
            clickable
            variant="outlined"
            label={
                <span style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginLeft: -3}}>
                        {icon}
                    </span>
                    
                    
                    <Typography style={{marginLeft: 5}}>
                        {label}
                    </Typography>
                </span>
            }
        />
    )
}


