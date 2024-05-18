import React from 'react'
import {Typography, Divider, Dialog, DialogTitle, DialogContent, withWidth, DialogActions, Button, Menu, MenuItem, IconButton} from '@material-ui/core';
import {Close, EventAvailable, Send, } from '@material-ui/icons'
import {sanitizeBody} from '../../../utils/textprocessing';
import {addPostUser, addPostUsers, deletePostUser} from '../../../actions/postUserActions';
import {getPostByID} from '../../../actions/postActions';
import { createNotification } from '../../../actions/notificationActions';
import store from '../../../Store';
import UserIcon from '../../User/UserIconOld';
import InviteCard from '../../Space/InviteCard';
import {useDispatch} from 'react-redux';
import { getDay, getHours, getMinutes, getMonth, getTimeCode } from '../../../utils/dateutils';
import { getPostColor } from '../../../utils/postutils';

function EventFeature(props) {
    const {post, parent} = props;
    const dispatch = useDispatch();
    const [state, setState] = React.useState({
        anchorEL: null,
        inviteOpen: false,
        attending: null,
        users: post.users ? post.users : [],
        invites: [],
    });
    const currUser = store.getState().userActions.userInfo;
    React.useEffect(() => {
        if (post.users === undefined) {
            const parentType = parent.project_id ? 'projects' : 'spaces'
            const id = parent.project_id ? parent.project_id : parent.space_id;
            dispatch(getPostByID(parentType, id, post.post_id)).then(e => {
                setState({
                    ...state,
                    attending: currUser && e.post.users ? e.post.users.find(e => e.user_id === currUser.user_id) : null,
                    users: e.post.users
                });
            })
        } else {
            setState({
                ...state,
                attending: post.users && currUser ? post.users.find(e => e.user_id === currUser.user_id) : null,
            });
        }
        
    }, []);

    const start_date = new Date(post.start_date);
    const dateString = `${getDay(start_date)}, ${getMonth(start_date)} ${start_date.getDay()} at ${start_date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`

    const goingUsers = state.users ? state.users.filter(u => u.type === 'Going') : [];
    const interestedUsers = state.users ? state.users.filter(u => u.type === 'Maybe') : [];


    const handleMenuClick = (val) => {
        if (!val) {
            deletePostUser(parent, post, {user_id: currUser.user_id, type: state.attending.type});
            setState({
                ...state,
                anchorEl: null,
                users: state.users.filter(u => u.user_id !== currUser.user_id),
                attending: null
            })
            return;
        }
        const newUser = {firstname: currUser.firstname, profilepic: currUser.profilepic, lastname: currUser.lastname, user_id: currUser.user_id, type: val};
        addPostUser(parent, post, [newUser]);
        setState({
            ...state,
            anchorEl: null,
            attending: newUser,
            users: [...state.users.filter(u => u.user_id !== currUser.user_id), newUser],
        });
    };

    const inviteUsers = () => {
        addPostUsers(parent, post, [...state.users, ...state.invites]); 
        state.invites.forEach(u => {
            createNotification(u.user_id, {
                type: 'eventInvite',
                read: false,
                user_id: u.user_id,
                project: parent.project_id ? true : false,
                space: parent.space_id ? true : false,
                post_id: post.post_id,
            });
        })  
        setState({
            ...state,
            invites: [],
            inviteOpen: false,
            attending: state.invites.find(e => e.user_id === currUser.user_id),
            users: [...state.users, ...state.invites],
        })
    }

    let buttonText = 'RSVP';
    if (state.attending) {
        if (state.attending.type === 'Going')
            buttonText = 'Going'
        else if (state.attending.type === 'Maybe')
            buttonText = 'Maybe'
    }

    return (
        <div style={{textAlign: 'left'}}>
            <Divider/>
            <div style={{marginTop: 10}}>
                <div>
                    <Typography style={{marginTop: 10, textTransform: 'uppercase', fontWeight: 'bold', color: getPostColor('Event')}}>
                    {dateString}
                    </Typography>
                    {
                        Boolean(post.address) && post.longitude && post.latitude && 
                        <Typography>
                            {post.address}
                        </Typography>
                    }
                    
                </div>
                <div style={{marginTop: 15}} onClick={e => e.preventDefault()}>
                    <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<EventAvailable/>}
                        variant={buttonText === 'RSVP' ? 'outlined' : "contained"}
                        disableElevation
                        style={{marginRight: '5px'}}
                        onClick={(e) => setState({...state, anchorEl: e.currentTarget})}
                    >
                        {
                            state.attending &&
                            <Typography>
                                {buttonText}
                            </Typography>
                        }
                        {
                            !state.attending &&
                            <Typography>
                                RSVP 
                            </Typography>
                        }
                    </Button>
                    <Button
                        color="primary"
                        startIcon={<Send/>}
                        onClick={(e) => setState({...state, inviteOpen: true})}
                    >
                        Invite
                    </Button>

                    <Menu open={Boolean(state.anchorEl)} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                        <MenuItem onClick={() => handleMenuClick('Going')}>Going</MenuItem>
                        <MenuItem onClick={() => handleMenuClick('Maybe')}>Maybe</MenuItem>
                        {state.attending && <MenuItem onClick={() => handleMenuClick()}>Remove RSVP</MenuItem>}
                    </Menu>
                </div>
                {
                    goingUsers.length > 0 && 
                    <div style={{display: 'flex', marginTop: '10px'}}>
                        
                    
                    <span style={{marginRight: '5px'}}>
                    {
                       goingUsers.map((u, i) => <span style={{marginRight: '1px'}} key={i}><UserIcon user={u}/></span>)
                    }
                    </span>
                    <Typography style={{marginTop: '10px'}}>
                        {goingUsers.length > 1 ? 'are' : 'is'} going.
                    </Typography>
                    
                    </div>
                }
                {
                    interestedUsers.length > 0 && 
                    <div style={{display: 'flex', marginTop: '10px'}}>\
                        <span style={{marginRight: '5px'}}>
                            {
                                interestedUsers.map((u, i) => <span style={{marginRight: '1px'}} key={i}><UserIcon user={u}/></span>)
                            }
                        </span>
                        <Typography style={{marginTop: '10px'}}>
                            {interestedUsers.length > 1 ? 'are' : 'is'} interested.
                        </Typography>
                    </div>
                }
               
            </div>
           <Dialog fullWidth={true}
                    maxWidth={'lg'} open={state.inviteOpen} fullScreen={props.width === 'xs' || props.width === 'sm'} onClose={() => setState({...state, inviteOpen: false, invites: []})}>
               <DialogTitle >
                   Invite People
                   <IconButton style={{marginTop: '-5px', float: 'right'}} onClick={() => setState({...state, inviteOpen: false})}><Close/></IconButton>
               </DialogTitle>
               <DialogContent>
                   <div>
                    <InviteCard parent={parent} currUser={currUser} onChange={(e) => setState({...state, invites: e})} invitees={state.users}/>
                   </div>
               </DialogContent>
               <DialogActions>
                   <Button onClick={() => setState({...state, inviteOpen: false, invites: []})}>Cancel</Button>
                   <Button onClick={inviteUsers} disabled={state.invites.length === 0}>Add</Button>
               </DialogActions>
           </Dialog>
        </div>
    )
}

export default withWidth()(EventFeature)