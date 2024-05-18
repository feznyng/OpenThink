import { KeyboardArrowDown } from '@material-ui/icons';
import React, { CSSProperties, Fragment, useState } from 'react';
import Button from '../Shared/Button';
import { useFragment, useMutation } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { ButtonProps, Menu, MenuItem } from '@material-ui/core';
import { Anchor } from './PostContentEditor';
import { RSVPButtonMutation } from './__generated__/RSVPButtonMutation.graphql';

const types = [
    'Going',
    'Not Going',
    'Maybe'
]

interface RSVPButtonProps {
    postUser: any
}

export default function RSVPButton({postUser, ...props}: Partial<ButtonProps> & RSVPButtonProps) {
    const {type, postId, userId} = useFragment(
        graphql`
            fragment RSVPButtonFragment on PostUser {
                id
                type
                userId
                postId
            }
        `,
        postUser
    )

    const [commitRSVP] = useMutation<RSVPButtonMutation>(
        graphql`
            mutation RSVPButtonMutation($input: RsvpPostInput!) {
                rsvpPost(input: $input) {
                    id
                    type
                }
            }
        `
    )

    const [state, setState] = useState<{anchorEl: Anchor}>({
        anchorEl: null
    })

    const changeType = (type: string) => {
        setState({...state, anchorEl: null})
        commitRSVP({
            variables: {
                input: {
                    postId,
                    type
                }
            }
        })
    }

    return (
        <Fragment>
            <Button
                variant='contained'
                color='primary'
                {...props}
                endIcon={
                    <KeyboardArrowDown/>
                }
                onClick={e => setState({...state, anchorEl: e.currentTarget})}
            >
                {type}
            </Button>
            <Menu open={!!state.anchorEl} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                {
                    types.map(type => (
                        <MenuItem onClick={() => changeType(type)}>
                            {type}
                        </MenuItem>
                    ))
                }
            </Menu>
        </Fragment>
    );
}
