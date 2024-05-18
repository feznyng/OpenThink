import React, { Suspense, useState } from 'react';
import { ConnectionHandler, useFragment, useMutation, commitLocalUpdate, useLazyLoadQuery } from 'react-relay';
import MessageCard from '../Message/MessageCard';
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button';
import { Comment, Delete, Edit, MoreHoriz } from '@material-ui/icons';
import { IconButton, Link, ListItemText, Menu, MenuItem, Typography } from '@material-ui/core';
import { Anchor } from '../Post/PostContentEditor';
import MessageEditor from '../Message/MessageEditor';
import { message } from '../../types/message';
import { environment, clientId } from '../../Store';
import { fetchQuery } from '../../utils/graphqlutils'
import CommentsLazyChildren from './CommentsLazyChildren'
import { CircularProgress } from '@mui/material';
import { CommentsAddOnLoadNextQuery$data } from './__generated__/CommentsAddOnLoadNextQuery.graphql';
import { CommentsAddOnCreateMutation } from './__generated__/CommentsAddOnCreateMutation.graphql'
import { CommentsAddOnDeleteMutation } from './__generated__/CommentsAddOnDeleteMutation.graphql'
import { CommentsAddOnMeQuery } from './__generated__/CommentsAddOnMeQuery.graphql';

const menuOptions = [
    {
        name: 'Edit',
        icon: <Edit/>
    },
    {
        name: 'Delete',
        icon: <Delete/>
    }
]

interface CommentsAddOnProps {
    data: any,
    editPost: () => void,
    deleteComment?: (id: string) => void
}

interface CommentsAddOnState {
    replying: boolean,
    anchorEl: Anchor,
    showChildren: boolean,
    connectionId?: string
}

