import { InputLabel, FormControl, MenuItem, FormControlProps, SelectProps } from '@material-ui/core'
import React from 'react'
import { visibilityTypes } from '../../utils/spaceutils'
import Select from '../Shared/Select'
import ParamsInfoItem from './ParamsInfoItem'

interface SpaceVisibilitySelectProps {
    visibility: 'Public' | 'Private' | 'Restricted',
    handleChange: (visibility: string) => void,
    project?: boolean
}

export default function SpaceVisibilitySelect({visibility, handleChange, project, ...props}: SpaceVisibilitySelectProps & SelectProps) {
    return (
        <Select
            {...props}
            value={visibility}
            onChange={(e) => handleChange(e.target.value as string)}
        >
            {
                visibilityTypes.map((item) => (
                    <MenuItem value={item.title}>
                        <ParamsInfoItem
                            {...item}
                            project={project}
                        />
                    </MenuItem>
                ))
            }
            
        </Select>
    )
}
