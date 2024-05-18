import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import PostVoteButton from './PostVoteButton';
import PostCommentButton, { PostCommentButtonProps } from './PostCommentButton';
import PostSubpostButton, { PostSubpostButtonProps } from './PostSubpostButton';
import PostShareButton from './PostShareButton';

interface PostActionsProps {
    post: any,
    style?: React.CSSProperties,
    openSubposts: () => void,
    reactionConnectionId: string
}

export default function PostActions({post, reactionConnectionId, toggleComments, openSubposts, style}: PostSubpostButtonProps & PostCommentButtonProps &  PostActionsProps) {

    const {postId, ...data} = useFragment(
        graphql`
            fragment PostActionsFragment on Post {
                postId
                ...PostVoteButtonFragment
                ...PostCommentButtonFragment
                ...PostSubpostButtonFragment
                ...PostShareButtonFragment
            }
        `,
        post
    )

    return (
        <div style={{width: '100%', ...style, }}>
            <div style={{float: 'left', display: 'flex', height: '100%', alignItems: 'center'}}>
                <PostVoteButton
                    post={data}
                    connectionId={reactionConnectionId}
                />
                <PostSubpostButton
                    post={data}
                    openSubposts={openSubposts}
                />
                <PostCommentButton
                    post={data}
                    toggleComments={toggleComments}
                />
            </div>
            <div style={{float: 'right', display: 'flex', height: '100%', marginTop: 4, alignItems: 'center'}}>
                <PostShareButton
                    post={data}
                />
            </div>
        </div>
    )
}
