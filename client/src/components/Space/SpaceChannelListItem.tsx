import React, { MouseEvent } from 'react'
import { useFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { Menu, IconButton, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import RoomIcon from '../Message/RoomIcon';
import { useHistory } from 'react-router';
import { MoreVert } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import ChannelListOptionsMenu from '../Message/ChannelListOptionsMenu';
import { Anchor } from '../Post/PostContentEditor';
import UnreadChip from '../Message/UnreadChip';
import { room } from '../../types/message';

interface SpaceChannelListItemProps {
    channel: any,
    style?: React.CSSProperties,
    onMenu: (e: MouseEvent, r: room) => void
}

interface SpaceChannelListItemState {
    anchorEl: Anchor
}

export default function SpaceChannelListItem({channel, onMenu, style}: SpaceChannelListItemProps) {
    const data: any = useFragment(    
        graphql`      
            fragment SpaceChannelListItemFragment on Room {   
                id     
                name
                roomId
                type
                spaceId
                numUsers
                visibility
                dm
                ...RoomIcon
                ...RoomSettings_fragment
                ...UnreadChipFragment
                currUser {
                    id
                    roomUserId
                    unread
                    unreadNum
                }
            }    
        `,
        channel
    ); 
    
    let {
        name,
        spaceId,
        roomId,
        numUsers,
        visibility,
        currUser
    } = data;

    const [state, setState] = React.useState<SpaceChannelListItemState>({
        anchorEl: null
    })

    const history = useHistory();

    visibility = visibility.charAt(0).toUpperCase() + visibility.substring(1, visibility.length)

    return (
        <ListItem 
            style={style}
        >
            <ListItemIcon>
                <Typography variant="h6" style={{fontSize: 30}}>
                    #
                </Typography>
            </ListItemIcon>
            <ListItemText
                disableTypography
                primary={
                    <Typography
                        clickable
                        onClick={() => history.push(`/messages/${spaceId}/${roomId}`)}
                        variant="h6"
                    >
                        {name}
                    </Typography>
                }
                secondary={`${visibility} \u2022 ${numUsers ? numUsers : 0} Users`}
            />
            <div style={{position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <UnreadChip
                        style={{marginRight: 5}}
                        room={data}
                    />
                    <IconButton
                        onClick={(e) => onMenu(e, data)}
                    >
                        <MoreVert/>
                    </IconButton>
                </div>
            </div>
        </ListItem>
    )
}
