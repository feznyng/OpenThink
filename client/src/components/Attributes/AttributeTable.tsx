import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core'
import React, { useState } from 'react'
import { Attribute, AttributeValueMap } from '../../types/database'
import AttributeIcon from './AttributeIcon'
import AttributeValueView from './AttributeValueView'
import { Anchor } from '../Post/PostContentEditor';
import { ListItemButton } from '@mui/material'

interface AttributeTableProps {
    attributes: Attribute[],
    attributeValues: AttributeValueMap,
    changeAttributeValue: (attribute: Attribute, value: any) => void,
    readonly?: boolean
}

interface AttributeTableState {
    editingAnchor: Anchor,
    editingAttribute: null | number
}

export default function AttributeTable({attributes, attributeValues, changeAttributeValue}: AttributeTableProps) {
    const [state, setState] = useState<AttributeTableState>({
        editingAnchor: null,
        editingAttribute: null,
        
    })

    const onClose = () => setState({...state, editingAttribute: null, editingAnchor: null})

    return (
        <div>
            <table style={{maxWidth: '100%', width: '100%'}}>
                {
                    attributes.map((a, i) => (
                        <tr>
                            <td style={{width: 75}}>
                                <ListItemButton style={{paddingTop: 0, paddingBottom: 0, paddingLeft: 0, opacity: 0.7, height: 40}}>
                                    <ListItemIcon>
                                        <AttributeIcon
                                            attribute={a}
                                            style={{fontSize: 20}}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={a.name}
                                        primaryTypographyProps={{
                                            variant: 'subtitle2'
                                        }}
                                        style={{marginLeft: -15}}
                                    />
                                </ListItemButton>
                            </td>
                            <td>
                                <ListItemButton 
                                    style={{paddingTop: 0, paddingBottom: 0, paddingLeft: 10}} 
                                    disableRipple
                                    onClick={(e) => state.editingAttribute !== i && setState({...state, editingAnchor: e.currentTarget, editingAttribute: i})}
                                >
                                    <div style={{minHeight: 40, paddingTop: 5, paddingBottom: 5, display: 'flex', alignItems: 'center'}}>
                                        <AttributeValueView
                                            attribute={a}
                                            attributeValue={attributeValues[a.name]}
                                            showPlaceholder
                                            onClose={onClose}
                                            editing={state.editingAttribute === i}
                                            editingAnchor={state.editingAnchor}
                                            changeAttributeValue={value => changeAttributeValue(a, value)}
                                        />
                                    </div>
                                </ListItemButton>
                            </td>
                        </tr>
                    ))
                }
            </table>
        </div>
    )
}
