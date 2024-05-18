import React, { CSSProperties } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Card } from '@material-ui/core';
import { Folder } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import { truncate } from '../../utils/textprocessing';

interface FolderItemProps {
    folder: any,
    style?: CSSProperties
}

export default function FolderItem({style, folder}: FolderItemProps) {
    const {title, author, color} = useFragment(
        graphql`
            fragment FolderItemFragment on Post {
                postId
                title
                color
                author {
                    firstname
                    lastname
                    updatedAt
                    createdAt    
                }
            }
        `,
        folder   
    )

    return (
        <Card variant="outlined" style={{...style, display: 'flex', alignItems: 'center', borderRadius: 5, padding: 15, width: 200}}>
            <Folder
                style={{color, marginRight: 10}}
            /> 
            <Typography
                variant='subtitle2'
            >
                {truncate(title, 15)}
            </Typography>
        </Card>
    )
}
