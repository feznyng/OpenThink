import { Chip } from '@material-ui/core'
import React, { ReactElement } from 'react'
interface ChipList {
    options: {
        title: string,
        icon?: ReactElement,
        color?: "default" | "primary" | "secondary",
        link?: string,
        action?: boolean,
        default?: boolean
    }[],
    onClick?: (title?: string, action?: boolean) => void,
    style?: React.CSSProperties,
    chipStyle?: React.CSSProperties,
    selected?: string
}
export default function ChipList({options, onClick, style, chipStyle, selected}: ChipList) {
    return (
        <div style={style}>
            {
                options.map(({title, icon, link, action}) => {
                    return (
                    <Chip
                        label={title}
                        onClick={onClick ? () => onClick(link, action) : undefined}
                        color={((selected === link) || (!link && !selected && !action)) ? 'primary' : 'default'}
                        variant={((selected === link) || (!link && !selected && !action)) ? 'default' : 'outlined'}
                        icon={icon}
                        style={{...chipStyle, marginRight: 5, marginBottom: 5}}
                    />
                )})
            }
        </div>
    )
}
