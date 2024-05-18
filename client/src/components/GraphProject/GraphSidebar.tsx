import React from 'react'
import { useFragment, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { GraphSidebarPaginationQuery } from './__generated__/GraphSidebarPaginationQuery.graphql';
import { GraphSidebarFragment$key } from './__generated__/GraphSidebarFragment.graphql';

interface GraphSidebarProps {
    space: any
}

export default function GraphSidebar({ space }: GraphSidebarProps) {
    const { data } = usePaginationFragment<GraphSidebarPaginationQuery, GraphSidebarFragment$key>(
        graphql`
            fragment GraphSidebarFragment on Space @refetchable(queryName: "GraphSidebarPaginationQuery") {
                posts(first: $postCount, after: $postCursor, filterTypes: ["Map"]) @connection(key: "GraphSidebarFragment_posts") {
                    edges {
                        node {
                            postId
                            title
                        }
                    }
                }
            }
        `,
        space
    )

    console.log(data.posts)
    
    return (
        <div>
            
        </div>
    )
}
