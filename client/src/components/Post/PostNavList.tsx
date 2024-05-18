import React from 'react'
import { useFragment} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import PostNavListItem from './PostNavListItem';

interface PostNavListProps {
    posts: any,
    childTypes?: string[],
    onClick: (postId: number) => void,
    selectedPostId?: number
}

export default function PostNavList({posts, ...props}: PostNavListProps) {

    const {edges} = useFragment(
        graphql`
            fragment PostNavListFragment on PostConnection {
                edges {
                    node {
                        postId
                        ...PostNavListItemFragment
                    }
                }
            }
        `,
        posts
    )

    return (
        <div>
            {
                edges.map(({node}: any) => (
                    <PostNavListItem
                        post={node}
                        {...props}
                    />
                ))
            }
        </div>
    )
}
