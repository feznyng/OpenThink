import { Menu, Checkbox, ListItem, Typography, MenuItem, Card, CardActionArea, IconButton, useTheme } from '@material-ui/core';
import React, { MouseEvent, useMemo } from 'react'
import { RowProps } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Attribute, EntryViewProps } from '../../types/database';
import { attribute, post } from '../../types/post'
import AttributeValueView from '../Attributes/AttributeValueView';
import BlockActions from '../Shared/BlockActions';
import { shallowEqual } from 'react-redux'
import { Anchor } from '../Post/PostContentEditor';
import { ListItemButton } from '@mui/material';
import { completeColor } from '../../constants';
import { MoreVert } from '@material-ui/icons';
import SubEntryButton from './SubEntryButton';
import ListEntry from './ListItem';

const hiddenAttrTypes = ["Title", "Checkbox", "Tags"]

interface BoardEntryState {
    hover: boolean,
    optionAnchor: Anchor,
    editingAttribute: number | null,
    editingAnchor: Anchor,
    open: boolean
}

export default function BoardEntry(props: EntryViewProps) {
    const {style, entryId, groupId, makeSelectEntry, showSubEntries, deleteEntry, fetchSubEntries, openEntry, changeAttributeValue, completable, attributes, showButton} = props
    const selectEntry = useMemo(makeSelectEntry, [])
    const entry = useSelector(state => selectEntry(state, entryId), shallowEqual)
    const {
        attributeValues,
        numSubEntries,
        subEntries,
        selected
    } = entry

    const [state, setState] = React.useState<BoardEntryState>({
        hover: false,
        optionAnchor: null,
        editingAttribute: null,
        editingAnchor: null,
        open: false,
    })

    const completedAttr = attributeValues['Completed']
    const completed = completedAttr?.value

    const closeOptions = () => {
        setState({
            ...state,
            optionAnchor: null
        })
        console.log('here 2')
    }
    
    const menuAction = (e: any, action: string) => {
        e.stopPropagation()
        e.preventDefault()
        switch (action) {
            case 'delete':
                deleteEntry(entry, groupId)
                break
        }
        console.log('here 1')
        closeOptions()
    }

    const editAttribute = (e: MouseEvent, i: number) => {
        e.stopPropagation()
        if (state.editingAttribute !== i) {
            setState({...state, editingAttribute: i, editingAnchor: e.currentTarget})
        }
    }

    const openSubEntries = (e: MouseEvent) => {
        e.stopPropagation()
        if (!state.open) {
            fetchSubEntries && fetchSubEntries(entry)
        }
        setState({...state, open: !state.open})
    }

    return (
        <Card style={{position: 'relative', ...style}}
            onMouseEnter={() => setState({...state, hover: true})}
            onMouseLeave={() => setState({...state, hover: false})}
        >
            <MenuItem
                style={{padding: 15, display: 'block'}}
                onClick={() => openEntry(entry, groupId)} 
            >
                
                <div 
                    
                    style={{position: 'relative', paddingRight: 5, display: 'flex', alignItems: 'center'}}
                >
                    {
                        completable && 
                        <span style={{marginRight: 5}}>
                            <Checkbox 
                                style={{padding: 0, color: !!completed ? completeColor : undefined}}
                                checked={!!completed}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    changeAttributeValue(entry.id, 'Completed', !completed, props.groupId)
                                }}
                            />
                        </span>
                    }
                    <div style={{width: "100%", whiteSpace: 'pre-line'}}>
                        <AttributeValueView
                            attributeValue={attributeValues['Title']}
                            attribute={attributes.find(a => a.name === 'Title')!!}
                            onClose={() => {
                                setState({...state, editingAnchor: null, editingAttribute: null})
                            }}
                        />
                    </div>
                    <IconButton
                        onClick={e => {
                            e.stopPropagation()
                            setState({...state, optionAnchor: e.currentTarget})
                        }}
                        size="small"
                        style={{width: 30, marginRight: -10, marginTop: -4, visibility: state.hover ? 'visible' : 'hidden'}}
                    >
                        <MoreVert/>
                    </IconButton>
                    <Menu open={!!state.optionAnchor} anchorEl={state.optionAnchor} onClick={e => e.stopPropagation()} onClose={closeOptions}>
                    <MenuItem onClick={(e) => menuAction(e, 'delete')}>
                        Delete
                    </MenuItem>
                </Menu>
                </div>
                <div style={{width: '100%', marginTop: 15}}>
                    <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                        {
                            attributes?.filter((a: attribute) => !a.hidden && !hiddenAttrTypes.includes(a.type)).map((a, i) => {
                                const attributeValue = attributeValues[a.name]
                                return (
                                    <span 
                                        style={{
                                            marginRight: (attributeValue.value && attributeValue.value.length > 0 || showButton) ? 10 : 0, 
                                            cursor: showButton ? 'pointer' : undefined,
                                            minHeight: 30,
                                            display: 'flex',
                                            alignItems: 'end'
                                        }} 
                                        onClick={(e) => editAttribute(e, i)}
                                    >
                                        <AttributeValueView
                                            attribute={a}
                                            attributeValue={attributeValue}
                                            showButton={state.hover && showButton}
                                            editing={state.editingAttribute === i}
                                            editingAnchor={state.editingAnchor}
                                            changeAttributeValue={(value) => changeAttributeValue(entry.id, a.name, value, props.groupId)}
                                            simple
                                            onClose={() => {
                                                setState({...state, editingAnchor: null, editingAttribute: null})
                                            }}
                                        />
                                    </span>
                                )
                            })
                        }
                        <div
                            style={{position: 'absolute', right: 10, bottom: 13}}
                        >
                            <SubEntryButton
                                numSubEntries={entry.numSubEntries}
                                numSubEntriesCompleted={entry.numSubEntriesCompleted}
                                style={{visibility: (!!(showSubEntries && numSubEntries && numSubEntries > 0)) ? 'visible' : 'hidden'}}
                                openSubEntries={openSubEntries}
                            />
                        </div>
                    </div>
                </div>
            </MenuItem>
            {
                state.open && subEntries &&
                <div style={{marginLeft: 30}}>
                    {
                        subEntries.map((id) => (
                            <ListEntry
                                {...props}
                                entryId={id}
                                groupId={entryId}
                                hideHoverActions
                                showSubEntries={false}
                                hideAttributes
                            />
                        ))
                    }
                </div>
            }
        </Card>
    )
}
