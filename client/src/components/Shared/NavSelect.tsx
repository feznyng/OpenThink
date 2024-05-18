import { MenuItem } from '@material-ui/core'
import React, { ReactElement } from 'react'
import Select from './Select'

export interface NavItem {
    title: string,
    value: string,
    default?: boolean,
    icon?: ReactElement
}

interface NavSelectProps {
    navItems: NavItem[],
    value?: string | null,
    onChange: (value: string) => void,
    style?: React.CSSProperties,
}

export default function NavSelect({navItems, value, onChange, style}: NavSelectProps) {
    const defaultValue = navItems.find(e => e.default)?.value

    const handleChange = (e: any) => {
        if (defaultValue === e.target.value) {
            onChange('')
        } else {
            onChange(e.target.value)
        }
    }

    return (
        <div
            style={{...style}}
        >
            <Select
                value={value}
                onChange={handleChange}
                style={{...style}}
            >
                {
                    navItems.map(({title, icon, value}) => (
                        <MenuItem value={value}>
                            <span style={{marginRight: 10}}>{icon}</span>
                            {title}
                        </MenuItem>
                    ))
                }
                
            </Select>
        </div>
        
    )
}
