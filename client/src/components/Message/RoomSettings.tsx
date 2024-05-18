import { Card, CircularProgress, Typography } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useFragment, useMutation } from 'react-relay';
import Settings from '../../pages/Settings';
import { room } from '../../types/message';
import Button from '../Shared/Button';
import RoomGeneralSettings from './RoomGeneralSettings';
import { RoomSettings_fragment$key } from './__generated__/RoomSettings_fragment.graphql';



const settingsPages = [
    {
        title: 'General',
        type: 'general',
        icon: <Settings/>
    },
    {
        title: 'General',
        type: 'general',
        icon: <Settings/>
    },
    {
        title: 'General',
        type: 'general',
        icon: <Settings/>
    },
]

interface RoomSettingsState {
    updatedRoom: room,
}
interface RoomSettingsProps {
    data: RoomSettings_fragment$key,
    onClose: () => void
}

export default function RoomSettings({data, onClose}: RoomSettingsProps) {
    const room = useFragment(    
        graphql`      
            fragment RoomSettings_fragment on Room {     
                name
                id
                roomId
                description
                type
                visibility
                currUser {
                    id
                    roomUserId
                    unread
                    unreadNum
                }
            }    
        `,
        data
    );

    const [state, setState] = React.useState({
        updatedRoom: room as room,
        saving: false,
        edited: false,
    })

    const [commitUpdateRoom, isRoomUpdateInFlight] = useMutation(
        graphql`
            mutation RoomSettingsUpdateMutation($input: UpdateRoomInput!) {
                updateRoom(input: $input) {
                    room {            
                        id
                        name
                        description
                        type
                        visibility
                    }
                }
            }
        `
    );

    const updateChannel = () => {
        const {roomId, name, description, type, visibility} = state.updatedRoom
        commitUpdateRoom({
            variables: {
                input: {
                    roomId, 
                    name, 
                    description, 
                    type, 
                    visibility
                },
            }
        })
        setState({
            ...state,
            edited: false,
        })
        onClose();
    }

    return (
        <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{maxWidth: 700, width: '100%'}}>
                <RoomGeneralSettings
                    room={state.updatedRoom as room}
                    onChange={updatedRoom => setState({...state, updatedRoom, edited: true})}
                    editing
                />
            </div>
            {
                state.edited && 
                <Card style={{position: 'fixed', bottom: 0, width: '100%', padding: 10, minHeight: 50, display: 'flex', alignItems: 'center'}}>
                    <Typography style={{marginLeft: 10}}>
                        You have unsaved changes. 
                    </Typography>
                    <div style={{position: 'absolute', bottom: 5, right: 5}}>
                        <Button
                            onClick={() => setState({...state, updatedRoom: room as room, edited: false})}
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={updateChannel}>
                            {isRoomUpdateInFlight ? <CircularProgress size={30} style={{zIndex: 1000}} color='secondary'/> : 'Save'}
                        </Button>
                    </div>
                </Card>
            }
            
        </div>
    )
}
