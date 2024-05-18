import { ButtonProps } from '@material-ui/core'
import { SendRounded } from '@material-ui/icons'
import React from 'react'
import { useHistory } from 'react-router'
import Button from '../Shared/Button';
import graphql from 'babel-plugin-relay/macro';
import { useMutation, usePreloadedQuery, useFragment } from 'react-relay';
import MessageButton from '../Message/MessageButton';
import { fetchQuery } from '../../utils/graphqlutils';
import {MAX_DM_USERS} from '../Message/DMCreator';
import { user } from '../../types/user';
export interface SpaceMessageButtonProps {
    style?: React.CSSProperties,
    spaceData: any,
}

export default function SpaceMessageButton({type, spaceData, ...props}: SpaceMessageButtonProps & ButtonProps) {
    const {spaceId, currUser} = useFragment(
        graphql`      
            fragment SpaceMessageButtonFragment on Space {   
                spaceId
                currUser {
                    spaceUserId
                }
            }
        `,    
        spaceData
    )

    const history = useHistory();

    const sendMessage = () => {
        currUser?.spaceUserId ? 
        history.push(`/messages/${spaceId}`)
        :
        fetchQuery(
            graphql`
                query SpaceMessageButtonQuery ($spaceId: Int!, $limit: Int!) {
                    space(spaceId: $spaceId) {
                        spaceId
                        moderators(first: $limit) {
                            edges {
                                node {
                                    userId
                                    spaceUser {
                                        spaceUserId
                                    }
                                }
                            }
                        }
                    }
                }
            `,
            {
                spaceId,
                limit: MAX_DM_USERS
            }
        ).subscribe({
            next: ({space}: any) => {
                const leads = space.moderators.edges.map((e: any) => e.node).reduce((acc: string, l: user) => `${l.userId},${acc}`, '');
                history.push(`/messages/@me/create?userIds=[${leads.substring(0, leads.length - 1)}]`)
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
