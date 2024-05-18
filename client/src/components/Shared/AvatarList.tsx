import { AvatarGroup } from '@material-ui/lab';
import React from 'react'
import { user } from '../../types/user'
import UserIcon from '../User/UserIconOld';

export default function AvatarList({users}: {users: user[]}) {
    return (
        <div style={{display: 'flex', alignItems: 'center', marginLeft: '5%'}}>
            {
                users.map(u => (
                    <UserIcon user={u} style={{marginLeft: '-5%'}}/>
                ))
            }
        </div>
    )
}
