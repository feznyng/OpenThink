import React, { CSSProperties, useEffect, useMemo } from 'react'
import { useFragment, useLazyLoadQuery, useMutation, usePaginationFragment, usePreloadedQuery, useSubscription } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { CommentsSectionQuery } from './__generated__/CommentsSectionQuery.graphql';
import MessageEditor from '../Message/MessageEditor';
import { message } from '../../types/message';
import UserIcon from '../User/UserIcon';
import MessageCard from '../Message/MessageCard';
import { CommentsSectionFragment$key } from './__generated__/CommentsSectionFragment.graphql';
import { CommentsSectionDeleteMutation } from './__generated__/CommentsSectionDeleteMutation.graphql';
import { clientId } from '../../Store';
import { CommentsSectionCreateMutation } from './__generated__/CommentsSectionCreateMutation.graphql';
import Button from '../Shared/Button';
import { CommentsSectionFragment_content$key } from './__generated__/CommentsSectionFragment_content.graphql';
import { CommentsSectionCommentsQuery } from './__generated__/CommentsSectionCommentsQuery.graphql';
import { CommentsSectionSubscription, CommentsSectionSubscription$data } from './__generated__/CommentsSectionSubscription.graphql';
import { ConnectionHandler, RecordSourceSelectorProxy } from 'relay-runtime';

interface CommentsSectionProps {
    postId: number,
    style?: CSSProperties,
    spaceId?: number
}

export default function CommentsSection({postId, style, spaceId}: CommentsSectionProps) {
    const {post, me} = useLazyLoadQuery<CommentsSectionQuery>(
        graphql`
            query CommentsSectionQuery($postId: ID!, $commentCount: Int!, $commentCursor: String, $reactionCount: Int!, $reactionCursor: String) {
                post(postId: $postId) {
                    id
                    postId
                    ...CommentsSectionFragment
                }
                me {
                    ...UserIconFragment
                }
            }
        `,
        {postId: postId.toString(), commentCount: 20, reactionCount: 20}
    )

    const {data, hasNext, loadNext} = usePaginationFragment<CommentsSectionCommentsQuery, CommentsSectionFragment$key>(
        graphql`
            fragment CommentsSectionFragment on Post 
            @refetchable(queryName: "CommentsSectionCommentsQuery") {
                comments(first: $commentCount, after: $commentCursor) @connection(key: "CommentsSectionFragment_comments") {
                    ...CommentsSectionFragment_content
                    edges {
                        node {
                            id
                            messageId
                        }
                    }
                }
            }
        `,
        post
    )

    const comments = useFragment<CommentsSectionFragment_content$key>(
        graphql`
            fragment CommentsSectionFragment_content on MessageConnection {
                __id
                edges {
                    node {
                        messageId
                        id
                        childrenCount
                        ...MessageCard_fragment
                        ...CommentsAddOnFragment
                        children(first: 5) @connection(key: "CommentsSectionFragment_content_children") {
                            __id
                            edges {
                                cursor
                                node {
                                    messageId
                                    childrenCount
                                    ...MessageCard_fragment
                                    ...CommentsAddOnFragment
                                    children(first: 0) @connection(key: "CommentsSectionFragment_content_children") {
                                        __id
                                        edges {
                                            cursor
                                            node {
                                                messageId
                                                ...MessageCard_fragment
                                                ...CommentsAddOnFragment
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
            }
        `,
        data?.comments ? data.comments : null
    )

    const connectionID = comments?.__id

    const [commitCreateComment] = useMutation<CommentsSectionCreateMutation>(
        graphql`
            mutation CommentsSectionCreateMutation($connections: [ID!]!, $input: SendMessageInput!, $reactionCount: Int!, $reactionCursor: String) {
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

        if (post && post.postId) {
            commitCreateComment({
                variables: {
                    input: {
                        postId: post?.postId,
                        spaceId: spaceId,
                        delta: JSON.stringify(message.delta),
                        body: message.body!!,
                        mentions: [],
                        clientId,
                    },
                    reactionCount: 20,
                    connections: connectionID ? [connectionID] : []
                },
                updater: (store) => {
                    const postRecord = store.get(post.id)
                    postRecord?.setValue(postRecord.getValue('numComments') as number + 1, 'numComments')
                }
            })
        }
    }

    const [commitDeleteComment] = useMutation<CommentsSectionDeleteMutation>(
        graphql`
            mutation CommentsSectionDeleteMutation($input: DeleteMessageInput!) {
                deleteMessage(input: $input) {
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
                    messageId,
                },
            }
        })
    }

    const config = useMemo(() => ({
        subscription: graphql`
            subscription CommentsSectionSubscription($input: MessageSubInput!, $reactionCount: Int!, $connections: [ID!]!, $reactionCursor: String) {
                roomMessages(input: $input) {
                    messageEdge {
                        node {
                            ...MessageCard_fragment
                            clientId
                            replyingToId
                            room {
                                id
                                lastMessageAt
                            }
                        }
                    }
                    message  {
                        id
                        body
                        deleted
                    }
                    deletedMessageId @deleteEdge(connections: $connections)
                }
            }
        `,
        variables: {
            reactionCount: 20,
            input: {
                postId: post?.postId,
                clientId,
            },
            connections: connectionID ? [connectionID] : []
        },
        updater: (store: RecordSourceSelectorProxy<CommentsSectionSubscription$data>) => {
            if (connectionID) {
                const connection = store.get(connectionID)
                const payload = store.getRootField('roomMessages');
                if (payload && connection) {
                    // new comment
                    const messageEdge = payload.getLinkedRecord('messageEdge');
                    if (messageEdge) {
                        const node = messageEdge.getLinkedRecord('node')
                        const replyingToId = node.getValue('replyingToId')
                        console.log(replyingToId)
                        if (replyingToId) {
                            // get associated comment and set load more to true
                            const comment = store.get(replyingToId)
                            if (comment) {
                                const pageInfo = ConnectionHandler.getConnection(comment, 'CommentsAddOn_empty_children')?.getLinkedRecord('pageInfo')
                                console.log('children pageInfo', pageInfo)
                                pageInfo?.setValue(true, 'hasNextPage')
                                const childrenCount = (comment.getValue('childrenCount') ? comment.getValue('childrenCount') : 0) as number
                                comment.setValue(childrenCount + 1, 'childrenCount')
                            }
                        } else {
                            // new parent level comment
                            const newEdge = ConnectionHandler.buildConnectionEdge(
                                store,
                                connection,
                                messageEdge,
                            );
                            newEdge && ConnectionHandler.insertEdgeBefore(
                                connection,
                                newEdge,
                            );
                        }
                    }
                }
            }
            
        }
    }), [post?.postId]);

    useSubscription<CommentsSectionSubscription>(config)
    

    return (
        <div style={style}>
            <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
                <UserIcon
                    user={me}
                    size={45}
                    style={{marginRight: 10}}
                />
                <MessageEditor
                    sendMessage={createComment}
                    canSend
                    style={{borderRadius: 25, width: "100%"}}
                    placeholder={'Comment on this post'}
                />
            </div>
            <div style={{marginTop: 20}}>
                {
                    comments?.edges?.map(({node}: any) => (
                        <MessageCard
                            data={node}
                            deleteMessage={deleteComment}
                            comment
                            key={node.messageId.toString()}
                        />
                    ))
                }
                {
                    hasNext &&
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                        <Button onClick={() => loadNext(20)}>
                            More Comments
                        </Button>
                    </div>
                }
            </div>
        </div>
    )
}
