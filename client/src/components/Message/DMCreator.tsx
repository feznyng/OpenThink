import { IconButton, Paper, Snackbar, Typography, useTheme } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import React, { Suspense } from 'react';
import Measure from 'react-measure';
import { useSelector } from 'react-redux';
import { usePaginationFragment, useQueryLoader } from 'react-relay';
import { useHistory, useLocation } from 'react-router';
import commitCreateChannel from '../../mutations/CreateChannel';
import commitSendMessage from '../../mutations/SendMessage';
import { darkBorderStyle, lightBorderStyle } from '../../pages/Messaging';
import { clientId, RootState } from '../../Store';
import { message } from '../../types/message';
import { user } from '../../types/user';
import { fetchQuery } from '../../utils/graphqlutils';
import { queryString } from '../../utils/urlutils';
import UserSelector from '../Shared/UserSelector';
import ExistingDMWindow from './ExistingDMWindow';
import MessageEditor from './MessageEditor';
import ExistingDMWindowQuery from './__generated__/ExistingDMWindowQuery.graphql';

interface DMCreatorState {
    editorHeight: number,
    loading: boolean,
    users: user[],
    recipientHeight?: number,
    roomId?: number | null,
    open: boolean,
    loadedInitial: boolean,
    userIds?: number[]
}

export const MAX_DM_USERS = 20;


