import React, { CSSProperties, useState } from 'react'
import {Card, ButtonGroup, IconButton, Menu, Popover, Tooltip, Button, MenuItem, Dialog, Chip, DialogTitle, DialogContent, DialogActions, CardActionArea, ListItem} from '@material-ui/core';
import {Edit, Delete, MoreVert, Close, EmojiEmotions, Done} from '@material-ui/icons';
import UserIcon from '../User/UserIcon';
import MessageEditor from './MessageEditor';
import PinIcon from '../Shared/PinIcon';
import './MessageCard.scss'
import { message, reaction } from '../../types/message';
import { user } from '../../types/user';
import { getTimeString, ONE_HOUR, timeAgo } from '../../utils/dateutils';
import Typography from '../Shared/Typography'
import graphql from 'babel-plugin-relay/macro';
import { useFragment, useMutation, ConnectionHandler, useLazyLoadQuery } from 'react-relay';
import UserPreviewCardWrapper from '../User/UserPreviewCardWrapper';
import MessageReactions from './MessageReactions'
import ReactionMenu from '../Reactions/ReactionMenu'
import commitAddReaction from '../../mutations/AddReaction';
import CommentsAddOn from '../Comments/CommentsAddOn';
import { MessageCardQuery } from './__generated__/MessageCardQuery.graphql';


interface MessageCardProps {
    data: any,
    readonly?: boolean,
    inPinned?: boolean,
    hideMenu?: boolean,
    concat?: boolean,
    deleteMessage?: (id: string) => void,
    room_graphql_id?: string,
    spaceId?: number,
    style?: CSSProperties
    comment?: boolean
}

interface MessageCardState {
    hover: boolean,
    editing: boolean,
    locked: boolean,
    reactionAnchor: Element | null,
    previewAnchor: Element | null,
    anchorEl: Element | null,
    anchorElAux: Element | null,
    deleting: boolean,
    userPreview: user | null,
    connectionId?: string,
}

