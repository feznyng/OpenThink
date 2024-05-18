import { ButtonProps } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment } from 'react-relay';
import { useHistory } from 'react-router';
import { fetchQuery } from '../../utils/graphqlutils';
import MessageButton from './MessageButton';

export interface UserMessageButtonProps {
    style?: React.CSSProperties,
    userData: any,
    meData: any
}

export default function UserMessageButton({type, userData, meData, ...props}: UserMessageButtonProps & Partial<ButtonProps>) {

    const user = useFragment(
        graphql`      
            fragment UserMessageButtonFragment_user on User {   
                userId
            }
        `,    
        userData
    )

    const me = useFragment(
        graphql`      
            fragment UserMessageButtonFragment_me on User {   
                userId
            }
        `,    
        meData
    )
   
    const [state, setState] = React.useState({
        open: false
    })

    const history = useHistory();

    const sendMessage = () => {
        fetchQuery(
            graphql`
                query UserMessageButtonQuery ($userIds: [ID!]!) {
                    roomByUsers(userIds: $userIds, unarchive: true) {
                        roomId
                    }
                }
            `,
            {
                userIds: [me.userId, user.userId]
            }
        ).subscribe({
            next: ({roomByUsers}: any) => {

                console.log('starting here', roomByUsers)
                if (roomByUsers?.roomId) {
                    console.log('option 1')
                    history.push(`/messages/@me/${roomByUsers.roomId}`)
                } else {
                    console.log('option 2')
                    history.push(`/messages/@me/create?userIds=[${user.userId}]`)
                }

                console.log('ending here', roomByUsers)

            },
            error: (error: any) => console.log(error)
        })
    }

    return (
        <MessageButton
            sendMessage={sendMessage}
            {...props}
        />
    )
}
