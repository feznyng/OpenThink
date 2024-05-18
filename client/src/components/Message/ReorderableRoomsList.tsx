import React, { Component } from 'react'
import { room } from '../../types/message';
import ChannelListItem from './ChannelListItem';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

interface ReorderableRoomsListProps {
    onReorder?: (roomId: number, oldIndex: number, newIndex: number) => void,
    rooms: room[],
    onClick: (r: room) => void,
    roomID: string,
    onContextMenu: (e: any, r: room) => void,
    disableDrag?: boolean
}

export default function ReorderableRoomsList({onClick, roomID, rooms, onReorder, onContextMenu, disableDrag}: ReorderableRoomsListProps) {

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !onReorder)
            return;
        onReorder(parseInt(result.draggableId), result.source.index, result.destination.index)
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
            {(provided, snapshot) => (
                <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                    {
                        rooms.map((r, index) => (
                            <Draggable key={r.roomId} isDragDisabled={disableDrag} draggableId={r.roomId!!.toString()} index={index}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onContextMenu={(e) => onContextMenu(e, r)}
                                    >
                                        <div style={{paddingLeft: '3%', paddingRight: '3%'}}>
                                            <ChannelListItem
                                                data={r}
                                                onClick={onClick}
                                                selected={r.roomId!!.toString() === roomID}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))
                    }
                </div>
            )}
            </Droppable>

        </DragDropContext>
    )
}
