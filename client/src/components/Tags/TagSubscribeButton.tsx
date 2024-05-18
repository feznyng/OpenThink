import React from 'react'
import { ButtonProps } from '@material-ui/core'
import Button from '../Shared/Button'
import { useFragment, useRefetchableFragment } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { AddAlert } from '@material-ui/icons';
import commitToggleSubscribeTag from '../../mutations/ToggleSubscribeTag';

interface TagSubscribeButtonProps {
    query: any,
    me: any,
    tag: string
}

export default function TagSubscribeButton({query, me, tag, ...props}: TagSubscribeButtonProps & ButtonProps) {
    const [data, refetch] = useRefetchableFragment(
        graphql`
            fragment TagSubscribeButtonFragment on Query 
            @refetchable(queryName: "TagSubscribeButtonQuery") {
                userTag(tag: $tag) {
                    id
                    userId
                    userTagId
                    tag
                }
            }
        `,
        query
    )

    const user = useFragment(
        graphql`
            fragment TagSubscribeButtonFragment_me on User {
                userId
            }
        `,
        me ? me : null
    )

    const [loading, setLoading] = React.useState(false);

    const {userTag} = data;

    const toggleSubscribeTag = () => {
        if (user?.userId) {
            setLoading(true)
            commitToggleSubscribeTag({
                variables: {
                    input: {
                        tag
                    }
                },
                onCompleted: () => setLoading(false),
                onError: () => setLoading(false)
            })
        }
        
    }

    const subscribed = !!userTag.userTagId

    return (
        <Button
            {...props}
            variant={subscribed ? 'contained' : 'outlined'}
            color="primary"
            startIcon={subscribed ? undefined : <AddAlert/>}
            onClick={toggleSubscribeTag}
            loading={loading}
        >
            {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </Button>
    )
}
