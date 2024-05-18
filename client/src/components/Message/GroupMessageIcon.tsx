import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import { getImage } from '../../actions/S3Actions';
import { room } from '../../types/message';
import { user } from '../../types/user';
import UserIcon from '../User/UserIconOld';

interface GroupMessageIconProps {
    room: room,
    user: user,
    style?: React.CSSProperties,
    size?: number
}

export default function GroupMessageIcon(props: GroupMessageIconProps) {
    const {room, user, style, size} = props;
    const imageURL = !room.profilepic || room.profilepic === '' ? undefined: getImage(room.profilepic);
    return (
        <div
           
            style={style}
        >
        {
            imageURL && imageURL !== '' && 
            <Avatar 
                src={imageURL} 
                style={{
                    height: size, 
                    width: size, 
                }}
                />
        }

        {
            (!imageURL || imageURL === '') &&
            <UserIcon user={user} size={size}/>
        }
        </div>
    )
    
}
