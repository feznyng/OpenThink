import React, { CSSProperties, Fragment, useEffect } from 'react';
import { useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import MessageCard from '../Message/MessageCard';
import { Link } from '@material-ui/core';
import { CommentsLazyChildrenQuery } from './__generated__/CommentsLazyChildrenQuery.graphql';
import { CommentsLazyChildrenChildQuery } from './__generated__/CommentsLazyChildrenChildQuery.graphql';
import { CommentsLazyChildrenFragment$key } from './__generated__/CommentsLazyChildrenFragment.graphql';

const nextCount = 10

interface CommentsLazyChildrenProps {
    messageId: number,
    getConnectionId?: (connectionId: string) => void,
    deleteComment: (id: string) => void,
    style?: CSSProperties
}

export default function CommentsLazyChildren({messageId, style, getConnectionId, deleteComment}: CommentsLazyChildrenProps) {
    const {message} = useLazyLoadQuery<CommentsLazyChildrenQuery>(
        graphql`
            query CommentsLazyChildrenQuery($messageId: Int!, $commentCount: Int!, $commentCursor: String, $reactionCount: Int!, $reactionCursor: String) {
                message(messageId: $messageId) {
                    messageId
                    ...CommentsLazyChildrenFragment
                }
            }
        `,
        {messageId, commentCount: nextCount, reactionCount: 20}
    )

    const {data, hasNext, loadNext} = usePaginationFragment<CommentsLazyChildrenChildQuery, CommentsLazyChildrenFragment$key>(
        graphql`
            fragment CommentsLazyChildrenFragment on Message 
            @refetchable(queryName: "CommentsLazyChildrenChildQuery") {
                children(first: $commentCount, after: $commentCursor) @connection(key: "CommentsLazyChildren_children") {
                    __id
                    edges {
                        node {
                            messageId
                            ...MessageCard_fragment
                            ...CommentsAddOnFragment
                        }
                    }
                }
            }
        `,
        message
    )

    useEffect(() => {
        data?.children?.__id && getConnectionId && getConnectionId(data.children.__id)
    }, [data?.children?.__id])

    return (
        <div style={{width: '100%', ...style}}>
            {
                data?.children?.edges?.map(({node}: any) => (
                    <MessageCard
                        data={node}
                        deleteMessage={() => deleteComment(node.messageId)}
                        comment
                    />
                ))
            }
            {
                hasNext && 
                <Link style={{cursor: 'pointer', marginLeft: 5, marginTop: 5}} onClick={() => loadNext(nextCount)}>
                    Load More Comments
                </Link>
            }
        </div>
    )
}
