import { ButtonProps } from '@material-ui/core'
import { SendRounded } from '@material-ui/icons'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import { useLazyLoadQuery } from 'react-relay'
import { useHistory } from 'react-router'
import Button from '../Shared/Button'
import { MessageButtonQuery } from './__generated__/MessageButtonQuery.graphql'

interface MessageButtonProps {
    sendMessage: () => void
}

export default function MessageButton({sendMessage, ...props}: MessageButtonProps & Partial<ButtonProps>) {
    const {me} = useLazyLoadQuery<MessageButtonQuery>(
        graphql`
            query MessageButtonQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )

    const history = useHistory()

    return (
        <Button
            {...props}
            color="secondary"
            variant="contained"
            onClick={me?.userId ? sendMessage : () => history.push('/signup')}
            startIcon={<SendRounded/>}
        >
            Message
        </Button>
    )
}
