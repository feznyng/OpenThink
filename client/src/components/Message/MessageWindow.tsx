import { useTheme } from '@material-ui/core';
import { Collapse } from '@mui/material';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense } from 'react';
import { useMutation, usePreloadedQuery } from 'react-relay';
import commitReadRoom from '../../mutations/ReadRoom';
import { darkBorderStyle, lightBorderStyle } from '../../pages/Messaging';
import MessageWindowHeader from './MessageWindowHeader';
import MessageWindowPanel from './MessageWindowPanel';
import MessagingPlaceholder from './Placeholder';
import RoomUsersList from './RoomUsersList';
import type { MessageWindowQuery } from './__generated__/MessageWindowQuery.graphql';

interface MessageWindowProps {
    queryRef: any,
    directMessage: boolean,
    roomID: string,
    spaceID: string,
    windowHeight: number,
}

export default function MessageWindow({queryRef, directMessage, roomID, spaceID, windowHeight}: MessageWindowProps) {
    const { room, me } = usePreloadedQuery<MessageWindowQuery>(    
        graphql`      
            query MessageWindowQuery($id: ID!, $reactionCount: Int!, $reactionCursor: String, $pinnedMessageCount: Int, $pinnedMessageCursor: String, $messageCount: Int, $messageCursor: String, $userCount: Int, $userCursor: String, $dm: Boolean!) {   
                room(roomId: $id) {
                    spaceId
                    __typename
                    ...MessageWindowPanel_messages
                    ...RoomUsersList_active_users @skip(if: $dm)
                    ...RoomUsersList_inactive_users @skip(if: $dm)
                    ...RoomUsersList_users @include(if: $dm)
                    ...MessageWindowHeader_pinned_messages
                    roomId
                }
                me {
                    ...MessageWindowPanelFragment_user
                }
            }
        `,    
        queryRef
    );

    const [state, setState] = React.useState({
        usersOpen: true,
    });

    const [commitSetLastRoomId] = useMutation(
        graphql`
            mutation MessageWindowRoomMutation($input: SetLastRoomIdInput!) {
                setLastRoomId(input: $input) {
                    spaceUser {
                        id
                        lastRoomId
                    }
                }
            }
        `
    );

    React.useEffect(() => {
        if (room) {
            onRoomSwitch()
        }
        
    }, [room?.roomId])

    const onRoomSwitch = () => {
        commitSetLastRoomId({
            variables: {
                input: {
                    roomId: room!!.roomId,
                    spaceId: room!!.spaceId,
                },
            }
        })
        commitReadRoom({
            variables: {
                input: {
                    roomId: room!!.roomId,
                    spaceId: room!!.spaceId
                },
            }
        });
    }

    const topBarHeight = 50;
    const theme = useTheme()
    const borderStyle = theme.palette.type === 'dark' ? darkBorderStyle : lightBorderStyle

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div style={{paddingLeft: 10, paddingRight: 10, borderBottom: roomID ? "solid" : '', ...borderStyle, width: '100%', height: topBarHeight}}>
                {
                    roomID && 
                    <MessageWindowHeader
                        creatingRoom={false}
                        newRoom={{}}
                        room={room}
                        toggleUsers={() => setState({...state, usersOpen: !state.usersOpen})}
                    />
                }
            </div>
            <div style={{display: 'flex', height: windowHeight - topBarHeight, width: '100%'}}>
                <div style={{position: 'relative', height: '100%', width: '100%'}}>
                    {
                        room && roomID ?
                        <MessageWindowPanel
                            room={room}
                            user={me}
                            focusedElsewhere={false}
                        />
                        :
                        <MessagingPlaceholder/>
                    }
                    
                </div>
                <div style={{height: '100%', borderLeft: 'solid', ...borderStyle}}>
                    <Suspense fallback={<div style={{width: 260}}/>}>
                        <Collapse 
                            orientation='horizontal'
                            mountOnEnter
                            in={!!(room && state.usersOpen && ((directMessage && !!(room as any).__fragments.RoomUsersList_users) || (!directMessage && !!(room as any).__fragments.RoomUsersList_active_users)))}
                        >
                            <RoomUsersList
                                directMessage={directMessage}
                                room={room}
                                roomID={roomID}
                                spaceID={spaceID}
                            />
                        </Collapse>
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
