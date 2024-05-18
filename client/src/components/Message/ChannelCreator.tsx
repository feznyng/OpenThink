import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@material-ui/core';
import { Add, Close } from '@material-ui/icons';
import React from 'react';
import { ConnectionHandler } from 'react-relay';
import commitCreateChannel from '../../mutations/CreateChannel';
import { clientId } from '../../Store';
import { room } from '../../types/message';
import { user } from '../../types/user';
import Button from '../Shared/Button';
import RoomGeneralSettings from './RoomGeneralSettings';

interface ChannelCreatorProps {
    initialValue?: room,
    spaceId: number,
    parentID?: string,
    open?: boolean,
    onClose: () => void,
    index?: number,
    connectionId?: string
}

interface ChannelCreatorState {
    creatingRoom: boolean,
    newChannel: {
        name: string,
        type: string,
        space_id?: number,
        visibility: string
    },
    createPage: number,
    users: user[],
    anchorEl: HTMLElement | null,
    duplicateName?: boolean,
    creatingCategory?: boolean,
    creating?: boolean
}

export default function ChannelCreator({open, onClose, connectionId, parentID, initialValue, spaceId, index}: ChannelCreatorProps) {
    const original_state = {
        creatingRoom: false,
        newChannel: {
            name: '',
            type: 'text',
            spaceId,
            visibility: 'internal',
            index
        },
        createPage: 0,
        users: [],
        anchorEl: null,
        creating: false,
    }

    const [state, setState] = React.useState<ChannelCreatorState>({
        ...original_state
    })

    const resetCreatorState = () => {
        setState({
            ...state,
            ...original_state,
            anchorEl: null
        })
        onClose()
    }

    React.useEffect(() => {
        setState({...state, ...initialValue})
    }, [initialValue])


    const createChannel = () => {
        setState({...state, creating: true}); 
        commitCreateChannel({
            variables: {
                input: {
                    ...state.newChannel,
                    clientId,
                },
                connections: connectionId ? [connectionId] : []
            },
            updater: (store: any) => {
                if (parentID) {
                    const spaceRecord = store.get(parentID)

                    const connection = ConnectionHandler.getConnection(
                        spaceRecord,
                        'ChannelList_rooms',
                    );

                    if (connection) {
                        const payload = store.getRootField('createRoom')
                        const edge = payload.getLinkedRecord('roomEdge')
                        ConnectionHandler.insertEdgeAfter(
                            connection,
                            edge,
                        )
                    }
                }
                
            },
            onCompleted: () => {
                resetCreatorState()
                onClose()
            },
            onError: (err: string) => {
                resetCreatorState()
            }
        })
    }

    return (
        <div>
            <Dialog
                open={!!open}
                onClose={resetCreatorState}
            >
                <DialogTitle
                    disableTypography
                >
                    <Typography variant="h5" style={{float: 'left'}}>
                        Create Channel
                    </Typography>
                    
                    <IconButton style={{float: 'right', marginTop: -10}} onClick={resetCreatorState}>
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent style={{marginTop: -10, height: 600, width: 500}}>
                    <RoomGeneralSettings
                        room={state.newChannel}
                        onChange={(newChannel: any) => setState({...state, newChannel})}
                    />
                </DialogContent>
                <DialogActions>
                    {
                        state.createPage === 0 ? 
                        <Button onClick={resetCreatorState}>
                            Cancel
                        </Button>
                        :
                        <Button onClick={() => setState({...state, createPage: state.createPage === 0 ? 1 : 0})}>
                            Back
                        </Button>
                    }
                    
                    {
                        <Button
                            variant="contained"
                            color="primary"
                            style={{color: 'white', marginLeft: 10}}
                            onClick={createChannel}
                            disabled={state.newChannel.name === ''}
                            startIcon={!state.creating && <Add/>}
                        >
                            {state.creating ? <CircularProgress size={20} color="secondary"/> : 'Create Channel'}
                        </Button>
                    }
                </DialogActions>
            </Dialog>
        </div>
    )
}

/*

            
*/