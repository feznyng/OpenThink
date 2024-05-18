import { ButtonProps, Dialog, DialogContent, DialogTitle } from '@material-ui/core'
import { PersonAdd } from '@material-ui/icons'
import React, { CSSProperties, Suspense } from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import Button from '../Shared/Button'
import SpaceInviteMenu from './SpaceInviteMenu';
import PostInviteMenu from '../Post/PostInviteMenu';

interface InviteButtonProps {
    space?: any,
    post?: any,
    variant?: 'contained' | 'outlined'
}

export default function InviteButton({space, post, variant, style, ...props}: InviteButtonProps & ButtonProps) {
    const spaceData = useFragment(
        graphql`
            fragment InviteButtonFragment_space on Space {
                ...SpaceInviteMenuFragment
            }
        `,
        space ? space : null
    )

    const postData = useFragment(
        graphql`
            fragment InviteButtonFragment_post on Post {
                postId
            }
        `,
        post ? post : null
    )

    const [state, setState] = React.useState({
        inviting: false,
    })

    return (
        <React.Fragment>
            <Button
                color="primary"
                variant={variant ? variant : "contained"}
                style={style}
                {...props}
                startIcon={<PersonAdd/> }
                onClick={() => setState({...state, inviting: true})}
            >
                Invite
            </Button>
            <Suspense fallback={<div/>}>
                <React.Fragment>
                    {
                        space && 
                        <SpaceInviteMenu
                            open={state.inviting}
                            space={spaceData}
                            onClose={() => setState({...state, inviting: false})}
                        />
                    }
                    {
                        post && state.inviting && 
                        <PostInviteMenu
                            open={state.inviting}
                            post={postData}
                            onClose={() => setState({...state, inviting: false})}
                        />
                    }
                </React.Fragment>
            </Suspense>
        </React.Fragment>
        
    )
}