export default React.memo(function MessageCard({data, spaceId, style, readonly, inPinned, comment, room_graphql_id, hideMenu, concat, deleteMessage}: MessageCardProps) {
    const message = useFragment(    
        graphql`      
            fragment MessageCard_fragment on Message { 
                __id       
                id
                messageId
                user {
                    firstname
                    lastname
                    profilepic
                    userId
                    ...UserPreviewCardWrapperFragment
                    ...UserIconFragment
                }
                body
                createdAt
                edited
                deleted
                pinned
                createdBy
                ...MessageReactionsFragment
                ...CommentsAddOnFragment
            }    
        `,
        data
    );

    const { me } = useLazyLoadQuery<MessageCardQuery>(
        graphql`
            query MessageCardQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )

    const deleted = message?.deleted

    const [state, setState] = React.useState<MessageCardState>({
        hover: false,
        editing: false,
        locked: false,
        reactionAnchor: null,
        previewAnchor: null,
        anchorEl: null,
        deleting: false,
        userPreview: null,
        anchorElAux: null,
        connectionId: ''
    })

    const [connectionId, setConnectionId] = useState('')
    const editPost = () => setState({...state, editing: true})

    let timeString: any = '';

    const timestamp = message?.createdAt!!.toString();
    const createdAt = new Date(timestamp);
    const now = new Date();

    timeString = getTimeString(createdAt)
    const jumpMessage = () => {
        
    }
    const sendMessage = ({body}: message) => {
        const msg = {
            body: body!!,
            messageId: message.messageId!!,
        }
        updateMessage(msg);
        setState({
            ...state,
            editing: false,
        })
    }


    const [commitPinMessage, isMessagePinInFlight] = useMutation(
        graphql`
            mutation MessageCardPinMutation($input: PinMessageInput!) {
                pinMessage(input: $input) {
                    message {
                        id
                        pinned
                    }
                }
            }
        `
    );

    React.useEffect(() => {
        setState({
            ...state,
            editing: false
        })
    }, [message])

    const pinMessage = ({pinned, messageId, createdBy}: {messageId: number, pinned: boolean, createdBy: number}) => {
        commitPinMessage({
            variables: {
                input: {
                    messageId,
                    pinned,
                },
            },
            updater: (store) => {
                const roomRecord = store.get(room_graphql_id!!);
                if (roomRecord) {
                    const connectionRecord = ConnectionHandler.getConnection(    
                        roomRecord,    
                        'MessageWindowHeader_pinnedMessages',  
                    );
                    if (connectionRecord) {
                        const newMessage = store.get(message.__id)
                        const pinned = newMessage?.getValue("pinned");
                        if (newMessage) {
                            if (pinned) {
                                const newEdge = ConnectionHandler.createEdge(    
                                    store,    
                                    connectionRecord,    
                                    newMessage,
                                    'MessageEdge', 
                                );
                                ConnectionHandler.insertEdgeBefore(connectionRecord, newEdge); 
                            } else {
                                ConnectionHandler.deleteNode(    
                                    connectionRecord,    
                                    message.id,  
                                );
                            }
                            
                        }  
                        
                        
                    }
                    
                }
            } 
        })
    }

    const [commitUpdateMessage] = useMutation(
        graphql`
            mutation MessageCardUpdateMutation($input: UpdateMessageInput!) {
                updateMessage(input: $input) {
                    message {            
                        id
                        body
                    }
                }
            }
        `
    );


    const updateMessage = ({messageId, body}: {messageId: number, body: string}) => {
        commitUpdateMessage({
            variables: {
                input: {
                    messageId,
                    body
                },
            }
        })
    }

    const addReaction = ({name, emoji}: any) => {
        setState({
            ...state,
            reactionAnchor: null,
        })
        if (connectionId && spaceId) {
            commitAddReaction(parseInt(message.messageId), spaceId, emoji, name, 'message', [connectionId])
        } else {
            console.log('error with reaction, connectionId is null')
        }
    }

    if (!message) {
        return (
            <div>
                Deleted
            </div>
        )
    }
    
    return (
        <div style={{width: '100%', height: '100%', ...style}} className="message-body">
            {
                message.pinned && 
                <div style={{textAlign: 'left', display: 'flex', alignItems: 'center', marginLeft: 5}}>
                    <PinIcon fontSize="small" style={{color: '#75D377', marginRight: 5, fontSize: 12}}/>
                    <Typography style={{textAlign: 'left', fontSize: 12}}>
                        Pinned
                    </Typography>
                </div>
            }
            <ListItem 
                selected={!!state.hover && !comment}
                style={{paddingLeft: 0, paddingRight: 0, paddingBottom: comment ? 10 : 0, paddingTop: 5}}
                onMouseEnter={() => setState({...state, hover: true})}
                onMouseLeave={() => setState({...state, hover: false})}
            >
                {
                    !deleted && !comment && !hideMenu && state.hover && 
                    <Card style={{position: 'absolute', right: 5, top: -15}}>
                        <ButtonGroup style={{padding: 0}}>
                            {
                                me?.userId.toString() === message.createdBy && !inPinned && 
                                <IconButton onClick={() => setState({...state, editing: true})} size="small">
                                    <Edit fontSize="small"/>
                                </IconButton>
                            }
                            {
                                inPinned &&
                                <Button
                                    onClick={jumpMessage}
                                >
                                    Jump
                                </Button>
                            }
                            {
                                <Tooltip title={message.pinned ? 'Unpin message' : 'Pin Message'}>
                                    <IconButton onClick={() => pinMessage({...message, pinned: !message.pinned})} size="small">
                                        <PinIcon fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            }
                            {
                                !inPinned && 
                                <IconButton onClick={(e) => setState({...state, locked: true, reactionAnchor: e.currentTarget})} size="small">
                                    <EmojiEmotions fontSize="small"/>
                                </IconButton>
                            }
                            {
                                !inPinned && !readonly && 
                                <IconButton onClick={(e) => setState({...state, locked: true, anchorEl: e.currentTarget})} size="small">
                                    <MoreVert/>
                                </IconButton>
                            }
                        
                        </ButtonGroup>
                        
                        
                        <Menu open={Boolean(state.anchorEl)} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null, locked: false,})}>
                            {
                                me?.userId === parseInt(message.createdBy) && 
                                <MenuItem style={{color: 'red'}} onClick={() => {deleteMessage && deleteMessage(message.id); setState({...state, anchorEl: null})}}>
                                    <Delete/>Delete
                                </MenuItem>
                            }
                           
                        </Menu>
                        <Menu open={Boolean(state.reactionAnchor)} anchorEl={state.reactionAnchor} onClose={() => setState({...state, locked: false, reactionAnchor: null})}>
                            <ReactionMenu
                                onSelect={addReaction}
                            />
                        </Menu>
                    </Card>
                }
                    
                
                <div style={{display: 'flex', marginLeft: 5, paddingBottom: 2.5, paddingTop: state.editing ? 10 : 2.5, width: '100%'}}>
                    <span 
                        style={{visibility: concat ? 'hidden' : undefined}}
                    >
                        {
                            (message.pinned || !concat) && 
                            <UserPreviewCardWrapper
                                user={message.user}
                                variant="click"
                            >
                                <UserIcon
                                    size={30}
                                    placeholder={deleted}
                                    user={message.user}
                                />
                            </UserPreviewCardWrapper>
                        }
                    </span>
                    {
                        !state.editing && 
                        <div style={{width: '100%'}}> 
                            <div style={{ display: concat ? 'none' : 'flex', position: 'relative', alignItems: 'center'}}>
                                <UserPreviewCardWrapper
                                    user={message.user}
                                    variant="click"
                                >
                                    {
                                        deleted ? 
                                        <Typography style={{marginLeft: 10, fontWeight: 'bold'}} hoverStyle={{textDecoration: 'underline'}}>
                                            [Deleted]
                                        </Typography>
                                        :
                                        <Typography style={{marginLeft: 10, fontWeight: 'bold'}} hoverStyle={{textDecoration: 'underline'}}>
                                            {message!!.user!!.firstname} {message!!.user!!.lastname}
                                        </Typography>
                                    }
                                </UserPreviewCardWrapper>
                                <Typography style={{marginLeft: 5}} variant="caption">
                                    {deleted ? '' : timeString}
                                </Typography>
                            </div>
                            <div style={{textAlign: 'left', marginLeft: concat ? 40 : 10, marginBottom: -10}} dangerouslySetInnerHTML={{__html: deleted ? '<p>[Deleted]</p>' : message.body!!}}/>
                            
                            <div
                                style={{paddingLeft: 5, marginTop: 20, width: '100%'}}
                            >
                                <MessageReactions
                                    message={message}
                                    getConnection={setConnectionId}
                                />
                                
                            </div>
                        </div>
                    }
                    {
                        !deleted && state.editing && 
                        <div style={{position: 'relative', width: '100%', marginLeft: 10}}>
                            <MessageEditor
                                sendMessage={sendMessage}
                                message={message}
                                canSend
                                onFinish={() => setState({...state, editing: false})}
                            />
                        </div>
                    }
                </div>
                
                
                <Dialog open={state.deleting} onClose={() => setState({...state, anchorEl: null, deleting: false, hover: false})}>
                    <DialogTitle>
                        <div>
                            <Typography style={{float: 'left'}} variant="h6">
                            Delete Message
                            </Typography>
                            <IconButton style={{float: 'right', marginTop: -14}}>
                                <Close/>
                            </IconButton>
                        </div>
                    </DialogTitle>
                    <DialogContent style={{paddingBottom: 20}}>
                        <Typography style={{marginBottom: 10}}>Are you sure you want to delete this message?</Typography>
                        <MessageCard readonly data={message}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setState({...state, anchorEl: null, deleting: false, hover: false})}>Cancel</Button>
                        <Button onClick={() => {deleteMessage && deleteMessage(message.id); setState({...state, anchorEl: null, deleting: false, hover: false})}} style={{backgroundColor: 'red', color: 'white'}} variant="contained">Delete Message</Button>
                    </DialogActions>
                </Dialog>
            </ListItem>
            {
                comment && 
                <div
                    style={{marginLeft: concat ? 70 : 40, }}
                >
                    <CommentsAddOn
                        data={data}
                        editPost={editPost}
                        deleteComment={deleteMessage}
                    />
                </div>
            }
        </div>
    )
}, (prevProps, nextProps) => prevProps.data === nextProps.data)