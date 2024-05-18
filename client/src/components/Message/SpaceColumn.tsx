import React, {useState, useRef} from 'react'
import { Dialog, useTheme } from '@material-ui/core';
import ServerOptions from './ServerOptions';
import 'react-contexify/dist/ReactContexify.css';
import RoomSettings from '../RoomSettings/RoomSettings';
import graphql from 'babel-plugin-relay/macro';
import { usePreloadedQuery } from 'react-relay';
import type { SpaceColumnQuery } from './__generated__/SpaceColumnQuery.graphql';
import { room } from '../../types/message';
import ChannelList from './ChannelList';
import { darkBorderStyle, lightBorderStyle } from '../../pages/Messaging';

interface SpaceColumnProps {
    queryRef: any,
    openRoom: (roomId: number) => void,
    hideOptions?: boolean,
    spaceID: string,
    roomID: string
}

export default function SpaceColumn({queryRef, hideOptions, openRoom, spaceID, roomID}: SpaceColumnProps) {
    const {space} = usePreloadedQuery<SpaceColumnQuery>(    
        graphql`      
            query SpaceColumnQuery($id: Int!, $roomCount: Int, $roomCursor: String) {   
                space(spaceId: $id) {
                    ...ServerOptions_space
                    ...ChannelList_rooms
                    numRooms
                    currUser {
                        lastRoomId
                    }
                }
            }
        `,    
        queryRef
    );

    const [state, setState] = useState<{
        roomContext: room | null,
        channelSettings: boolean,
    }>({
        roomContext: null,
        channelSettings: false,
    })

    const theme = useTheme()
    const borderStyle = theme.palette.type === 'dark' ? darkBorderStyle : lightBorderStyle

    return (
        <div style={{height: '100%'}}>   
            {
                !hideOptions && space && 
                <div style={{borderBottom: 'solid', ...borderStyle, marginBottom: 10, height: 50,}}>
                    <ServerOptions
                        space={space}
                    />
                </div>
            }
            <div style={{height: '85%'}}>
                {
                    space && 
                    <ChannelList
                        space={space}
                        spaceID={spaceID}
                        roomID={roomID}
                        openRoom={openRoom}
                    />
                }
            </div>
            <Dialog
                open={state.channelSettings}
                fullScreen
                onClose={() => setState({...state, channelSettings: false})}
            >
                <RoomSettings
                    room={state.roomContext!!}
                />
            </Dialog>
        </div>
    )
}
