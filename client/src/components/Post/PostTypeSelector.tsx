import { InputLabel, FormControl, MenuItem, FormControlProps, SelectProps, ListItem } from '@material-ui/core'
import { ListItemIcon, ListItemText } from '@mui/material'
import React from 'react'
import { getPostColor, getPostIcon, types } from '../../utils/postutils'
import Select from '../Shared/Select'
import Typography from '../Shared/Typography'

interface PostTypeSelectorProps {
    type: string,
    onChange: (type: string) => void,
    style?: React.CSSProperties
}

export default function PostTypeSelector({type, onChange, ...props}: PostTypeSelectorProps & SelectProps) {
    const ActiveIcon: any = getPostIcon(type)
    return (
        <Select
            {...props}
            value={type}
            style={{height: 45, ...props.style}}
            onChange={(e) => onChange(e.target.value as string)}
            renderValue={() => (
                <span style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: 10}}>
                        {ActiveIcon && <ActiveIcon style={{color: getPostColor(type)}}/>}
                    </span>
                    <Typography>
                        {type}
                    </Typography>
                </span>
            )}
        >
            {
                types.map(({type, tip, icon}) => {

                    return (
                        <MenuItem value={type}>
                            <ListItemIcon>
                                {icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={type}
                                secondary={tip}
                            />
                        </MenuItem>
                    )
                })
            }
            
        </Select>
    )
}
