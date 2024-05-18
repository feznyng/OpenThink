import React, { Suspense } from 'react'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button'
import { PersonAdd } from '@material-ui/icons'
import ConfirmInvites from './ConfirmInvites'
import InviteMenu from './InviteMenu'
import MultiPageDialog from '../Shared/MultiPageDialog'
import { InviteMenuDialogQuery } from './__generated__/InviteMenuDialogQuery.graphql';

/**
 * - get users not in space and not current user w/ query
 * - Add this to the reply button in main
 * - Add space_users for all users in user_ids
 * - Send email out to 
 */

export interface InviteMenuDialogProps {
    space?: any,
    open?: boolean,
    onClose: () => void,
    inviteUsers: (userIds: number[], emails: string[]) => void,
    excludeOptions?: string[] 
}

interface InviteMenuDialogState {
    userIds: number[],
    emails: string[],
    confirming: boolean,
}
export const INVITE_MENU_HEIGHT = 300; 

function InviteMenuDialog({space, open, excludeOptions, inviteUsers, onClose}: InviteMenuDialogProps) {
    const spaceData = useFragment(
        graphql`
            fragment InviteMenuDialogFragment on Space {
                spaceId
                
            }
        `,
        space ? space : null
    )

    const spaceId = spaceData?.spaceId

    const data = useLazyLoadQuery<InviteMenuDialogQuery>(
        graphql`
            query InviteMenuDialogQuery($spaceId: Int!, $stratified: Boolean!, $userCount: Int!, $connectionCount: Int!, $connectionCursor: String, $excludeRequested: Boolean!, $modCursor: String, $memberCursor: String) {
                space(spaceId: $spaceId) {
                    spaceId
                    ...InviteMenuFragment_space
                    ...ConfirmInvitesFragment
                }
                me {
                    ...InviteMenuFragment_user
                }
            }
        `,
        {spaceId, stratified: false, userCount: 20, connectionCount: 20, excludeRequested: true} as any
    ) 

    const [state, setState] = React.useState<InviteMenuDialogState>({
        userIds: [],
        emails: [],
        confirming: false,
    })

    const onUsersChange = (userIds: number[]) => {
        setState({
            ...state,
            userIds
        })
    }

    const pages = [
        (
            <React.Fragment>
                {
                    open && 
                    <InviteMenu
                        space={data.space}
                        user={data.me}
                        onUsersChange={onUsersChange}
                        userIds={state.userIds}
                        excludeOptions={excludeOptions}
                    />
                }
            </React.Fragment>
            
        ),
        (
            <Suspense
                fallback={<div style={{height: INVITE_MENU_HEIGHT}}/>}
            > 
                <ConfirmInvites
                    space={data.space}
                    userIds={state.userIds}
                    emails={state.emails}
                    groupIds={[]}
                    onUserSelect={onUsersChange}
                />
            </Suspense>
        )
    ]

    return (
        <MultiPageDialog
            title="Invite People"
            open={!!open}
            onClose={onClose}
            pages={pages}
            completeButton={
                <Button
                    variant='contained'
                    disabled={state.userIds.length === 0 && state.emails.length === 0}
                    color="primary"
                    endIcon={<PersonAdd/>}
                    onClick={() => inviteUsers(state.userIds, state.emails)}
                >
                    Invite
                </Button>
            }
            contentProps={{
                style: {minWidth: 600, minHeight: 500}
            }}
        />
    )
}

export default function InviteMenuDialogWrapper(props: InviteMenuDialogProps) {
    return (
        <React.Fragment>
            {
                props.open &&
                <InviteMenuDialog
                    {...props}
                />
            }
        </React.Fragment>
    )
}
