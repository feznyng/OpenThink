import { Typography } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConnectionHandler, useFragment, useMutation, usePaginationFragment } from 'react-relay';
import { setRoomScrollPos } from '../../actions/messageActions';
import { clientId, RootState } from '../../Store';
import { sentMessageSubscribe } from '../../subscriptions/SentMessageSubscription';
import { message, room } from '../../types/message';
import BottomScrollList from '../Shared/BottomScrollList';
import DropZoneWrapper from '../Shared/DropZoneWrapper';
import ChannelHeader from './ChannelHeader';
import DateDivider from './DateDivider';
import MessageCard from './MessageCard';
import MessageEditor from './MessageEditor';

let subscribed: any = null;
const concatDiff = 60000;

interface MessageWindowPanelProps {
    room: any
    user: any
    focusedElsewhere?: boolean,
    hideEditor?: boolean
}

export default function MessageWindowPanel({room, user, hideEditor}: MessageWindowPanelProps) {
    const {data, hasNext, hasPrevious, loadNext, loadPrevious, isLoadingNext} = usePaginationFragment(    
        graphql`      
            fragment MessageWindowPanel_messages on Room      
            @refetchable(queryName: "MessageWindowPanelPaginationQuery") {     
                id 
                name  
                spaceId
                roomId
                dm
                ...RoomIcon
                otherUser {
                    profilepic
                    firstname
                    lastname
                }
                messages(first: $messageCount, after: $messageCursor) @connection(key: "MessageWindowPanel_messages") {       
                    __id   
                    edges {
                        node {
                            ...MessageCard_fragment
                            id
                            messageId
                            createdBy
                            createdAt
                            body
                        }
                    }
                }
            }  
        `,
        room
    );

    const { userId, firstname, lastname, profilepic } = useFragment(
        graphql`
            fragment MessageWindowPanelFragment_user on User {
                userId
                firstname
                lastname
                profilepic
            }
        `,
        user
    )

    const connectionID = data?.messages?.__id;
    const room_graphql_id = data?.id;

    const [commitSendMessage, isMessageSendInFlight] = useMutation(
        graphql`
            mutation MessageWindowPanelSendMutation($connections: [ID!]!, $input: SendMessageInput!, $reactionCount: Int!, $reactionCursor: String) {
                sendMessage(input: $input) {
                    messageEdge @prependEdge(connections: $connections) {
                        node {
                            ...MessageCard_fragment
                        }
                    }
                }
            }
        `
    );
        
    const dispatch = useDispatch();
    const [state, setState] = React.useState({
        editorHeight: 0,
        messagesLoading: false,
        topMost: -1,
        bottom: 50,
        top: 0,
        loading: false,
        message: {},
        set: false,
    })

    const messages = (data && data.messages) ? data.messages.edges.map((e: any) => ({...e.node, createdAt: e.node.createdAt.substring(0, e.node.createdAt.length - 1)})).reverse() : []
    const currentRoom: (room | null) = data;

    const sentinelRef = React.useRef();
    const sentinelBottomRef = React.useRef();
    const messagesWindow = React.useRef();

    const saveScrollPos = (val: number, height: number) => {
        dispatch(setRoomScrollPos(data.roomId, val))
    }

    const getMessages = (top: boolean, bottom: boolean) => {
        if (isMessageSendInFlight) {
            return;
        }
        if (top && !state.loading && hasNext) {
            const msgID = messages[0].messageId;
            setState({...state, loading: true})
            loadNext(50);
            const bottom = state.bottom + 50
            const top = Math.max(0, bottom - 100)
            setTimeout(() => {
                setState({...state, loading: false, bottom, top})
                document.getElementById(msgID.toString())?.scrollIntoView({block: 'start'});
            }, 300)
        } 
        /*
        else if (bottom && !state.loading && state.bottom < messages.length) {
            console.log('invoked bottom')

            const msgID = messages[state.top].messageId;
            setState({...state, loading: false})
            const bottom = Math.max(state.bottom + 50, messages.length)
            const top = Math.min(messages.length, bottom + 100)
            setTimeout(() => {
                setState({...state, loading: false, bottom, top})
                document.getElementById(msgID.toString())?.scrollIntoView({block: 'start'});
            }, 300)
        }
        */
    }

    const sendMessage = (message: message) => {
        const createdAt = new Date();
        commitSendMessage({
            variables: {
                input: {
                    roomId: data.roomId,
                    spaceId: data.spaceId,
                    delta: JSON.stringify(message.delta),
                    body: message.body,
                    files: message.files,
                    mentions: message.mentions,
                    clientId,
                },
                reactionCount: 20,
                connections: [connectionID]
            },
            optimisticUpdater: store => {      
                const roomRecord = store.get(room_graphql_id);
                if (roomRecord) {
                    const connectionRecord = ConnectionHandler.getConnection(    
                        roomRecord,    
                        'MessageWindowPanel_messages',  
                    );
                    if (connectionRecord) {
                        const id = `client:new_message:bruh`;  
                        const user_id = `client:user:${Math.random() * 10000}`;  

                        const newMessage = store.create(id, 'Message');
                        const user = store.create(user_id, 'User');

                        newMessage.setValue(message.body, 'body');
                        newMessage.setValue(userId, 'createdBy');
                        newMessage.setValue((createdAt).toString(), 'createdAt');
                        user.setValue(firstname, 'firstname');
                        user.setValue(userId.toString(), 'userId');  
                        user.setValue(lastname, 'lastname');
                        user.setValue(profilepic, 'profilepic');
                        newMessage.setLinkedRecord(user, 'user');


                        const newEdge = ConnectionHandler.createEdge(    
                            store,    
                            connectionRecord,    
                            newMessage,
                            'MessageEdge', 
                        );
                        ConnectionHandler.insertEdgeBefore(connectionRecord, newEdge);   
                    }
                    
                }
                
            },
        })
    }


    const [commitDeleteMessage, isMessageDeleteInFlight] = useMutation(
        graphql`
            mutation MessageWindowPanelDeleteMutation($connections: [ID!]!, $input: DeleteMessageInput!) {
                deleteMessage(input: $input) {
                    deletedMessageId @deleteEdge(connections: $connections)
                }
            }
        `
    );

    const deleteMessage = (messageId: string) => {
        commitDeleteMessage({
            variables: {
                input: {
                    messageId
                },
                connections: [connectionID]
            }
        })
    }




    React.useEffect(() => {
        if (subscribed) {
            subscribed.dispose();
        }
        if (room_graphql_id) {
            subscribed = sentMessageSubscribe(room_graphql_id, {roomId: data.roomId});
        }
        return () => {
            if (subscribed) {
                subscribed.dispose();
            }
        }
    }, [room_graphql_id]);

    const editorOffset = 25;

    return (
        <div style={{position: 'relative', height: '100%', width: '100%', overflow: 'auto'}}>
           
                <div style={{height: '100%', position: 'relative'}} ref={messagesWindow as unknown as React.LegacyRef<HTMLDivElement>}>
                    {
                        currentRoom && messages && 
                        <div 
                            style={{
                                width: '100%',
                                /* necessary for scrolling */
                                maxHeight: (messagesWindow.current ? ((messagesWindow.current as any).clientHeight) - (state.editorHeight + editorOffset) : "100%"), 
                                paddingLeft: 15,
                                paddingRight: 15,
                                overflow: 'auto',
                                position: 'absolute',
                                bottom: state.editorHeight + editorOffset,
                            }} 
                        >
                            <BottomScrollList
                                initialPos={0}
                                onScroll={(val: any, bottom: any, top: any, height: number) => {
                                    saveScrollPos(val, height)
                                    getMessages(top, bottom);
                                }}
                                listId={data.roomId}
                            >
                                {
                                    !hasNext &&
                                    <div style={{marginBottom: 10, textAlign: 'left', paddingTop: 10}}>
                                        <ChannelHeader
                                            room={currentRoom}
                                        />
                                    </div>
                                }
                                <div ref={sentinelRef as never as React.LegacyRef<HTMLDivElement>}>
                                    <Typography>
                                        {state.loading && 'Loading more messages...'}
                                    </Typography>
                                </div>
                                <div style={{paddingTop: 20}}>
                                    {
                                        messages.map((m: message, i: number) => {
                                            let concat = (
                                                i > 0 
                                                && m.createdBy!!.toString() === messages[i - 1].createdBy.toString()
                                                && (!messages[i - 1].files || messages[i - 1].files.length === 0) 
                                                && (Math.abs((new Date(messages[i - 1].createdAt).getTime()) - (new Date(m.createdAt!!.toString()).getTime())) < concatDiff)

                                            );
                                            
                                            const showDate = (
                                                (i === 0  && !hasNext) || 
                                                (
                                                i > 0 &&
                                                !concat &&
                                                (new Date (messages[i - 1].createdAt).getDate() !== new Date(m.createdAt!!.toString()).getDate()))
                                            );
                                            return (
                                                <div
                                                    key={i}
                                                    id={m.messageId?.toString()}
                                                >
                                                    {
                                                        showDate && 
                                                        <DateDivider 
                                                            style={{marginTop: 10, marginBottom: 25, alignContent: 'center', width: '100%', position: 'relative'}}
                                                            date={m.createdAt!!.toString()}
                                                        />
                                                    }
                                                    <MessageCard
                                                        room_graphql_id={room_graphql_id}
                                                        data={m}
                                                        spaceId={data.spaceId}
                                                        concat={concat}
                                                        deleteMessage={deleteMessage}
                                                    />
                                                </div>
                                            )
                                        })
                                    }  
                                </div>
                                <div ref={sentinelBottomRef as any}>
                                    <Typography>
                                        {state.loading && 'Loading more messages...'}
                                    </Typography>
                                </div>
                            </BottomScrollList>
                        </div>
                    }
                    {
                        !hideEditor && 
                        <div style={{position: 'absolute', bottom: editorOffset - 10, width: '100%', paddingLeft: 15, paddingRight: 15}}>
                            <div style={{position: 'relative'}}>
                                <MessageEditor
                                    onHeightChange={(height: number) => {
                                        setState({...state, editorHeight: height});
                                    }}
                                    sendMessage={sendMessage}
                                    roomId={data.roomId}
                                    canSend
                                />
                            </div>
                        </div>
                    }
                </div>
        </div>
    )
}
