import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import MessageWindowPanel from './MessageWindowPanel';
import { ExistingDMWindowQuery } from './__generated__/ExistingDMWindowQuery.graphql';

interface ExistingDMWindowProps {
    queryRef: any,
    onRoomChange: (roomId: number | null) => void,
}

export default function ExistingDMWindow({queryRef, onRoomChange}: ExistingDMWindowProps) {
    const { roomByUsers, me } = usePreloadedQuery<ExistingDMWindowQuery>(
        graphql`
            query ExistingDMWindowQuery($userIds: [ID!]!, $messageCount: Int, $messageCursor: String, $reactionCount: Int!, $reactionCursor: String) {
                roomByUsers(userIds: $userIds) {
                    roomId
                    name
                    ...MessageWindowPanel_messages
                }
                me {
                    ...MessageWindowPanelFragment_user
                    userId
                }
            }
        `,
        queryRef
    )

    React.useEffect(() => {
        if (roomByUsers) {
            onRoomChange(roomByUsers.roomId)
        } else {
            onRoomChange(null)
        }
        
    }, [roomByUsers])
    // data may be null if no room exists given usersIds
    
    return (
        <div style={{height: '100%'}}>
           {
                roomByUsers &&
                    <MessageWindowPanel
                        room={roomByUsers}
                        hideEditor
                        user={me}
                    />
           }
        </div>
    )
}
