import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import PostIcon from './PostIcon';
import Typography from '../Shared/Typography';
import { ListItem } from '@material-ui/core';
import PostIconBase from './PostIconBase';

interface PostPreviewBaseProps {
    postId: number,
    title: string,
    type: string,
    color: string,
    openPost?: (postId: number) => void,
    postColor: string,
    icon: string
}

export default function PostPreviewBase({postId, type, icon, postColor, color, title, openPost}: PostPreviewBaseProps) {
    return (
        <ListItem 
            style={{display: 'flex', alignItems: 'center', paddingLeft: 5, paddingRight: 5, paddingTop: 2, paddingBottom: 2}} 
            button={!!openPost as true} 
            onClick={() => openPost && openPost(postId)}
        >
            <PostIconBase type={type} postColor={postColor} icon={icon} color={color} size={20} style={{marginRight: 5}}/>
            <Typography>{title}</Typography>
        </ListItem>
    )
}
