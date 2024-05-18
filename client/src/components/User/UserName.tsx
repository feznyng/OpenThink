import { TypographyProps } from '@material-ui/core'
import React from 'react'
import { useFragment } from 'react-relay'
import { user } from '../../types/user'
import Typography from '../Shared/Typography'
import graphql from 'babel-plugin-relay/macro';
import { useHistory } from 'react-router'

interface UserName {
    user: any
}

export default function UserName({user, ...props}: UserName & TypographyProps) {
    const {firstname, lastname, userId} = useFragment(
        graphql`
            fragment UserNameFragment on User {
                firstname
                lastname
                userId
            }
        `,
        user
    )

    const history = useHistory();
    return (
        <Typography
            {...props}
            onClick={() => history.push(`/profile/${userId}`)}
            hoverStyle={{textDecoration: 'underline'}} 
        >
            {firstname} {lastname} 
        </Typography>
    )
}
