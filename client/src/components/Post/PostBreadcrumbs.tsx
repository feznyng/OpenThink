import React from 'react'
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { ListItem } from '@material-ui/core';

interface PostBreadcrumbsProps {
    post: any
}


export default function PostBreadcrumbs({post}: PostBreadcrumbsProps) {
    const {} = useFragment(
        graphql`
            fragment PostBreadcrumbsFragment on Post {
                postId
            }
        `,
        post
    )
    return (
        <div>
            <ListItem
                button
            >

            </ListItem>
        </div>
    )
}
