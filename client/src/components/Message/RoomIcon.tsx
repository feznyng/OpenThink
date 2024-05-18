import { Avatar, Typography } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useSelector } from 'react-redux';
import { useFragment } from 'react-relay';
import { RootState } from '../../Store';
import UserIcon from '../User/UserIconOld';
import GroupMessageIcon from './GroupMessageIcon';

interface RoomIconProps {
    room: any,
    style?: React.CSSProperties,
    large?: boolean,
    selected?: boolean,
    color?: 'textPrimary' | 'textSecondary'
}

export default function RoomIcon({room, style, color, selected, large}: RoomIconProps) {
    const icon = useFragment(    
        graphql`      
            fragment RoomIcon on Room {        
                type
                dm
                spaceId
                otherUser {
                    userId
                    firstname
                    lastname
                }
                profilepic
            }    
        `,
        room
    );

    const darkMode = useSelector((state: RootState) => state.uiActions.darkMode)

    if (!icon) {
        return <div>None</div>
    }

    const {spaceId, type, profilepic, dm, otherUser} = icon;

    if (!spaceId) {
        if (dm) {
            return <UserIcon user={otherUser} size={30}/>
            
        } else {
            return <GroupMessageIcon user={otherUser} room={icon} size={30}/>
        }
    } 

    let IconElement = <div/>
    switch(type) {
        case 'text': {
            IconElement = (
                //  style={{fontSize: 23, color: (!selected && muted) ? 'lightgrey' : ''}} variant="body1"
                <Typography color={color ? color : (selected ? "textPrimary" : 'textSecondary')} style={{fontSize: 23, fontWeight: large ? 'bold' : undefined, color: selected ? '' : 'lightgrey'}}>
                    #
                </Typography>
            )
        }
    }

    return large ? <Avatar style={{backgroundColor: darkMode ? 'lightgrey' : 'darkgrey', ...style}}> IconElement </Avatar> : IconElement;
}
