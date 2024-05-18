import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, ListItemText, MenuItem, Paper } from '@material-ui/core';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { Menu, TriggerEvent, useContextMenu } from 'react-contexify';
import { useDispatch, useSelector } from 'react-redux';
import { usePaginationFragment } from 'react-relay';
import { useHistory, useParams } from 'react-router';
import { openCreateChannelDialog } from '../../actions/messageActions';
import commitDeleteChannel from '../../mutations/DeleteChannel';
import commitReadRoom from '../../mutations/ReadRoom';
import { RootState } from '../../Store';
import { userDmSubscribe } from '../../subscriptions/UserDMSubscription';
import { room } from '../../types/message';
import Button from '../Shared/Button';
import ChannelListItem from './ChannelListItem';
import RoomSettings from './RoomSettings';
import { RoomSettings_fragment$key } from './__generated__/RoomSettings_fragment.graphql';

const MENU_ID = 'blahblah';
let subscribed: any = null;

interface DirectMessagesListState {
    deleteOpen: boolean,
    channelSettings: boolean,
    mutePopover: boolean, 
    notificationPopover: boolean,
    roomContext: room | null
}

export default function DirectMessagesList({me}: {me: any}) {
    const [state, setState] = React.useState<DirectMessagesListState>({
        deleteOpen: false,
        channelSettings: false,
        mutePopover: false, 
        notificationPopover: false,
        roomContext: null
    })

    const {data, hasNext, hasPrevious, loadNext, loadPrevious, isLoadingNext} = usePaginationFragment(    
        graphql`
            fragment DirectMessagesList_rooms on User      
                @refetchable(queryName: "DirectMessagesListPaginationQuery") {  
                __id   
                id
                userId
                lastRoomId
                directMessages(first: $roomCount, after: $roomCursor) @connection(key: "DirectMessagesList_directMessages") {
                    __id
                    edges {
                        node {
                            ...ChannelListItem
                            ...RoomSettings_fragment
                            roomId
                            spaceId
                            name
                            lastMessageAt
                            id
                            currUser {
                                id
                                roomUserId
                                unread
                                unreadNum
                            }
                        }
                    }
                }
            }  
        `,
        me
    )
    
    const history = useHistory();
    const dispatch = useDispatch();
    const rooms: any[] = (data && data.directMessages) ? data.directMessages.edges!!.map((e: any) => e.node) : []
    const connectionID = data?.directMessages?.__id;

    const user_graphql_id = data?.id;
    
    const deleteChannel = () => {
        setState({...state, deleteOpen: false})
        commitDeleteChannel({
            variables: {
                input: {
                    roomId: state.roomContext!!.id
                },
                connections: [connectionID]
            }
        })
    }

    const {
        roomID,
    } = useParams<any>();

    
    const onClick = (r: room) => {
        history.replace(`/messages/@me/${r.roomId}`);
    }

    const readRoom = (r: room) => {
        commitReadRoom({
            variables: {
                input: {
                    roomId: r.roomId
                },
            }
        });
    }

    const { show } = useContextMenu({
        id: MENU_ID,
    });

    function handleContextMenu(event: TriggerEvent, room: room){
        event.preventDefault();
        show(event, {
          props: {
              key: 'value'
          }
        });
        setState({
            ...state,
            roomContext: room
        })
    }

    React.useEffect(() => {
        if (roomID && roomID !== 'create' && (rooms.length === 0 || !rooms.find(r => r.roomId.toString() === roomID))) {
            history.replace(`/messages/@me/create`)
        } else {
            if (!roomID && rooms.length > 0 && !rooms[0].spaceId) {
                if (data?.lastRoomId && rooms.find(r => r.roomId === data.lastRoomId)) {
                    history.replace(`/messages/@me/${data.lastRoomId}`)
                }
            }
        }
        
    }, [rooms])

    React.useEffect(() => {
        if (subscribed) {
            subscribed.dispose();
        }
        subscribed = userDmSubscribe(user_graphql_id, {userId: parseInt(data.userId)})
        return () => {
            if (subscribed) {
                subscribed.dispose();
            }
        }
    }, [])

    return (
        <div>
            <div style={{marginTop: 10}}>
                {
                    [...rooms].sort((r1, r2) => (new Date(r2.lastMessageAt) as any) - (new Date(r1.lastMessageAt) as any)).map(r => (
                        <span
                            key={r.roomId}
                            onContextMenu={(e) => handleContextMenu(e, r)}
                        >
                            <ChannelListItem
                                data={r}
                                onClick={onClick}
                                selected={r.roomId.toString() === roomID}
                                dm
                            />
                        </span>
                        
                    ))
                }
            </div>
            <Menu id={MENU_ID} style={{padding: 0}} animation={false} onHidden={() => setState({...state, mutePopover: false, notificationPopover: false})}>
                <Paper style={{height: '100%', boxShadow: 'none'}}>
                    <MenuItem onClick={() => readRoom(state.roomContext!!)}>
                        <ListItemText
                            primary="Mark as Read"
                        />
                    </MenuItem>
                    
                    {
                        /* 
                        <Divider/>
                        {
                        (state.roomContext && state.roomContext.muted) ? 
                        <MenuItem
                            aria-haspopup="true"
                            onClick={() => {}}
                        >
                            <ListItemText
                                primary="Unmute Channel"
                                secondary={`Muted until Todo`}
                            />
                        </MenuItem>
                        :
                        <MenuItem
                            ref={mutePopoverAnchor}
                            aria-owns="mouse-over-popover"
                            aria-haspopup="true"
                            onMouseEnter={mutePopoverEnter}
                            onMouseLeave={mutePopoverLeave}
                            onClick={() => {}}
                        >
                            <ListItemText
                                primary="Mute Channel"
                            />
                        </MenuItem>
                    }
                    
                    <Popover
                        className={classes.popover}
                        classes={{
                        paper: classes.popoverContent,
                        }}
                        open={state.mutePopover}
                        anchorEl={mutePopoverAnchor.current}
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                        }}
                        PaperProps={{onMouseEnter: mutePopoverEnter, onMouseLeave: mutePopoverLeave}}
                    >
                        <div>
                            <MenuItem
                                onClick={() => {}}
                            >
                                <ListItemText
                                    primary="For 15 Minutes"
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={() => {}}
                            >
                                <ListItemText
                                    primary="For 1 Hour"
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={() => {}}
                            >
                                <ListItemText
                                    primary="For 8 Hours"
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={() => {}}
                            >
                                <ListItemText
                                    primary="For 24 Hours"
                                />
                            </MenuItem>
                            <MenuItem
                                onClick={() => {}}
                            >
                                <ListItemText
                                    primary="Until I turn it back on"
                                />
                            </MenuItem>
                        </div>
                    </Popover>
                    <Divider/>
                    <MenuItem
                        ref={notificationPopoverAnchor}
                        aria-owns="mouse-over-popover"
                        aria-haspopup="true"
                        onMouseEnter={notificationPopoverEnter}
                        onMouseLeave={notificationPopoverLeave}
                    >
                        <ListItemText
                        
                            primary="Notification Settings"
                        />
                        
                    </MenuItem>
                    <Popover
                        className={classes.popover}
                        classes={{
                        paper: classes.popoverContent,
                        }}
                        open={state.notificationPopover}
                        anchorEl={notificationPopoverAnchor.current}
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                        }}
                        PaperProps={{onMouseEnter: notificationPopoverEnter, onMouseLeave: notificationPopoverLeave}}
                    >
                        <div>
                            {
                                state.roomContext && 
                                <React.Fragment>
                                    <MenuItem
                                        onClick={() => dispatch(setNotificationSettings(state.roomContext, 0))}
                                        selected={!state.roomContext.notification_settings || state.roomContext.notification_settings === 0}
                                    >
                                        <ListItemText
                                            primary="Use Group Default"
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => dispatch(setNotificationSettings(state.roomContext, 1))}
                                        selected={state.roomContext.notification_settings === 1}
                                    >
                                        <ListItemText
                                            primary="All Messages"
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => dispatch(setNotificationSettings(state.roomContext, 2))}
                                        selected={state.roomContext.notification_settings === 2}
                                    >
                                        <ListItemText
                                            primary="Only @mentions"
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => dispatch(setNotificationSettings(state.roomContext, 3))}
                                        selected={state.roomContext.notification_settings === 3}
                                    >
                                        <ListItemText
                                            primary="Nothing"
                                        />
                                    </MenuItem>
                                </React.Fragment>
                            }
                        </div>
                    </Popover>
                        */
                    }
                    

                    {
                        /*
                        <Divider/>
                        <MenuItem
                            color="primary"
                        >
                            <ListItemText
                                style={{color: '#2196f3'}}
                                primary="Invite People"
                            />
                        </MenuItem>
                        */
                    }
                    
                    {
                        /*
                        <MenuItem>
                            <ListItemText
                                primary="Clone Channel"
                            />
                        </MenuItem>
                        */
                    }
                    
                    <MenuItem
                        onClick={() => dispatch(openCreateChannelDialog())}
                    >
                        <ListItemText
                            primary="Create Text Channel"
                        />
                    </MenuItem>
                    <Divider/>
                    <MenuItem
                        color="error"
                        onClick={() => {
                            setState({
                                ...state,
                                deleteOpen: true,
                            })
                        }}
                    >
                        <ListItemText
                            style={{color: 'red'}}
                            primary="Close Room"
                        />
                    </MenuItem>
                </Paper>
            </Menu>
            <Dialog
                onClose={() => setState({...state, deleteOpen: false})}
                open={state.deleteOpen}
            >
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to close #{state.roomContext?.name}? 
                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={() => setState({...state, deleteOpen: false})}>
                            Cancel
                        </Button>
                        <Button style={{color: 'white', backgroundColor: 'red'}} onClick={deleteChannel} variant="contained">
                            Close
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog open={state.channelSettings} onClose={() => setState({...state, channelSettings: false})} fullScreen>
                <DialogTitle>
                    # {state.roomContext?.name} Settings
                </DialogTitle>
                <div>
                    {
                        state.channelSettings && 
                        <RoomSettings
                            data={state.roomContext as RoomSettings_fragment$key}
                            onClose={() => setState({...state, roomContext: null, channelSettings: false})}
                        />
                    }
                </div>
                <div style={{height: 100, width: '100%'}}/>
            </Dialog>
        </div>
    )
}
