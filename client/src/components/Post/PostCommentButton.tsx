import React from 'react'
import { Avatar, Card, CardActions, CardContent, CardHeader, Divider, IconButton, Tooltip } from '@material-ui/core'
import { useFragment, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import {TypographyProps} from '@material-ui/core'
import { useHistory } from 'react-router';
import Editor from './Editor/PostTipTap';
import { Comment, Favorite, KeyboardArrowDown, KeyboardArrowUp, ThumbUp } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import Button from '../Shared/Button';
import { textSecondary } from '../../theme';

export interface PostCommentButtonProps {
    post: any,
    style?: React.CSSProperties,
    toggleComments: () => void
}

export default function PostCommentButton({post, toggleComments, ...props}: PostCommentButtonProps) {

    const {postId, numComments} = useFragment(
        graphql`
            fragment PostCommentButtonFragment on Post {
                postId
                numComments
            }
        `,
        post
    )

    return (
        <Tooltip title="Comments">
            <span {...props}>
                <Button
                    startIcon={<Comment/>}
                    // size="small"
                    onClick={toggleComments}
                >
                    {numComments ? numComments : 0} 
                </Button>
            </span>
        </Tooltip>
    )
}
