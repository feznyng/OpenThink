import React from 'react'
import MuiListItem, {ListItemProps as MuiListItemProps} from '@material-ui/core/ListItem'
import { ListItemIcon, ListItemText, TypographyProps } from '@material-ui/core'

interface ListItemProps extends MuiListItemProps {
    size?: 'medium' | 'large' | 'small',
    icon?: React.ReactElement,
    primary?: string,
    secondary?: string,
    secondaryProps?: TypographyProps
}

export default function ListItem({children, icon, primary, secondary, secondaryProps, size = 'medium', ...props}: ListItemProps) {
    return (
        <MuiListItem
            button={props.button as any}
            {...props}
            style={size === 'small' ? {paddingTop: 0, paddingBottom: 0} : {}}
        >
            {
                icon && 
                <span style={{marginRight: 10}}>
                    {icon}
                </span>
            }
            {
                primary &&
                <ListItemText
                    primaryTypographyProps={{
                        variant: 'subtitle1'
                    }}
                    primary={primary}
                    secondary={secondary}
                    secondaryTypographyProps={secondaryProps}
                />
            }
            {children}
        </MuiListItem>
    )
}
