import { IconButton, Snackbar } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React from 'react';
import { usePreloadedQuery } from 'react-relay';
import InviteEveryone from '../InviteMenu/InviteEveryone';
import InviteMenuDialog, { InviteMenuDialogProps } from '../InviteMenu/InviteMenuDialog';
import Dialog from '../Shared/Dialog';

interface PostInviteMenuProps {
    post: any,
    onClose: () => void
}

export default function PostInviteMenu({post, onClose, ...props}: PostInviteMenuProps & Partial<InviteMenuDialogProps>) {
    const [state, setState] = React.useState({
        invitedUsers: false,
        userIds: []
    })
    const closeSnackbar = () => setState({...state, invitedUsers: false})

    const inviteUsers = () => {

    }

    return (
        <div>
            {
                props.open && 
                <Dialog open onClose={onClose}>
                </Dialog>
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
        </div>
    )
}
