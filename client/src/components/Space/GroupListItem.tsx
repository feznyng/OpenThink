import { Button, Card, CardContent, CardHeader, CardMedia, Checkbox, CircularProgress, Dialog, Fab, Grid, Icon, IconButton, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import React from 'react'
import { space } from '../../types/space';
import SpaceIcon from './SpaceIconOld';
import { useHistory } from 'react-router-dom'


interface GroupListItemProps {
    group: space,
    style?: React.CSSProperties
}

const GroupListItem = ({group, style}: GroupListItemProps) => {
    const history = useHistory();
    return (
        <ListItem button style={{width: '100%', ...style}} onClick={() => history.push(`/space/${group.space_id}`)}>
            <ListItemIcon>
                <SpaceIcon
                    organization={group}
                    style={{marginRight: 10}}
                />
            </ListItemIcon>
            <ListItemText
                primary={group.name}
            />
        </ListItem>
    )
}

export default GroupListItem;
