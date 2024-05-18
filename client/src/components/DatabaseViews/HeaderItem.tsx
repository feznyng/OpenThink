import { Divider, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Select, TextField, Typography } from '@material-ui/core'
import { ArrowDownward, ArrowLeft, ArrowRight, ArrowUpward, Delete, FileCopy, Filter, VisibilityOff } from '@material-ui/icons'
import React, { ReactElement } from 'react'
import { attribute } from '../../types/post'
import AttributeLabel from '../Post/Attributes/AttributeLabel'
import AttributeTypeSelect from '../Post/Attributes/AttributeTypeSelect'
import Measure from 'react-measure'

const editOptions = [
    {
        icon: <Filter/>,
        name: 'Filter'
    },
    {
        icon: <ArrowUpward/>,
        name: 'Sort Descending'
    },
    {
        icon: <ArrowDownward/>,
        name: 'Sort Ascending'
    },
    {
        icon: <ArrowLeft/>,
        name: 'Insert Left'
    },
    {
        icon: <ArrowRight/>,
        name: 'Insert Right'
    },
    {
        icon: <FileCopy/>,
        name: 'Duplicate'
    },
    {
        icon: <VisibilityOff/>,
        name: 'Hide'
    },
    {
        icon: <Delete/>,
        name: 'Delete'
    },
]



export default function HeaderItem({attribute, onWidthChange}: {attribute: attribute, onWidthChange: (width: number) => void}) {
    const [state, setState] = React.useState<{
        anchorEl: any,
    }>({
        anchorEl: null,
    })

    return (
        <Measure
            bounds
            onResize={contentRect => contentRect.bounds && onWidthChange && onWidthChange(contentRect.bounds.width)}
        >
            {
                ({measureRef}) =>
                <div ref={measureRef} >
                    <MenuItem button style={{padding: 5}} onClick={(e) => { setState({...state, anchorEl: e.currentTarget})}}>
                        <AttributeLabel
                            attribute={attribute}
                        />
                    </MenuItem>

                    <Menu
                        open={!!state.anchorEl}
                        anchorEl={state.anchorEl}
                        onClose={() => { setState({...state, anchorEl: null})}}
                    >
                        <div style={{margin: 10}}>
                            <TextField
                                variant="outlined"
                                defaultValue={attribute.name}
                                size="small"
                                label={'Attribute Name'}
                                style={{marginBottom: 20}}
                            />
                            <AttributeTypeSelect
                                onChange={(e) => console.log('new type', e)}
                                type={attribute.type}
                            />
                        </div>
                        

                        <Divider
                            style={{marginTop: 10, marginBottom: 10}}
                        />
                        {
                            editOptions.map(({icon, name}) => (
                                <MenuItem>
                                    <ListItemIcon>
                                        {icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={name}
                                    />
                                </MenuItem>
                            ))
                        }
                    </Menu>
                </div>
            }
        </Measure>
    )
}
