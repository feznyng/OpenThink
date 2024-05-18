import graphql from 'babel-plugin-relay/macro';
import React, { Fragment } from 'react';
import { usePaginationFragment } from 'react-relay';
import ReactionChip from '../Reactions/ReactionChip';

interface MessageReactionsProps {
    message: any,
    style?: React.CSSProperties,
    getConnection?: (connectionId: string) => void
}

const chipStyle = {marginLeft: 5, marginBottom: 5}

export default function MessageReactions({message, getConnection, ...props}: MessageReactionsProps) {
    const {data} = usePaginationFragment(
        graphql`
            fragment MessageReactionsFragment on Message @refetchable(queryName: "MessageReactionsQuery") {
                reactions(first: $reactionCount, after: $reactionCursor) @connection(key: "MessageReactionsFragment_reactions") {
                    __id
                    edges {
                        node {
                            id
                            ...ReactionChipFragment
                        }
                    }
                }
                messageId
            }
        `,
        message
    )

    const connectionId = data?.reactions?.__id;
    React.useEffect(() => {
        getConnection && connectionId && getConnection(connectionId)
    }, [connectionId])

    const reactions = data?.reactions?.edges ? data.reactions.edges.map((e: any) => e.node) : []

    return (
        <Fragment>
            {
                reactions.length > 0 && 
                <div {...props} style={{...props.style, display: 'flex', alignItems: 'center'}}>
                    {
                        reactions.map((r: any) => (
                            <ReactionChip 
                                reaction={r} 
                                style={chipStyle}
                                connectionId={connectionId}
                            />
                        ))
                    }
                </div>
            }
        </Fragment>
    )
}