export default function DMCreator({me}: any) {
    const {data, hasNext, hasPrevious, loadNext, loadPrevious, isLoadingNext} = usePaginationFragment(    
        graphql`      
            fragment DMCreator_rooms on User
                @refetchable(queryName: "DMCreatorPaginationQuery") {
                userId
                directMessages(first: $dmCount, after: $dmCursor) @connection(key: "DMCreator_directMessages") {
                    __id
                    edges {
                        cursor
                    }
                }
            }
        `,
        me
    );
    const [state, setState] = React.useState<DMCreatorState>({
        editorHeight: 0,
        loading: false,
        users: [],
        open: false,
        loadedInitial: false,
    })
    const { search } = useLocation();


    const query = queryString.parse(search);
    const userIds = query.userIds ? JSON.parse(query.userIds as string).slice(0, MAX_DM_USERS) : []

    React.useEffect(() => {
        if (userIds !== state.userIds) {
            setState({
                ...state,
                userIds
            })
        }  
        
    }, [])

    React.useEffect(() => {
        if (userIds && userIds.length > 0 && !state.loadedInitial) {
            fetchQuery(
                graphql`
                    query DMCreatorInitialUsersQuery($userIds: [ID!]!) {
                        usersByIds(userIds: $userIds) {
                            firstname
                            lastname
                            userId
                        }
                    }
                `,
                {userIds}
            ).subscribe({
                next: (data: any) => {
                    const {usersByIds} = data;
                    setState({
                        ...state,
                        users: usersByIds,
                        loadedInitial: true,
                    })
                    loadQuery({
                        userIds: usersByIds.map((u: any) => u.userId),
                        messageCount: 50,
                        reactionCount: 20,
                    })
                },
                error: (error: any) => console.log(error)
            })
        }
    }, [state.userIds])
    

    const height = useSelector((state: RootState) => state.uiActions.height);
    const menuHeight = useSelector((state: RootState) => state.uiActions.menuHeight)

    const starterID = data?.directMessages?.__id;
        
    const splits = starterID.split(':')

    const connectionID = `${splits[0]}:${splits[1]}:__DirectMessagesList_directMessages_connection`
        
    const history = useHistory();
    const onSend = (message: message) => {
        if (state.roomId) {
            sendMessage(state.roomId, message);
        } else {
            // 1. create room
            commitCreateChannel({
                variables: {
                    input: {
                        spaceId: null,
                        userIds: state.users.map(u => u.userId?.toString()),
                        clientId,
                        dm: state.users.length == 1
                    },
                    connections: [connectionID]
                },
                onCompleted: ({createRoom}: any) => {
                    const roomId = createRoom.roomEdge.node.roomId
                    // 2. send message
                    sendMessage(roomId, message);
                }
            })
        }
        
    }

    const sendMessage = (roomId: number, message: message) => {
        commitSendMessage({
            variables: {
                input: {
                    roomId,
                    delta: JSON.stringify(message.delta),
                    body: message.body,
                    files: message.files,
                    mentions: message.mentions,
                    clientId,
                },
                reactionCount: 20,
                connections: []
            },
            onCompleted: (value: any) => {
                // 3. trigger callback to navigate to new room
                history.replace(`/messages/@me/${roomId}`)
            },
            
        })
    }

    const [queryRef, loadQuery] = useQueryLoader(    
        ExistingDMWindowQuery,
    );

    const onUsersChange = (users: user[]) => {
        const maxedUsers = users.slice(0, MAX_DM_USERS)

        setState({...state, users: maxedUsers, open: maxedUsers.length !== 0 && maxedUsers.length !== users.length,});

        if (maxedUsers.length > 0) {
            loadQuery({
                userIds: maxedUsers.map(u => u.userId),
                messageCount: 50,
                reactionCount: 20,

            })
        }

    }

    const handleClose = () => {
        setState({...state, open: false,})
    }
    

    const editorOffset = 25;
    const theme = useTheme()
    const borderStyle = theme.palette.type === 'dark' ? darkBorderStyle : lightBorderStyle
    return (
        <div style={{position: 'relative', height: '100%', width: '100%', overflow: 'auto'}}>
            <div style={{height: '100%', position: 'relative'}}>

                <div style={{paddingLeft: 10, paddingRight: 10, borderBottom: "solid", ...borderStyle, width: '100%', height: 50}}>
                    <div style={{height: '100%', display: 'flex', alignItems: 'center'}}>
                        <Typography style={{fontSize: 20, marginLeft: 5}} variant="h6">
                            New Message
                        </Typography>
                    </div>
                </div>
                <Measure
                    bounds
                    onResize={(contentRect: any) => {
                        setState({
                            ...state,
                            recipientHeight: contentRect.bounds.height,
                        })
                    }}
                >
                    {
                        ({ measureRef }) => (
                            <Paper ref={measureRef} style={{zIndex: 1, borderRadius: 0, boxShadow: 'none', paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, borderBottom: "solid", ...borderStyle, width: '100%', position: 'absolute'}}>
                                <div style={{height: '100%', display: 'flex', alignItems: 'center', minHeight: 40}}>
                                    <Typography>
                                        To: 
                                    </Typography>
                                    <UserSelector
                                        onChange={onUsersChange}
                                        value={state.users}
                                        limit={MAX_DM_USERS}
                                        variant={'plain'}
                                        style={{marginLeft: 10}}
                                    />
                                </div>
                            </Paper>
                        )
                    }
                </Measure>

                
                {
                    (state.users.length > 0 && queryRef) &&
                    <div style={{height: height - (menuHeight + 30 + state.editorHeight + editorOffset), paddingTop: state.recipientHeight}}>
                        <Suspense
                            fallback={<div/>}
                        >
                            <ExistingDMWindow
                                queryRef={queryRef}
                                onRoomChange={(roomId) => setState({...state, roomId})}
                            />
                        </Suspense>
                    </div>
                }
                <div style={{position: 'absolute', bottom: editorOffset, width: '100%', paddingLeft: 15, paddingRight: 15}}>
                    <div style={{position: 'relative'}}>
                        <MessageEditor
                            onHeightChange={(height: number) => {
                                setState({...state, editorHeight: height});
                            }}
                            sendMessage={onSend}
                            canSend={state.users.length > 0}
                        />
                    </div>
                </div>
            </div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={state.open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={`Cannot add more than ${MAX_DM_USERS} users to a DM.`}
                action={
                    <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
                        <Close fontSize="small" />
                    </IconButton>
                    </React.Fragment>
                }
            />
        </div>
    )
}