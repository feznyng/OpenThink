import React from 'react'
import { room } from '../../types/message';
import { Menu as MuiMenu, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItemText, ListItemTextProps, MenuItem, Paper } from '@material-ui/core';
import { Menu } from 'react-contexify';
import Button from '../Shared/Button';
import RoomSettings from './RoomSettings';
import { RoomSettings_fragment$key } from './__generated__/RoomSettings_fragment.graphql';
import commitDeleteChannel from '../../mutations/DeleteChannel';
import commitReadRoom from '../../mutations/ReadRoom';
import Dialog from '../Shared/Dialog';
import ChannelCreator from './ChannelCreator';
import { Anchor } from '../Post/PostContentEditor';

export const MENU_ID = 'blahblah';

interface ChannelListOptionsMenuProps {
    connectionId: string,
    room: room | null,
    variant?: 'click' | 'context',
    anchorEl?: Anchor,
    onClose?: () => void,
    spaceId: number,
    index: number,
    disableCreate?: boolean,
}

interface ChannelListOptionsMenuState {
    deleteOpen: boolean,
    channelSettings: boolean,
    mutePopover: boolean, 
    notificationPopover: boolean,
    open: boolean
}
export default function ChannelListOptionsMenu({index, spaceId, anchorEl, onClose, disableCreate, variant, room, connectionId}: ChannelListOptionsMenuProps) {
    const [state, setState] = React.useState<ChannelListOptionsMenuState>({
        deleteOpen: false,
        channelSettings: false,
        mutePopover: false, 
        notificationPopover: false,
        open: false
    })

    variant = variant ? variant : 'context'

    const readRoom = () => {
        if (room) {
            commitReadRoom({
                variables: {
                    input: {
                        roomId: room.roomId,
                        spaceId: room.spaceId,
                    },
                }
            })
        }
    }

    const deleteChannel = () => {
        setState({...state, deleteOpen: false})
        console.log(room)
        commitDeleteChannel({
            variables: {
                input: {
                    roomId: room!!.id
                },
                connections: connectionId ? [connectionId] : []
            }
        })
    }

    const actions: {name: string, onClick: () => void, textProps?: ListItemTextProps}[] = []

    if (!disableCreate) {
        actions.push(
            {
                name: 'Create Text Channel',
                onClick: () => setState({...state, open: true})
            },
        )
    }

    if (room) {
        actions.unshift(
            {
                name: 'Mark as Read',
                onClick: () => readRoom()
            },
            {
                name: 'Edit Channel',
                onClick: () => setState({...state, channelSettings: true})
            },
            {
                name: 'Delete Channel',
                onClick: () => setState({...state, deleteOpen: true}),
                textProps: {style: {color: 'red'}}
            },
        )
    }

    const menuContent = actions.map(({name, onClick, textProps}) => (
        <MenuItem 
            onClick={(e) => {onClick(); onClose && onClose()}}
        >
            <ListItemText
                {...textProps}
                primary={name}
            />
        </MenuItem>
    ))
    return (
        <div>
            {
                variant === 'context' ?
                <Menu id={MENU_ID} style={{padding: 0}} animation={false} onHidden={() => setState({...state, mutePopover: false, notificationPopover: false})}>
                    <Paper style={{height: '100%', boxShadow: 'none'}}>
                        {menuContent}
                    </Paper>
                </Menu>
                :
                <MuiMenu open={!!anchorEl} anchorEl={anchorEl} onClose={onClose}>
                    {menuContent}
                </MuiMenu>
            }
            
            <Dialog
                onClose={() => setState({...state, deleteOpen: false})}
                open={state.deleteOpen}
            >
                 <DialogTitle>
                    Delete # {room?.name}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete #{room?.name}? This cannot be undone.
                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={() => setState({...state, deleteOpen: false})}>
                            Cancel
                        </Button>
                        <Button style={{color: 'white', backgroundColor: 'red'}} onClick={deleteChannel} variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog open={state.channelSettings} onClose={() => setState({...state, channelSettings: false})} fullScreen>
                <DialogTitle>
                    # {room?.name} Settings
                </DialogTitle>
                {
                    room && state.channelSettings && 
                    <RoomSettings
                        data={room as RoomSettings_fragment$key}
                        onClose={() => setState({...state, channelSettings: false})}
                    />
                }
                <div style={{height: 100, width: '100%'}}/>
            </Dialog>
            <ChannelCreator
                spaceId={spaceId}
                open={state.open}
                index={index}
                onClose={() => setState({...state, open: false})}
            />
        </div>
    )
}
