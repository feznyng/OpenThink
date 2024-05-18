import React from 'react'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import UserListItem from '../User/UserListItem';
import { INVITE_MENU_HEIGHT } from './InviteMenuDialog';
import Typography from '../Shared/Typography';
import { Chip, TypographyProps } from '@material-ui/core';
import { ConfirmInvitesQuery } from './__generated__/ConfirmInvitesQuery.graphql';
import { toggleArrayElement } from '../../utils/arrayutils';

interface ConfirmInvitesProps{
    userIds: number[],
    groupIds: number[],
    emails?: string[],
    onUserSelect: (userIds: number[]) => void,
    allSpaceUsers?: boolean
    space: any,
}

const typographyProps: TypographyProps = {
    variant: "subtitle2",
    style: {marginTop: 15}
}

export default function ConfirmInvites({userIds, emails, space, allSpaceUsers, onUserSelect}: ConfirmInvitesProps) {

    const currSpace = useFragment(
        graphql`
            fragment ConfirmInvitesFragment on Space {
                project
            }
        `,
        space ? space : null
    )

    const {usersByIds} = useLazyLoadQuery<ConfirmInvitesQuery>(
        graphql`
            query ConfirmInvitesQuery($userIds: [ID!]!) {
                usersByIds(userIds: $userIds) {
                    userId
                    ...UserListItemFragment
                }
            }
        `,
        {userIds: userIds.map(id => id.toString())}
    )

    const selectUser = (userId: number) => {
        onUserSelect(toggleArrayElement(userId, userIds))
    }

    return (
        <div style={{height: INVITE_MENU_HEIGHT}}>
            {
                usersByIds && (usersByIds.length > 0 || (emails && emails.length > 0)) ?
                <div>
                    {
                        allSpaceUsers && 
                        <Typography
                            {...typographyProps}
                        >
                            We'll send invites to everyone in this {currSpace?.project ? 'project' : 'group'}.
                        </Typography>
                    }
                    {
                        usersByIds.length > 0 &&
                        <div>
                            <Typography
                                {...typographyProps}
                            >
                                We'll {allSpaceUsers ? 'also' : ''} send invites to the following users. 
                            </Typography>
                            {    
                                usersByIds.map((u: any) => (
                                    <UserListItem
                                        user={u}
                                        onSelect={selectUser}
                                        checked={userIds.includes(u.userId)}
                                    />
                                ))
                            }
                        </div>
                    }
                    {
                        emails && emails.length > 0 &&
                        <div style={{marginTop: 20}}>
                            <Typography
                                {...typographyProps}
                            >
                                We'll send invites to the following groups.
                            </Typography>
                            {
                                emails.map(e => <Chip style={{marginRight: 5, marginBottom: 5}} label={e}/>)
                            }
                        </div>
                    }
                    {
                        emails && emails.length > 0 &&
                        <div style={{marginTop: 20}}>
                            <Typography
                                {...typographyProps}
                            >
                                We'll send invites to the following email addresses. 
                            </Typography>
                            {
                                emails.map(e => <Chip style={{marginRight: 5, marginBottom: 5}} label={e}/>)
                            }
                        </div>
                    }
                </div>
                :
                <Typography
                    {...typographyProps}
                >
                    No users to invite.
                </Typography>
            }
        </div>
    )
}
