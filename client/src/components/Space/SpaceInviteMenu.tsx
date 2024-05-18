import React from 'react'
import { ConnectionHandler, useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import commitInviteSpaceUsers from '../../mutations/InviteSpaceUsers';
import { MAX_USER_FETCH_COUNT } from '../../constants';
import { IconButton, Snackbar } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import InviteMenuDialog, { InviteMenuDialogProps } from '../InviteMenu/InviteMenuDialog';


interface SpaceInviteMenuProps {
    space: any,
    onClose: () => void
}

export default function SpaceInviteMenu({space, ...props}: SpaceInviteMenuProps & Partial<InviteMenuDialogProps>) {
    const {spaceId, id, ...data} = useFragment(
        graphql`
            fragment SpaceInviteMenuFragment on Space {
                id
                spaceId
                ...InviteMenuDialogFragment
            }
        `,
        space
    )

    const [state, setState] = React.useState({
        invitedUsers: false,
    })


    const inviteUsers = (userIds: number[], emails: string[]) => {
        commitInviteSpaceUsers({
            variables: {
                input: {
                    userIds,
                    spaceId
                },
                first: 50
            },
            onCompleted: () => {
                props.onClose();
                setState({...state, invitedUsers: true})
            },
            updater: (store: any) => {
                const spaceRecord = store.get(id)
                const connectionRecord = ConnectionHandler.getConnection(
                    spaceRecord,
                    'SpaceMembers_invitees',
                )

                const payload = store.getRootField('inviteUsersSpace')

                const userEdges = payload.getLinkedRecords('userEdges')
                
                if (connectionRecord && userEdges) {
                    userEdges.forEach((edge: any) => {
                        const newEdge = ConnectionHandler.buildConnectionEdge(
                            store,
                            connectionRecord,
                            edge,
                        )
                        ConnectionHandler.insertEdgeAfter(connectionRecord, newEdge as any);          
                    })
                    const currCount = spaceRecord?.getValue('numInvitees')
                    spaceRecord?.setValue((currCount as number) + userEdges.length, 'numInvitees')
                }
            }
        })
    }

    const closeSnackbar = () => setState({...state, invitedUsers: false})

    return (
        <React.Fragment>
            {
                props.open && 
                <InviteMenuDialog
                    {...props}
                    space={data}
                    inviteUsers={inviteUsers}
                    excludeOptions={['members']}
                />
            }
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={state.invitedUsers}
                autoHideDuration={6000}
                onClose={closeSnackbar}
                message="Invited people"
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={closeSnackbar}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                }
            />
        </React.Fragment>
    )
}
