import React from 'react'
import { Tooltip } from '@material-ui/core'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Share } from '@material-ui/icons';
import Button from '../Shared/Button';
import { useHistory, useParams } from 'react-router';

export interface PostSubpostButtonProps {
    post: any,
    style?: React.CSSProperties,
    openSubposts: () => void
}

export default function PostSubpostButton({post, openSubposts, ...props}: PostSubpostButtonProps) {

    const {numPosts, postId, ...data} = useFragment(
        graphql`
            fragment PostSubpostButtonFragment on Post {
                numPosts
                postId
            }
        `,
        post
    )

    return (
        <Tooltip title="Subposts">
            <span {...props}>
                <Button
                    startIcon={<Share style={{transform: 'rotate(90deg)'}}/>}
                    // size='small'
                    onClick={openSubposts}
                >
                    {numPosts}
                </Button>
            </span>
        </Tooltip>
    )
}
