import { InputLabel, FormControl, MenuItem, FormControlProps, SelectProps } from '@material-ui/core'
import React from 'react'
import { accessTypes } from '../../utils/spaceutils'
import Select from '../Shared/Select'
import ParamsInfoItem from './ParamsInfoItem'

interface SpaceAccessSelectProps {
    access: 'Public' | 'Private' | 'Restricted',
    handleChange: (access: string) => void,
    project?: boolean
}

export default function SpaceAccessSelect({access, handleChange, project, ...props}: SpaceAccessSelectProps & SelectProps) {
    return (
            <Select
                {...props}
                value={access}
                onChange={(e) => handleChange(e.target.value as string)}
            >
                {
                    accessTypes.map((item) => (
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
