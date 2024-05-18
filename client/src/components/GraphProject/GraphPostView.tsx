import React from 'react'
import { usePreloadedQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { GraphPostViewQuery } from './__generated__/GraphPostViewQuery.graphql';

interface GraphPostViewProps {
    queryRef: any
}

export default function GraphPostView({queryRef}: GraphPostViewProps) {
    const {} = usePreloadedQuery<GraphPostViewQuery>(
        graphql`
            query GraphPostViewQuery($postId: ID!) {
                post (postId: $postId) {
                    postId
                }
            }
        `,
        queryRef
    )

    return (
        <div>
            
        </div>
    )
}
