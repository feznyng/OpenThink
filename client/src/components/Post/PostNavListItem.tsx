import React, { Suspense } from 'react'
import { useFragment, usePaginationFragment} from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import SidenavListItem from '../Shared/SidenavListItem';
import PostNavListItemChildren from './PostNavListItemChildren';
import { CircularProgress } from '@material-ui/core';

export interface PostNavListItemProps {
    post: any,
    childTypes?: string[],
    onClick: (postId: number) => void,
    selectedPostId?: number
}

export default function PostNavListItem({post, childTypes, selectedPostId, onClick, ...props}: PostNavListItemProps) {
    const [state, setState] = React.useState({
        open: false,
    })

    const {title, icon, postId, numPosts} = useFragment(
        graphql`
            fragment PostNavListItemFragment on Post {
                postId
                title
                numPosts
            }
        `,
        post
    )

    return (
        <div>
            <SidenavListItem
                title={title}
                icon={icon}
                value={postId}
                selected={postId === selectedPostId}
                onClick={onClick}
                hasChildren={numPosts && numPosts > 0}
                children={
                    <Suspense
                        fallback={<div/>}
                    >
                        <PostNavListItemChildren
                            postId={postId}
                            types={childTypes}
                            onClick={onClick}
                            selectedPostId={selectedPostId}
                            {...props}
                        />
                    </Suspense>
                }
            />
        </div>
    )
}
