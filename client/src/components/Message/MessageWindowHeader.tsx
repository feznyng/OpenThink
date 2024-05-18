import { IconButton, Menu, TextField, Typography } from '@material-ui/core';
import { People } from '@material-ui/icons';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { usePaginationFragment } from 'react-relay';
import { message, room } from '../../types/message';
import PinIcon from '../Shared/PinIcon';
import MessageCard from './MessageCard';

interface MessageWindowHeaderProps {
    creatingRoom: boolean,
    newRoom: room,
    room: any,
    toggleUsers: () => void
}

interface MessageWindowHeaderState {
    editingName: boolean,
    hoverName: boolean,
    editedName: string,
    pinnedAnchor: Element | null,
    addUserAnchor: Element | null,
}

export default function MessageWindowHeader({
    creatingRoom,
    newRoom,
    room,
    toggleUsers
}: MessageWindowHeaderProps) {

    const { data } = usePaginationFragment(    
        graphql`      
            fragment MessageWindowHeader_pinned_messages on Room      
            @refetchable(queryName: "MessageWindowHeaderPaginationQuery") {     
                roomId     
                name
                dm
                spaceId
                ...RoomIcon
                users(first: $userCount, after: $userCursor) @include(if: $dm){ 
                    edges {
                        node {
                            user {
                                firstname
                            }
                        }
                    }
                }
                pinnedMessages(first: $pinnedMessageCount, after: $pinnedMessageCursor) @connection(key: "MessageWindowHeader_pinnedMessages") {       
                    __id   
                    edges {
                        node {
                            ...MessageCard_fragment
                            id
                            messageId
                            createdBy
                            createdAt
                            body
                        }
                    }
                }
            }  
        `,
        room
    );


    const [state, setState] = React.useState<MessageWindowHeaderState>({
        editingName: false,
        hoverName: false,
        editedName: '',
        pinnedAnchor: null,
        addUserAnchor: null
    })

    const nameRef = React.useRef();

    const currentRoom = {name: '', space_id: 26, users: []}

    const changeRoomName = () => {
        
    }

    const openPinnedMessages = (e: any) => {
        setState({...state, pinnedAnchor: e.currentTarget})
    }

    const actualName = data ? data.name : '';

    const pinnedMessages: message[] = data && data.pinnedMessages ? data.pinnedMessages.edges.map((e: any) => e.node) : []

    return (
        <div style={{width: '100%', height: '100%'}}>
            <div style={{float: 'left', height: '100%'}}>
                <div style={{marginTop: 10}}>
                    {
                        state.editingName ?
                        <TextField
                            InputProps={{
                                disableUnderline: !state.hoverName && !state.editingName,
                                ref: nameRef,
                            }}
                            fullWidth
                            onMouseEnter={() => setState({...state, hoverName: true})}
                            onMouseLeave={() => setState({...state, hoverName: false})}
                            onClick={() => setState({...state, editingName: true})}
                            placeholder={"Room Name"}
                            onChange={(e) => setState({...state, editedName: e.target.value})}
                            onBlur={changeRoomName}
                            value={currentRoom ? currentRoom.name: ''}
                            disabled={!state.editingName}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    changeRoomName();
                                }
                            }}
                            style={{textTransform: 'none'}}
                        />
                        :
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Typography style={{fontSize: 18, marginLeft: 5}} variant="h6">
                               {data.spaceId && '#'} {actualName}
                            </Typography>
                        </div>
                        
                    }
                </div>
            </div>
            {
                !creatingRoom && 
                <div style={{float: 'right', marginBottom: -2, display: 'flex', alignItems: 'center', height: '100%'}}>
                        <IconButton 
                            onClick={openPinnedMessages}
                        >
                            <PinIcon/>
                        </IconButton>
                        <IconButton  onClick={(e) => toggleUsers()}>
                            <People/>
                        </IconButton>
                    <Menu
                        open={!!(state.pinnedAnchor)}
                        anchorEl={state.pinnedAnchor}
                        onClose={() => setState({...state, pinnedAnchor: null})}
                    >
                        <div style={{minWidth: 400, padding: 20}}>
                            {
                                pinnedMessages.length > 0 && pinnedMessages.map(m => (
                                    <MessageCard
                                        data={m}
                                    />
                                ))
                            }
                            {
                                pinnedMessages.length === 0 &&
                                <Typography>
                                    No Pinned Messages
                                </Typography>
                            }
                        </div>
                    </Menu>
                </div>
            }
            
        </div>
    )
}
