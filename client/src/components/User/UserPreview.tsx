import React from 'react'
import graphql from 'babel-plugin-relay/macro';
import { useFragment } from 'react-relay';
import UserIcon, { UserIconProps } from './UserIcon';
import Typography from '../Shared/Typography';

interface UserPreviewProps {
    user: any,
    iconProps?: Partial<UserIconProps>
}

export default function UserPreview({iconProps, user}: UserPreviewProps) {
    const {firstname, lastname, ...data} = useFragment(
        graphql`
            fragment UserPreviewFragment on User{
                ...UserIconFragment
                firstname
                lastname
            }
        `,
        user
    )

    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            <UserIcon size={20} {...iconProps} user={data} style={{marginRight: 5}}/>
            <Typography variant="caption">{firstname} {lastname}</Typography>
        </div>
    )
}
