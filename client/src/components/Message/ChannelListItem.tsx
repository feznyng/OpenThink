import { ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useSelector } from 'react-redux';
import { useFragment } from 'react-relay';
import { RootState } from '../../Store';
import { room } from '../../types/message';
import RoomIcon from './RoomIcon';
import UnreadChip from './UnreadChip';

interface ChannelListItem{
    data: any,
    onClick: (room: room) => void,
    selected: boolean
    dm?: boolean,
    style?: React.CSSProperties
}

export default function ChannelListItem({data, onClick, style, selected}: ChannelListItem) {
    const room: any = useFragment(    
        graphql`      
            fragment ChannelListItem on Room {        
                name
                roomId
                type
                dm
                spaceId
                ...RoomIcon
                ...UnreadChipFragment
                currUser {
                    id
                    roomUserId
                    unread
                    unreadNum
                }
            }    
           
        `,
        data
    );


    const {
        darkMode
    } = useSelector((state: RootState) => state.uiActions);

    return (
        <ListItem 
            style={{...style, width: '100%', display: 'flex', height: room?.spaceId ? 30 : 50, borderRadius: 10, position: 'relative'}} 
            button 
            selected={selected} 
            onClick={() => onClick(room)}
        >
            {
                room?.currUser.unread && 
                <div
                style={{
                    position: 'absolute', 
                    left: 0, 
                    top: 0,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center'
                }}
                >
                <div 
                    style={{
                    borderTopRightRadius: 25, 
                    borderBottomRightRadius: 25, 
                    backgroundColor: darkMode ? 'white' : 'black',
                    width: 3, 
                    height: 8
                    }}
                /> 
                </div>
            }
            <ListItemIcon>
                <RoomIcon
                    room={room}
                    selected={selected}
                />
            </ListItemIcon>
            <ListItemText style={{marginLeft: room?.spaceId ? -35 : -15}}>
                <Typography color={selected ? "textPrimary" : 'textSecondary'} style={{color: (!selected && room?.muted) ? 'lightgrey' : ''}}>{room?.name ? room?.name : data.customName}</Typography>
            </ListItemText>
           
            <UnreadChip
                room={room}
            />
        </ListItem>
    )
}
