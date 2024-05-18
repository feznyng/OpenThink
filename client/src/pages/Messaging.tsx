import React, { Component, Suspense } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Paper, useTheme} from '@material-ui/core';
import SpaceColumn from '../components/Message/SpaceColumn';
import MessageWindow from '../components/Message/MessageWindow';
import { RootState } from '../Store';
import ServerBrowser from '../components/Message/ServerBrowser';
import graphql from 'babel-plugin-relay/macro';
import {useQueryLoader, usePreloadedQuery} from 'react-relay';
import type {MessagingQuery as MessagingQueryType} from './__generated__/MessagingQuery.graphql';
import { useHistory, useParams } from 'react-router';
import SpaceColumnQuery from '../components/Message/__generated__/SpaceColumnQuery.graphql';
import MessageWindowQuery from '../components/Message/__generated__/MessageWindowQuery.graphql';
import UserColumnQuery from '../components/Message/__generated__/UserColumnQuery.graphql';
import ChannelListLoader from '../components/Message/ChannelListLoader';
import { setCurrentRoomId } from '../actions/messageActions';
import UserColumn from '../components/Message/UserColumn';
import Connections from '../components/Message/Connections';
import DMCreator from '../components/Message/DMCreator';
import SuspenseLoader from '../components/Shared/SuspenseLoader';
import Placeholder from '../components/Message/Placeholder';
import { backgroundColor, paperColor } from '../theme';

export const darkBorderStyle = {borderWidth: 1, borderColor: '#595959'};
export const lightBorderStyle = {borderWidth: 1, borderColor: '#E1E1E1'};

export const darkPalette = {
    channels: paperColor,
    chat: backgroundColor,
}

export const lightPalette = {
    server: '#F8F8FA',
    channels: '#F8F8FA',
    chat: '#FFFFFF',

}

export default function Messaging({queryRef}: any) {

    const data = usePreloadedQuery<MessagingQueryType>(    
        graphql`      
            query MessagingQuery($count: Int, $cursor: String, $dmCount: Int, $dmCursor: String) {   
                me {
                    ...ServerBrowser_spaces
                    ...DMCreator_rooms
                    productivityView
                    userId
                }
            }
        `,
        queryRef
    );
    
    const height = useSelector((state: RootState) => state.uiActions.height);
    const history = useHistory();

    React.useEffect(() => {
        if (!data.me?.userId)
            history.push('/forbidden');
    }, [data.me?.userId])

    const [    
        channelListQueryRef,    
        loadSpaceColumnQuery,  
    ] = useQueryLoader(    
        SpaceColumnQuery,    
    );

    const [    
        messageWindowQueryRef,    
        loadMessageWindowQuery,  
    ] = useQueryLoader(    
        MessageWindowQuery,
    );

    const [    
        directMessagesQueryRef,    
        loadDirectMessagesQuery,  
    ] = useQueryLoader(    
        UserColumnQuery,
    );

    const {spaceID, roomID} = useParams<any>();
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (spaceID) {
            if (spaceID === '@me') {
                loadDirectMessagesQuery({roomCount: 500, dm: true});
            } else{
                loadSpaceColumnQuery({id: parseInt(spaceID), roomCount: 500})
            }
        }
    }, [spaceID])

    React.useEffect(() => {
        if (roomID && roomID !== 'create') {
            dispatch(setCurrentRoomId(roomID))
            loadMessageWindowQuery(
                {
                    id: roomID,
                    spaceId: spaceID !== '@me' ? parseInt(spaceID) : -1, 
                    inSpace: spaceID !== '@me',
                    messageCount: 50, 
                    pinnedMessageCount: 50, 
                    userCount: 100, 
                    dm: spaceID === '@me',
                    reactionCount: 20
                }, 
                {
                    fetchPolicy: 'store-and-network'
                }
            )
        }
    }, [roomID])

    const openRoom = (roomId: number) => {
        history.replace(`/messages/${spaceID}/${roomId}`)
    }
    
    const {me} = data;
    const windowHeight = height - (me?.productivityView ? 0 : 55)
    const theme = useTheme()
    const darkMode = theme.palette.type === 'dark'
    const pallette = darkMode ? darkPalette : lightPalette
    const borderStyle = darkMode ? darkBorderStyle : lightBorderStyle

    return (
        <Paper 
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
                    flexShrink: 0,
                    height: '100%',
                    paddingTop: 10,
                    width: 70,
                    borderRight: 'solid',
                    ...borderStyle,
                    backgroundColor: pallette.channels
                }}
            >
                <Suspense
                    fallback={
                        <div/>
                    }
                >
                    <ServerBrowser
                        user={data.me}
                    />
                </Suspense>
            </div>
            <div 
                style={{
                    borderRight: 'solid',
                    ...borderStyle, 
                    width: 250, 
                    flexShrink: 0,
                    backgroundColor: pallette.channels
                }}
            >
                {
                    spaceID == '@me' ? 
                    <React.Fragment>
                        <Suspense fallback={<ChannelListLoader/>}>
                        {
                            directMessagesQueryRef && 
                            <UserColumn
                                queryRef={directMessagesQueryRef}
                            />
                        }
                        </Suspense>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Suspense fallback={<ChannelListLoader/>}>
                        {
                            channelListQueryRef && 
                            <SpaceColumn
                                queryRef={channelListQueryRef}
                                openRoom={openRoom}
                                roomID={roomID}
                                spaceID={spaceID}
                            />
                        }
                         </Suspense>
                    </React.Fragment>
                }
            </div>
            {
                roomID != 'connections' &&
                <div style={{width: '100%', backgroundColor: pallette.chat}}>
                    {
                        roomID == 'create' ? 
                        <React.Fragment>
                            <Suspense fallback={<ChannelListLoader/>}>
                            {
                                (data.me as any).__fragments.DMCreator_rooms &&
                                <DMCreator
                                    me={data.me}
                                />
                            }
                            </Suspense>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            {
                                roomID ?
                                <SuspenseLoader queryRef={messageWindowQueryRef} fallback={<ChannelListLoader/>}>
                                    <MessageWindow
                                        directMessage={spaceID === '@me'}
                                        queryRef={messageWindowQueryRef}
                                        roomID={roomID}
                                        spaceID={spaceID}
                                        windowHeight={windowHeight}
                                    />
                                </SuspenseLoader>
                                :
                                <Placeholder/>
                            } 
                        </React.Fragment>
                    }
                </div>
            }
            {
                roomID === 'connections' && spaceID === '@me' &&
                <div style={{width: '100%'}}>
                    <Connections/>
                </div>
            }
        </Paper>
    )
}