import React from 'react'
import { usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import ReactionChip from '../Reactions/ReactionChip';
import { PostReactionsFragment$key } from './__generated__/PostReactionsFragment.graphql';
import { PostReactionsQuery } from './__generated__/PostReactionsQuery.graphql';

interface PostReactionsProps {
    post: any,
    style?: React.CSSProperties,
    getConnection: (connectionId: string) => void
}

const chipStyle = {marginLeft: 5, marginBottom: 5}

export default function PostReactions({post, getConnection, ...props}: PostReactionsProps) {
    const {data} = usePaginationFragment<PostReactionsQuery, PostReactionsFragment$key>(
        graphql`
            fragment PostReactionsFragment on Post @refetchable(queryName: "PostReactionsQuery") {
                reactions(first: $reactionCount, after: $reactionCursor) @connection(key: "PostReactionsFragment_reactions") {
                    __id
                    edges {
                        node {
                            id
                            ...ReactionChipFragment
                        }
                    }
                }
                postId
            }
        `,
        post
    )
    const connectionId = data?.reactions?.__id;
    React.useEffect(() => {
        getConnection && connectionId && getConnection(connectionId)
    }, [connectionId])

    const reactions = data?.reactions?.edges ? data.reactions.edges.map((e: any) => e.node) : []


    return (
        <div>
            {
                reactions.length > 0 && 
                <div>
                    <div {...props} style={{...props.style, marginTop: 10, marginBottom: 5, display: 'flex', alignItems: 'center'}}>
                        {
                            reactions.map((r) => (
                                <ReactionChip 
                                    reaction={r} 
                                    style={chipStyle}
                                    connectionId={connectionId}
                                />
                            ))
                        }
                    </div>
                </div>
            }
        </div>
    )
}
