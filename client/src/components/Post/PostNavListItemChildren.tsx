import React from 'react'
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import PostNavListItem, { PostNavListItemProps } from './PostNavListItem';
import { PostNavListItemChildrenQuery } from './__generated__/PostNavListItemChildrenQuery.graphql';
import { PostNavListItemChildrenPaginationQuery } from './__generated__/PostNavListItemChildrenPaginationQuery.graphql';
import { PostNavListItemChildrenFragment$key } from './__generated__/PostNavListItemChildrenFragment.graphql';

interface PostNavListItemChildrenProps {
    postId: number,
    types?: string[],
    onClick: (postId: number) => void,
}

export default function PostNavListItemChildren({postId, types, ...props}: PostNavListItemChildrenProps & Partial<PostNavListItemProps>) {
    const {post} = useLazyLoadQuery<PostNavListItemChildrenQuery>(
        graphql`
            query PostNavListItemChildrenQuery($postId: ID!, $filterTypes: [String], $childCount: Int!, $childCursor: String) {
                post(postId: $postId) {
                    ...PostNavListItemChildrenFragment
                }
            }
        `,
        {postId: postId.toString(), filterTypes: types, childCount: 100}
    )


    const {data} = usePaginationFragment<PostNavListItemChildrenPaginationQuery, PostNavListItemChildrenFragment$key>(
        graphql`
            fragment PostNavListItemChildrenFragment on Post 
            @refetchable(queryName: "PostNavListItemChildrenPaginationQuery") {
                posts(first: $childCount, after: $childCursor filterTypes: $filterTypes) @connection(key: "PostNavListItemChildrenFragment_posts") {
                    edges {
                        node {
                            ...PostNavListItemFragment
                        }
                    }
                }
            }
        `,
        post
    )

    return (
        <div>
            {
                data?.posts?.edges?.map(({node}: any) => (
                    <PostNavListItem
                        {...props}
                        post={node}
                    />
                ))
            }
        </div>
    )
}
