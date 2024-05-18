import { Chat } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import React, { Fragment } from 'react';
import { useFragment } from 'react-relay';
import ChannelCreator from '../Message/ChannelCreator';
import Button from '../Shared/Button';

interface CreateSpaceChannelButtonProps {
    space: any,
    connectionId?: string
}

export default function CreateSpaceChannelButton({space, connectionId}: CreateSpaceChannelButtonProps) {
    const {spaceId, numRooms} = useFragment(
        graphql`
            fragment CreateSpaceChannelButtonFragment on Space {
                spaceId
                numRooms
            }
        `,
        space
    )
    
    const [state, setState] = React.useState({
        open: false
    })

    return (
        <Fragment>
            <Button 
                color="secondary" 
                variant="contained" 
                onClick={() => setState({...state, open: true})} 
                startIcon={<Chat/>}
            >
                Create
            </Button>
            <ChannelCreator
                spaceId={spaceId}
                open={state.open}
                connectionId={connectionId}
                index={numRooms}
                onClose={() => setState({...state, open: false})}
            />
        </Fragment>
    )
}
