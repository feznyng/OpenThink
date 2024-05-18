import React, { ReactElement } from 'react'
import { Collapse, ListItem, ListItemIcon, ListItemText, makeStyles, useTheme } from '@material-ui/core'
import DropDownButton from './DropDownButton'

interface SidenavListItemProps {
    onClick?: (item: any) => void,
    selected?: boolean,
    icon?: ReactElement,
    title: string,
    value?: string,
    children?: ReactElement,
    hasChildren?: boolean,
    style?: React.CSSProperties
}

export default function SidenavListItem({title, icon, selected, value, children, hasChildren, style, onClick}: SidenavListItemProps) {
    const [state, setState] = React.useState({
        open: false,
    })

    const onItemClick = () => {
        onClick && onClick(value)
        
    }

    return (
        <div style={style}>
            <ListItem
                style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 0, paddingTop: 0, borderRadius: 5, position: 'relative'}}
                button={!!onClick as true}
                onClick={onItemClick}
                selected={selected}
            >
                <span style={{marginRight: 5}}>
                    {icon}
                </span>
                <ListItemText
                    primary={title}
                />
                <div style={{position: 'absolute', right: 0, top: 0}}>
                    {
                        !!hasChildren && 
                        <DropDownButton
                            style={{color: 'grey'}}
                            open={state.open}
                            onClick={() => setState({
                                ...state,
                                open: !state.open
                            })}
                        />
                    }
                </div>
            </ListItem>
            <div style={{marginLeft: 20}}>
                {
                    state.open && 
                    children
                }
            </div>
            
        </div>
       
    )
}
