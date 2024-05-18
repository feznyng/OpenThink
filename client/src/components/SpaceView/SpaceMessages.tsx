import { useTheme } from '@material-ui/core';
import React from 'react';
import { useQueryLoader } from 'react-relay';
import { useParams } from 'react-router';
import { darkBorderStyle, darkPalette, lightBorderStyle, lightPalette } from '../../pages/Messaging';
import ChannelListLoader from '../Message/ChannelListLoader';
import MessageWindow from '../Message/MessageWindow';
import SpaceColumn from '../Message/SpaceColumn';
import MessageWindowQuery from '../Message/__generated__/MessageWindowQuery.graphql';
import SuspenseLoader from '../Shared/SuspenseLoader';
import Typography from '../Shared/Typography';

interface SpaceMessagesProps {
    queryRef: any,
    windowHeight: number,
    roomId: number,
    openRoom: (roomId: number) => void
}

export default function SpaceMessages({queryRef, openRoom, windowHeight}: SpaceMessagesProps) {
    const {spaceID, postID} = useParams<any>();

    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'
    const palette = darkMode ? darkPalette : lightPalette
    const borderStyle = darkMode ? darkBorderStyle : lightBorderStyle
    const [    
        messageWindowQueryRef,    
        loadMessageWindowQuery,  
    ] = useQueryLoader(    
        MessageWindowQuery,
    );

    React.useEffect(() => {
        if (postID) {
            loadMessageWindowQuery(
                {
                    id: postID,
                    spaceId: parseInt(spaceID), 
                    inSpace: true,
                    messageCount: 50, 
                    pinnedMessageCount: 50, 
                    userCount: 100, 
                    dm: false,
                    reactionCount: 20,
                }, 
                {
                    fetchPolicy: 'store-and-network'
                }
            )
        }
    }, [postID])

    return (
        <div
            style={{
                width: '100%',
                height: windowHeight, 
                maxHeight: windowHeight,
                display: 'flex', 
                boxShadow: 'none',
            }}
        >
            <div 
                style={{
                    borderRight: 'solid',
                    ...borderStyle, 
                    width: 250, 
                    flexShrink: 0,
                    backgroundColor: palette.channels
                }}
            >
                <SuspenseLoader queryRef={queryRef} fallback={<ChannelListLoader/>}>
                    <SpaceColumn
                        queryRef={queryRef}
                        openRoom={openRoom}
                        spaceID={spaceID}
                        roomID={postID}
                    />
                </SuspenseLoader>
            </div>
            {
                postID ? 
                <div style={{backgroundColor: palette.chat, width: '100%', height: '100%'}}>
                    <SuspenseLoader queryRef={messageWindowQueryRef} fallback={<ChannelListLoader/>}>
                        <MessageWindow
                            directMessage={spaceID === '@me'}
                            queryRef={messageWindowQueryRef}
                            roomID={postID}
                            spaceID={spaceID}
                            windowHeight={windowHeight}
                        />
                    </SuspenseLoader>
                </div>
                :
                <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10%'}}>
                    <Typography variant='h6'>
                        Create a channel to start communicating!
                    </Typography>
                </div>
            }
            
        </div>
    )
}
