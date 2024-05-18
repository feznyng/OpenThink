import React from 'react'
import { usePaginationFragment, ConnectionHandler } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { room } from '../../types/message';
import { useContextMenu, TriggerEvent,  } from 'react-contexify';
import { spaceChannelsSubscribe } from '../../subscriptions/SpaceChannelsSubscription';
import ReorderableRoomsList from './ReorderableRoomsList';
import commitReorderChannels from '../../mutations/ReorderChannels';
import ChannelListOptionsMenu, { MENU_ID } from './ChannelListOptionsMenu';

let subscribed: any = null;

interface ChannelListProps {
    space: any,
    spaceID: string,
    roomID: string,
    openRoom: (roomId: number) => void,
}

interface ChannelListState {
    deleteOpen: boolean,
    channelSettings: boolean,
    mutePopover: boolean, 
    notificationPopover: boolean,
    roomContext: room | null,
    open?: boolean
}

export default function ChannelList({space, spaceID, roomID, openRoom}: ChannelListProps) {
    const [state, setState] = React.useState<ChannelListState>({
        deleteOpen: false,
        channelSettings: false,
        mutePopover: false, 
        notificationPopover: false,
        roomContext: null,
        open: false
    })

    const {data} = usePaginationFragment(    
        graphql`      
            fragment ChannelList_rooms on Space      
            @refetchable(queryName: "ChannelListPaginationQuery") {  
                __id   
                id
                spaceId
                currUser {
                    spaceUserId
                    type
                }
                rooms(first: $roomCount, after: $roomCursor) @connection(key: "ChannelList_rooms") {
                    __id
                    edges {
                        node {
                            ...ChannelListItem
                            ...RoomSettings_fragment
                            roomId
                            spaceId
                            name
                            id
                            currUser {
                                id
                                roomUserId
                                unread
                                unreadNum
                            }
                        }
                    }
                }
            }  
        `,
        space
    );
    const rooms: any[] = (data && data.rooms) ? data.rooms.edges!!.map((e: any) => e!!.node) : []


    const space_graphql_id = data?.id;

    React.useEffect(() => {
        if (subscribed) {
            subscribed.dispose();
        }
        subscribed = spaceChannelsSubscribe(space_graphql_id, {spaceId: parseInt(data.spaceId)})

        return () => {
            if (subscribed) {
                subscribed.dispose();
            }
        }
    }, [])

    React.useEffect(() => {
        if (!roomID && rooms.length > 0 && rooms[0].spaceId?.toString() === spaceID) {
            if (space?.currUser?.lastRoomId && rooms.find(r => r.roomId === space?.currUser?.lastRoomId)) {
                openRoom(space?.currUser?.lastRoomId)
            } else {
                openRoom(rooms[0].roomId)
            }
        }
    }, [spaceID, rooms])
    
    const onClick = (r: room) => {
        openRoom(r.roomId!!)
    }

    const { show } = useContextMenu({
        id: MENU_ID,
    });

    function handleContextMenu(event: TriggerEvent, room: room | null) {
        event.preventDefault()
        event.stopPropagation()
        show(event, {
          props: {
              key: 'value'
          }
        })
        setState({
            ...state,
            roomContext: room
        })
    }

    const onReorder = (roomId: number, oldIndex: number, newIndex: number) => {
        commitReorderChannels({
            variables: {
                input: {
                    roomId,
                    oldIndex,
                    newIndex,
                    spaceId: parseInt(data.spaceId)
                },
            },
            optimisticUpdater: (store: any) => updater(store, roomId, oldIndex, newIndex),
            updater: (store: any) => updater(store, roomId, oldIndex, newIndex),
        })
    }

    const updater = (store: any, roomId: number, oldIndex: number, newIndex: number) => {
        const spaceRecord = store.get(space_graphql_id);
        if (spaceRecord) {
            const connectionRecord = ConnectionHandler.getConnection(    
                spaceRecord,    
                'ChannelList_rooms',  
            );

            if (connectionRecord) {
                const rooms = connectionRecord.getLinkedRecords('edges')
                if (rooms) {
                    let nodeId = null;
                    const roomEdge = rooms?.find((s, i) => {
                        const node = s.getLinkedRecord('node');
                        nodeId = node?.getDataID();
                        return roomId.toString() === node?.getValue("roomId")?.toString()
                    })

                    const nextEdge = rooms[newIndex]

                    if (roomEdge && nextEdge && nodeId) {
                        const nextEdgeCursor = nextEdge.getValue('cursor') as string;
                        ConnectionHandler.deleteNode(connectionRecord, nodeId)
                        if (oldIndex < newIndex) {
                            ConnectionHandler.insertEdgeAfter(connectionRecord, roomEdge, nextEdgeCursor);
                        } else {
                            ConnectionHandler.insertEdgeBefore(connectionRecord, roomEdge, nextEdgeCursor);
                        }
                        
                    }
                }
            }
        }
    } 

    return (
        <div style={{height: '100%'}} onContextMenu={(e) => handleContextMenu(e, null)}>
            <ReorderableRoomsList
                rooms={rooms}
                onReorder={onReorder}
                onClick={onClick}
                roomID={roomID}
                onContextMenu={(e, r) => handleContextMenu(e, r)}
            />
            <ChannelListOptionsMenu
                room={state.roomContext}
                spaceId={data.spaceId}
                index={rooms.length}
                connectionId={data?.rooms?.__id}
            />
        </div>
    )
}
