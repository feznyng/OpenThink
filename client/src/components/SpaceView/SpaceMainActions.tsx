import React from 'react'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import SpaceMessageButton from '../Space/SpaceMessageButton'
import JoinButton from '../Space/JoinButton'
import { IconButton, Menu, MenuItem, Snackbar } from '@material-ui/core'
import { Close, MoreVert, Reply, Settings } from '@material-ui/icons'
import { useHistory } from 'react-router'
import SpaceInviteMenu from '../Space/SpaceInviteMenu'

interface SpaceMainActionsProps {
    space: any
}

interface SpaceMainActionsState {
    anchorEl: null | Element,
    open?: boolean,
    inviting?: boolean
}

export default function SpaceMainActions({space}: SpaceMainActionsProps) {
    const {currUser, spaceId, project, permissions, ...data} = useFragment(
        graphql`
            fragment SpaceMainActionsFragment on Space{
                ...SpaceMessageButtonFragment
                ...JoinButtonFragment
                ...SpaceInviteMenuFragment
                currUser {
                    type
                    accepted
                    spaceUserId
                    requestType
                }
                spaceId
                project
            }
        `,
        space
    )

    const [state, setState] = React.useState<SpaceMainActionsState>({
        anchorEl: null,
        inviting: false,
    })

    const history = useHistory()


    const shareSpace = () => {
        setState({...state, open: true, anchorEl: null})
        navigator.clipboard.writeText(`${window.location.origin}/space/${data.spaceId}`)
    }

    const invitePeople = () => {
        setState({...state, inviting: true, anchorEl: null})
    }


    return (
        <div style={{display: 'flex', alignItems: 'center'}}>
            
            <SpaceMessageButton
                spaceData={data}
                style={{marginRight: 5}}
            />
            <JoinButton
                space={data}
            />
            {
                currUser && 
                <React.Fragment>
                    
                    <IconButton 
                        onClick={(e) => {
                            setState({...state, anchorEl: e.currentTarget})
                        }}
                    >
                        <Reply style={{transform: 'scaleX(-1)'}}/>
                    </IconButton>
                    {
                        (currUser.accepted || currUser.acceptedAs) && 
                        <IconButton 
                            onClick={() => {
                                setState({...state, anchorEl: null})
                                history.push(`/space/${spaceId}/settings`)
                            }}
                        >
                            <Settings/>
                        </IconButton>
                    }
                    
                </React.Fragment>
            }

            <Menu 
                open={Boolean(state.anchorEl)} 
                anchorEl={state.anchorEl} 
                onClose={() => setState({...state, anchorEl: null})}
            >
                <MenuItem 
                    onClick={shareSpace}
                >
                    Share
                </MenuItem>
                <MenuItem 
                    onClick={invitePeople}
                >
                    Invite
                </MenuItem>
            </Menu>
                    
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={state.open}
                autoHideDuration={2000}
                onClose={() => setState({...state, open: false})}
                message={`${project ? 'Project' : 'Group'} URL copied to clipboard`}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => setState({...state, open: false})}>
                        <Close fontSize="small" />
                    </IconButton>
                }
            />
            <SpaceInviteMenu
                open={!!state.inviting}
                space={data}
                onClose={() => setState({...state, inviting: false})}
            />
        </div>
    )
}
