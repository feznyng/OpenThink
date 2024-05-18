import React, { useEffect, useState } from 'react'
import { usePreloadedQuery } from 'react-relay'
import { useHistory, useParams } from 'react-router'
import { SpecialLinkParams } from '../../types/router'
import graphql from 'babel-plugin-relay/macro';
import { InviteQuery } from './__generated__/InviteQuery.graphql';
import { LinearProgress } from '@material-ui/core';


interface InviteProps {
    queryRef: any
}

export default function Invite({queryRef}: InviteProps) {
    const { validateInviteLink } = usePreloadedQuery<InviteQuery>(
        graphql`
            query InviteQuery($key: String!) {
                validateInviteLink(key: $key) {
                    spaceId
                }
            } 
        `,
        queryRef
    )

    const history = useHistory()


    useEffect(() => {
        console.log(validateInviteLink)
        if (validateInviteLink?.spaceId) {
            history.replace(`/space/${validateInviteLink.spaceId}`)
        } else {
            history.replace(`/invite-invalid`)
        }
    }, [validateInviteLink])
    
    return (
        <div>
            <LinearProgress/>
        </div>
    )
}
