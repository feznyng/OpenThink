import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment } from 'react-relay';
import { useHistory } from 'react-router';
import PinIcon from '../Shared/PinIcon';
import Typography from '../Shared/Typography';

interface SpaceTagListItemProps {
    style?: React.CSSProperties,
    spaceTag: any,
    spaceId?: number,
    truncate?: boolean
}

export default function SpaceTagListItem({spaceTag, truncate, spaceId}: SpaceTagListItemProps) {
    const {tag, postCount, pinned} = useFragment(
        graphql`
            fragment SpaceTagListItemFragment on SpaceTag {
                tag
                postCount
                pinned
            }
        `,
        spaceTag
    )

    const history = useHistory()

    return (
        <ListItem
            style={{padding: 0}}
        >
            <ListItemIcon>
                <Typography variant="h5">
                #
                </Typography>
            </ListItemIcon>
            <ListItemText
                primary={
                    <span
                        style={{display: 'flex', alignItems: 'center'}}
                    >
                        <Typography 
                            variant="body1" 
                            style={{fontWeight: 'bold'}} 
                            clickable
                            onClick={() => history.push(`/tags/${tag.replace(' ', '').toLowerCase()}${spaceId ? '?spaceId=' + spaceId  : ''}`)}
                        >
                            {tag}
                        </Typography>
                        {pinned && <PinIcon style={{width: 20, height: 20, marginLeft: 5, color: 'grey'}}/>}
                    </span>
                }
                secondary={`${pinned ? 'Pinned by mods \u2022 ' : ''}${postCount} ${postCount > 1 ? 'posts' : 'post'} ${truncate ? '' : 'in this group'}`}
            />
        </ListItem>
    )
}
