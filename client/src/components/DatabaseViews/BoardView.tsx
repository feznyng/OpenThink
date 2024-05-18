import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { DatabaseViewProps, Entry } from '../../types/database'
import DefaultAddEntry from './AddEntry'
import Group from './Group'
import BoardItem from './BoardItem'

export default React.forwardRef(function BoardView({groupIds, entryIds, attributes, AddEntry, defaultGroup, AddListItem, onDragEnd, requireEntry, addGroupButton, canAddGroup, deleteEntry, addEntryText, entryViewProps, canAddEntry, addEntry, expandedGroups, groupViewProps, fixedHeight, ...props}: DatabaseViewProps & {fixedHeight?: number}, ref) {
    const [state, setState] = React.useState({
        creating: false
    })

    const beginEntry = () => requireEntry ? setState({...state, creating: true}) : addEntry('bottom')
    
    const addEntryProps = {
        onClick: beginEntry,
        addEntry: beginEntry,
        addText: addEntryText
    }

    React.useImperativeHandle(ref, () => ({
        beginEntry
    }));

    return (
        <div {...props} style={{...props.style, width: '100%', height: '100%'}}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable" type="droppableItem" direction="horizontal">
                {
                    (provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                        >
                            {
                                !groupIds && entryIds && 
                                <div>
                                    {
                                        entryIds.map((entryId, index) => (
                                            <Draggable 
                                                key={"entryId:" + entryId} 
                                                draggableId={"entryId:" + entryId}
                                                index={index} 
                                            >
                                                {
                                                    (provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <BoardItem
                                                            attributes={attributes}
                                                            {...entryViewProps}
                                                            entryId={entryId}
                                                            {...{
                                                                deleteEntry,
                                                                addEntry
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                
                                            </Draggable>
                                        ))
                                    }
                                    {
                                        state.creating && AddListItem &&
                                        <AddListItem 
                                            addEntry={(entry: Entry) => addEntry('bottom', null, entry)} 
                                            onClose={() => setState({...state, creating: false})}
                                        />
                                    }
                                    {
                                        canAddEntry && 
                                        <div
                                            style={{marginTop: 15}} 
                                        >
                                            {
                                                AddEntry ? 
                                                <AddEntry
                                                    {...addEntryProps}
                                                />
                                                :
                                                <DefaultAddEntry
                                                    {...addEntryProps}
                                                />
                                            }
                                        </div>
                                    }
                                </div>
                            }
                            {
                                !entryIds && groupIds && 
                                <div style={{display: 'flex'}}>
                                    {
                                        groupViewProps?.makeSelectGroup && groupIds.map((groupId, index) => (
                                            <Draggable
                                                key={"groupId:" + groupId} 
                                                draggableId={"groupId:" + groupId}
                                                isDragDisabled={parseInt(groupId) < 0}
                                                index={defaultGroup ? index + 1 : index} 
                                            >
                                                {
                                                    (provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{...provided.draggableProps.style, marginLeft: 15, marginRight: 15}}
                                                    >
                                                        <Group
                                                            {...groupViewProps}
                                                            entryViewProps={{
                                                                ...entryViewProps,
                                                                deleteEntry,
                                                                addEntry,
                                                                attributes,
                                                                style: {marginBottom: 15}
                                                            }}
                                                            dragHandleProps={provided.dragHandleProps}
                                                            AddListItem={AddListItem}
                                                            canAddEntry={!!canAddEntry}
                                                            EntryItem={BoardItem}
                                                            groupId={groupId} 
                                                            addEntry={addEntry}
                                                            expanded={!expandedGroups || expandedGroups.includes(groupId)}
                                                            style={{marginBottom: 15, width: 300,}}
                                                            addEntryText={addEntryText}
                                                            requireEntry={requireEntry}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    }
                                    {provided.placeholder}
                                    {
                                        canAddGroup && 
                                        addGroupButton
                                    }
                                </div>
                            }
                        </div>
                    )
                }
                </Droppable>
            </DragDropContext>
        </div>
    )
})