import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import PostIcon from './PostIcon';
import Typography from '../Shared/Typography';
import Button from '../Shared/Button';
import { PreviewProps } from '../Space/SpacePreviewButton';
import { truncate as truncateString } from '../../utils/textprocessing';

interface PostPreviewProps extends PreviewProps {
    post: any,
}

export default function PostPreview({post, titleProps, iconProps, onClick, truncate, ...props}: PostPreviewProps) {
    const {title, postId, ...data} = useFragment(
        graphql`
            fragment PostPreviewFragment on Post{
                ...PostIconFragment
                postId
                title
            }
        `,
        post
    )

    return (
        <Button
            size="small"
            onClick={() => onClick && onClick()}
            startIcon={<PostIcon size={20} {...iconProps} post={data}/>}
            {...props}
        >
            <Typography {...titleProps}>{truncate ? truncateString(title, 15) : title}</Typography>
        </Button>
    )
}
