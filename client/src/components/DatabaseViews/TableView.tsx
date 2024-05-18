import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { DatabaseViewProps, Entry } from '../../types/database'
import DefaultAddEntry from './AddEntry'
import AddGroup from './AddGroup'
import Group from './Group'
import ListItem from './ListItem'

interface TableViewProps extends DatabaseViewProps {
    hideCellLines?: boolean
}

export default function TableView({groupIds, entryIds, attributes, AddEntry, defaultGroup, AddListItem, onDragEnd, requireEntry, addGroupButton, canAddGroup, deleteEntry, addEntryText, entryViewProps, canAddEntry, addEntry, expandedGroups, groupViewProps, ...props}: TableViewProps) {
    return (
        <div>
            TableView
        </div>
    )
}
