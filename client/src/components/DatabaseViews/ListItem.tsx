import { Menu, Checkbox, Typography, MenuItem, IconButton } from '@material-ui/core';
import React, { MouseEvent, MouseEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { RowProps } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../../Store';
import { Attribute, EntryViewProps } from '../../types/database';
import { attribute, post } from '../../types/post'
import AttributeValueView from '../Attributes/AttributeValueView';
import BlockActions from '../Shared/BlockActions';
import { shallowEqual } from 'react-redux'
import { Anchor } from '../Post/PostContentEditor';
import { ListItemButton } from '@mui/material';
import { completeColor } from '../../constants';
import DropDownButton from '../Shared/DropDownButton';
import { Share } from '@material-ui/icons';
import SubEntryButton from './SubEntryButton';
const hiddenAttrTypes = ["Title", "Checkbox", "Tags"]

interface ListEntryState {
    hover: boolean,
    optionAnchor: Anchor,
    editingAttribute: number | null,
    editingAnchor: Anchor,
    open: boolean
}

export default function ListEntry(props: EntryViewProps) {
    const {style, entryId, groupId, showSubEntries, fetchSubEntries, hideAttributes, makeSelectEntry, hideHoverActions, deleteEntry, openEntry, changeAttributeValue, completable, attributes, showButton} = props;
    const selectEntry = useMemo(makeSelectEntry, [])

    const entry = useAppSelector(state => selectEntry(state, entryId), shallowEqual)

    const {
        attributeValues,
        numSubEntries,
        subEntries,
    } = entry

    const itemRef = useRef<HTMLDivElement>(null);


    const [state, setState] = React.useState<ListEntryState>({
        hover: false,
        optionAnchor: null,
        editingAttribute: null,
        editingAnchor: null,
        open: false
    })

    const completedAttr = attributeValues['Completed']
    const completed = completedAttr?.value

    const closeOptions = () => {
        setState({
            ...state,
            optionAnchor: null
        })
    }
    
    const menuAction = (action: string) => {
        switch (action) {
            case 'delete':
                deleteEntry(entry, groupId)
                break
        }
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

    const dispatch = useAppDispatch()
    useEffect(() => {
        if (itemRef.current) {
            const element = itemRef.current;
            const { left, top, width, height } = element.getBoundingClientRect();
        }
    }, [itemRef.current?.getBoundingClientRect()])

    return (
        <div
            onDragEnter={() => console.log('dragging over', entryId)}
            onDrop={() => console.log('dropped on', entryId)}
            ref={itemRef}
        >
            <div style={{position: 'relative'}}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
            >
                {
                    !hideHoverActions && 
                    <BlockActions
                        displayActions={state.hover}
                        onAdd={() => console.log('add row below')}
                        onOptions={(e) => setState({...state, optionAnchor: e.currentTarget as Element})}
                    />
                }
                
                <Menu open={!!state.optionAnchor} anchorEl={state.optionAnchor} onClose={closeOptions}>
                    <MenuItem onClick={() => menuAction('delete')}>
                        Delete
                    </MenuItem>
                </Menu>
                <ListItemButton 
                    disableRipple
                    onClick={() => openEntry(entry, groupId)} 
                    style={{...style, position: 'relative', paddingLeft: 5}}
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
                    <span onClick={(e) => editAttribute(e, -1)}>
                        <AttributeValueView
                            attributeValue={attributeValues['Title']}
                            attribute={attributes.find(a => a.name === 'Title')!!}
                            editing={state.editingAttribute === -1}
                            editingAnchor={state.editingAnchor}
                            changeAttributeValue={(value) => changeAttributeValue(entry.id, "Title", value, props.groupId)}
                            onClose={() => {
                                setState({...state, editingAnchor: null, editingAttribute: null})
                            }}
                        />
                    </span>
                    {
                        showSubEntries && 
                        <SubEntryButton
                            openSubEntries={openSubEntries}
                            numSubEntriesCompleted={entry.numSubEntriesCompleted}
                            numSubEntries={numSubEntries ? numSubEntries : 0}
                            style={{visibility: (!!(showSubEntries && numSubEntries && numSubEntries > 0)) ? 'visible' : 'hidden'}}
                        />
                    }
                    <div style={{display: 'flex', position: 'absolute', right: 0, top: 0, height: '100%', alignItems: 'center', paddingRight: 3 }}>
                        {
                            !hideAttributes && attributes?.filter((a: attribute) => !a.hidden && !hiddenAttrTypes.includes(a.type)).map((a, i) => {
                                const attributeValue = attributeValues[a.name]
                                return (
                                    <span 
                                        style={{
                                            marginRight: (attributeValue.value && attributeValue.value.length > 0 || showButton) ? 10 : 0, 
                                            cursor: showButton ? 'pointer' : undefined,
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
                        {
                            attributes?.filter((a: attribute) => (!a.hidden && a.type === 'Checkbox' && (!completable || a.name !== 'Completed'))).map((a: Attribute) => (
                                <AttributeValueView
                                    attribute={a}
                                    attributeValue={attributeValues[a.name]}
                                    simple
                                />
                            ))
                        }
                    </div>
                </ListItemButton>
                
            </div>
            {
                state.open && subEntries &&
                <div style={{marginLeft: 30}}>
                    {
                        subEntries.map((entryId) => (
                            <ListEntry
                                {...props}
                                entryId={entryId}
                                hideHoverActions
                                showSubEntries={false}
                            />
                        ))
                    }
                </div>
            }
        </div>
    )
}