export default function CommentsAddOn({data, editPost, ...props}: CommentsAddOnProps) {
    const {deleted, id, messageId, createdBy, childrenCount, postId, empty_children} = useFragment(
        graphql`
            fragment CommentsAddOnFragment on Message {
                messageId
                id
                postId
                childrenCount
                empty_children: children(first: 0) @connection(key: "CommentsAddOn_empty_children") {
                    pageInfo {
                        hasNextPage
                    }
                    edges {
                        node {
                            id
                        }
                    }
                }
                createdBy
                deleted
            }
        `,
        data
    )

    const { me } = useLazyLoadQuery<CommentsAddOnMeQuery>(
        graphql`
            query CommentsAddOnMeQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )

    const [state, setState] = useState<CommentsAddOnState>({
        replying: false,
        anchorEl: null,
        showChildren: false
    })

    const connectionID = data.children?.__id ? data.children?.__id : (state.connectionId ? state.connectionId : undefined)

    const [commitDeleteComment] = useMutation<CommentsAddOnDeleteMutation>(
        graphql`
            mutation CommentsAddOnDeleteMutation($input: DeleteMessageInput!) {
                deleteMessage(input: $input) {
                    deletedMessageId
                    roomId
                    deletedMessageId
                    roomId
                    message {
                        id
                        deleted
                    }
                }
            }
        `
    );

    const deleteComment = (messageId: string) => {
        commitDeleteComment({
            variables: {
                input: {
                    messageId
                },
            }
        })
    }

    const [commitCreateComment] = useMutation<CommentsAddOnCreateMutation>(
        graphql`
            mutation CommentsAddOnCreateMutation($connections: [ID!]!, $input: SendMessageInput!, $reactionCount: Int!, $reactionCursor: String) {
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

    const createComment = (message: message) => {
        commitCreateComment({
            variables: {
                input: {
                    postId: postId,
                    replyingTo: parseInt(messageId),
                    spaceId: null,
                    delta: JSON.stringify(message.delta),
                    body: message.body!!,
                    clientId,
                },
                reactionCount: 20,
                connections: connectionID ? [connectionID] : []
            },
            onCompleted: () => {

                setState({
                    ...state,
                    showChildren: true,
                    replying: false
                })
                !state.showChildren && loadNext()
            }   
        })
    }

    const menuAction = (name: string) => {
        setState({...state, anchorEl: null})
        switch(name) {
            case 'Edit':
                editPost()
                break
            case 'Delete':
                props.deleteComment && props.deleteComment(id)
                break
        }
    }

    const toggleReply = () => setState({...state, replying: !state.replying})

    const loadNext = () => {
        if (data.children) {
            fetchQuery(
                graphql`
                    query CommentsAddOnLoadNextQuery($messageId: Int!, $cursor: String, $reactionCount: Int!, $reactionCursor: String) {
                        message(messageId: $messageId) {
                            children(first: 10, after: $cursor) @connection(key: "CommentsAddOnLoadNextQuery_children") {
                                __id
                                edges {
                                    node {
                                        ...MessageCard_fragment
                                        ...CommentsAddOnFragment
                                        messageId
                                        children(first: 1) @connection(key: "CommentsAddOnLoadNextQuery_children_children") {
                                            __id
                                            edges {
                                                cursor
                                                node {  
                                                    ...MessageCard_fragment
                                                    ...CommentsAddOnFragment
                                                    messageId
                                                }
                                            }
                                            pageInfo {
                                                hasNextPage
                                            }
                                        }
                                    }
                                }
                                pageInfo {
                                    hasNextPage
                                }
                            }
                        }
                    }
                `,
                {reactionCount: 20, messageId: parseInt(messageId), cursor: data.children.edges[data?.children?.edges?.length - 1]?.cursor},
            ).subscribe({
                next: (data) => {
                    commitLocalUpdate(environment, (store) => {
                        if (connectionID) {
                            const connection = store.get(connectionID)
                            const childrenId = (data as CommentsAddOnLoadNextQuery$data)?.message?.children?.__id
                            if (!!childrenId) {
                                const nextConnection = store.get(childrenId)
                                if (connection && nextConnection) {
                                    const edges = nextConnection.getLinkedRecords('edges')
                                    const pageInfo = connection.getLinkedRecord('pageInfo')
                                    if (pageInfo) {
                                        pageInfo.setValue(!!(data as CommentsAddOnLoadNextQuery$data)?.message?.children?.pageInfo.hasNextPage, 'hasNextPage')
                                    }
                                    edges?.forEach(e => {
                                        const node = e.getLinkedRecord('node')
                                        ConnectionHandler.insertEdgeAfter(connection, e);
                                    })
                                }
                            }
                            
                        }
                    })
                }
            })
        } else {
            setState({
                ...state,
                showChildren: true,
                replying: false
            })
        }
    }

    return (
        <div style={{width: '100%', height: '100%'}}>
            {
                !deleted && 
                <div style={{display: 'flex', alignItems: 'center'}}> 
                    {
                        /**
                         * <Button
                                size="small"
                                startIcon={<Comment/>}
                                onClick={toggleReply}
                            >
                                Reply
                            </Button>
                         */
                    }                       
                    
                    {
                        parseInt(createdBy) === (me?.userId ? me.userId : -1) && 
                        <IconButton size="small" style={{marginLeft: 5}} onClick={(e) => setState({...state, anchorEl: e.currentTarget})}>
                            <MoreHoriz fontSize='small'/>
                        </IconButton>
                    }
                    <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                        {
                            menuOptions.map(({icon, name}) => (
                                <MenuItem onClick={() => menuAction(name)}>
                                    {icon}
                                    <ListItemText
                                        primary={name}
                                        style={{marginLeft: 5}}
                                    />
                                </MenuItem>
                            ))
                        }
                    </Menu>
                </div>
            }
            {
                state.replying && 
                <div style={{marginTop: 10, marginBottom: 10}}>
                    <MessageEditor
                        sendMessage={createComment}
                        canSend
                        disableKeypressFocus
                        autoFocus
                        style={{borderRadius: 25}}
                        placeholder="Reply"
                    />
                    <div style={{display: 'flex', justifyContent: 'end', marginTop: 10}} onClick={toggleReply}>
                        <Button size="small">Cancel</Button>
                    </div>
                </div>
            }
            <div style={{borderLeft: 'solid', borderColor: 'grey', borderWidth: 1, paddingLeft: 5, marginLeft: 2, width: '100%', height: '100%'}}>
                {
                    /*
                    !state.showChildren && data?.children?.edges?.map(({node}: any) => (
                        <MessageCard
                            data={node}
                            deleteMessage={() => deleteComment(node.messageId)}
                            comment
                        />
                    ))
                    */
                }
                {
                    /*
                    (data?.children?.pageInfo?.hasNextPage || empty_children?.pageInfo.hasNextPage) && childrenCount > 0 && 
                    <Link style={{cursor: 'pointer', marginLeft: 5, paddingTop: 15}} onClick={loadNext}>
                        Load {childrenCount} More Comments
                    </Link>
                    */
                }
                {
                    state.showChildren && 
                    <Suspense fallback={<CircularProgress/>}>
                        <CommentsLazyChildren
                            messageId={parseInt(messageId)}
                            deleteComment={deleteComment}
                            style={{marginTop: 10}}
                            getConnectionId={connectionId => setState({...state, connectionId})}
                        />
                    </Suspense>
                }
            </div>
        </div>
    )
}
