import React from 'react'
import { IconButton, Snackbar, Tooltip } from '@material-ui/core'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Close, Reply, Share } from '@material-ui/icons';
import Button from '../Shared/Button';
import { useParams } from 'react-router';

interface PostShareButtonProps {
    post: any,
    style?: React.CSSProperties
}

export default function PostShareButton({post, ...props}: PostShareButtonProps) {
    const {postId, ...data} = useFragment(
        graphql`
            fragment PostShareButtonFragment on Post {
                postId
            }
        `,
        post
    )

    const [state, setState] = React.useState({
        open: false,
    })

    const {spaceID} = useParams<any>()

    const close = () => setState({...state, open: false})
    const sharePost = () => {
        setState({...state, open: true})
        navigator.clipboard.writeText(`${window.location.origin}${spaceID ? `/space/${spaceID}` : ''}/post/${postId}`)
    }

    return (
        <React.Fragment>
            <Tooltip title="Share">
                <span {...props}>
                    <IconButton
                        size="small"
                        onClick={sharePost}
                        color="inherit"
                    >
                        <Reply style={{transform: 'scaleX(-1)', fontSize: 20}} />
                    </IconButton>
                </span>
            </Tooltip>
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              open={state.open}
              autoHideDuration={4000}
              onClose={close}
              message="Link copied to clipboard"
              action={
                <React.Fragment>
                  <IconButton size="small" color="inherit" onClick={close}>
                    <Close fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
        </React.Fragment>
    )
}
