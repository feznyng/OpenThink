import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { DatabaseViewProps, Entry } from '../../types/database'
import DefaultAddEntry from './AddEntry'
import AddGroup from './AddGroup'
import Group from './Group'
import ListItem from './ListItem'



export default React.forwardRef(function ListView({groupIds, entryIds, groupIdOverride, attributes, AddEntry, defaultGroup, AddListItem, onDragEnd, requireEntry, addGroupButton, canAddGroup, deleteEntry, addEntryText, entryViewProps, canAddEntry, addEntry, expandedGroups, groupViewProps, ...props}: DatabaseViewProps, ref) {
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
        <div {...props} style={{...props.style, width: '100%'}}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable" type="droppableItem" direction="vertical">
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
                                                        <ListItem
                                                            attributes={attributes}
                                                            {...entryViewProps}
                                                            entryId={entryId}
                                                            groupId={groupIdOverride}
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
                                    {provided.placeholder}
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
                                <div>
                                    {
                                        groupViewProps?.makeSelectGroup && groupIds.map((groupId, index) => (
                                            <Draggable
                                                key={"groupId:" + groupId} 
                                                draggableId={"groupId:" + groupId}
                                                index={defaultGroup ? index + 1 : index} 
                                                isDragDisabled={parseInt(groupId) < 0}
                                            >
                                                {
                                                    (provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                    >
                                                        <Group
                                                            {...groupViewProps}
                                                            entryViewProps={{
                                                                ...entryViewProps,
                                                                deleteEntry,
                                                                addEntry,
                                                                attributes
                                                            }}
                                                            canCollapse
                                                            dragHandleProps={provided.dragHandleProps}
                                                            AddListItem={AddListItem}
                                                            canAddEntry={!!canAddEntry}
                                                            EntryItem={ListItem}
                                                            groupId={groupId} 
                                                            addEntry={addEntry}
                                                            expanded={!expandedGroups || expandedGroups.includes(groupId)}
                                                            style={{marginBottom: 15}}
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