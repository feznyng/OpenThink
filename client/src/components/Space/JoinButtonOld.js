import React from 'react'
import { useDispatch } from 'react-redux';
import store from '../../Store';
import {updateSpaceUser, createSpaceUser, deleteSpaceUser} from '../../actions/orgActions';
import {Button, Dialog, DialogActions, DialogContent, IconButton, Menu, MenuItem} from '@material-ui/core';
import {Add, Done, PersonAdd, MoreHoriz, GroupAdd} from '@material-ui/icons'
import { useHistory } from 'react-router';
import {createNotification} from '../../actions/notificationActions';
import { primaryColor, secondaryColor } from '../../App';

export default function JoinButton(props) {
    const {organization, currUser, main, simple, style, icon, showType} = props;
    const dispatch = useDispatch();
    const history = useHistory();
    const [state, setState] = React.useState({
        anchorEl: null,
        anchorEl2: null,
        anchorEl3: null
    })    

    const [thisUser, setThisUser] = React.useState((currUser && currUser.spaces) ? currUser.spaces.find(s => s.space_id === organization.space_id) : null);

    let joinType;

    if (organization.type === 'Moderator' || organization.type === 'Creator') {
        joinType = 'Moderating'
    } else {
        joinType = 'Member'
    }

    const handleClose = (e) => {
        setState({...state, anchorEl: null});
  
        if (!e || typeof(e) !== 'string') {
          return;
        }

        const autoAccept = (e === 'Follower' || (organization.access_type === 'Open' && e === 'Member'));

        let newUser = {
            user_id: store.getState().userActions.userInfo.user_id,
            type: e,
            role: '',
            accepted: autoAccept,
            request: true,
        }
        dispatch(createSpaceUser(organization.space_id, [newUser], organization)).then(({space_user_id}) => {
            newUser.space_user_id = space_user_id;
            setThisUser(newUser);
            if (!autoAccept) {
                organization.users.forEach(u => {
                    if (u.user_id !== store.getState().userActions.userInfo.user_id && u.accepted && (u.type === 'Lead' || u.type === 'Creator') ){
                        createNotification(u.user_id, {
                            type: 'spaceRequest',
                            read: false,
                            space_user_id: newUser.space_user_id,
                        });
                    }
                   })
            }
            
        })
  
      };
  
      const handleClose2 = (e) => {
        setState({...state, anchorEl2: null});
        if (e === 'Accept') {
          dispatch(updateSpaceUser(organization.space_id, {
            ...thisUser,
            accepted: true
          }))
          
          setThisUser({...thisUser, accepted: true});
        } else if (e === 'Decline') {
          dispatch(deleteSpaceUser(organization.space_id, thisUser));
          setThisUser(undefined);
        }
      };
  
      const handleClose3 = (e) => {
        setState({...state, anchorEl3: null});
        if (e === 'Accept') {
          dispatch(updateSpaceUser(organization.space_id, {
            ...thisUser,
            accepted: true
          }))
          
          setThisUser({...thisUser, accepted: true});
        } else if (e === 'Decline') {
          dispatch(deleteSpaceUser(organization.space_id, thisUser));
          setThisUser(undefined);
        }
      };
    return (
        <div style={style} onClick={() => {if(!store.getState().userActions.jwt) history.push('/signin')}}>
            {
                // user is not signed in or has no requests or invites to this group
                !thisUser &&
                <React.Fragment>
                    {
                        icon ? 
                        <Button variant="contained" size="large">
                            <Add style={{color: 'white'}}/>
                        </Button>
                        :
                        <Button startIcon={<PersonAdd/>} size="large" color={main ? 'primary' : 'default'} onClick={(e) => setState({...state, anchorEl: e.currentTarget})} variant="contained" style={{borderRadius: 20, textTransform: 'none', width: '100%'}} disableElevation>
                            Join
                        </Button>
                    }
                </React.Fragment>
                
            }
            {
                // user is signed in and has been requested to join
                thisUser && !thisUser.accepted && thisUser.request &&
                <Button size="large" onClick={(e) => setState({...state, anchorEl3: e.currentTarget})} variant="outlined" style={{borderRadius: 20, textTransform: 'none', width: '100%'}} color="primary" disableElevation>
                {icon ? <MoreHoriz/> : (simple ? 'Requested' : `Requested to Be ${thisUser.type}`)}
                </Button>
            }
            {
                // user is a member of this space
                thisUser && thisUser.accepted &&
                <Button size="large" variant="contained" style={{borderRadius: 20, textTransform: 'none', width: '100%'}} color={main ? 'default' : 'primary'} disableElevation  
                    onClick={(e) => {
                        if (thisUser.type === 'Follower') {
                            dispatch(deleteSpaceUser(organization.space_id, thisUser));
                            setThisUser(null)  
                        } else {
                            if (thisUser.type === 'Moderator' || thisUser.type === 'Creator') {
                                return;
                            }
                            setState({
                                ...state,
                                anchorEl4: e.currentTarget
                            })
                        }
                    }}
                >
                    {icon ? <Done/> : (thisUser.type === 'Follower' ? 'Following' : (showType ? joinType : 'Joined'))}
                </Button>
            }
            {
                // user is not a member but has been invited
                thisUser && !thisUser.accepted && !thisUser.request &&
                <Button size="large" onClick={(e) => setState({...state, anchorEl2: e.currentTarget})} variant="outlined" color="primary" style={{borderRadius: 20, textTransform: 'none', width: '100%'}} disableElevation>
                    {icon ? <PersonAdd/> : `Invited as ${thisUser.type}`}
                </Button>
                
            }
            <Menu
                anchorEl={state.anchorEl}
                keepMounted
                open={Boolean(state.anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => handleClose('Follower')}>Follow</MenuItem>
                <MenuItem onClick={() => handleClose('Member')} >As Member</MenuItem>
                <MenuItem onClick={() => handleClose('Lead')}>As Moderator</MenuItem>
            </Menu>

            <Menu
                anchorEl={state.anchorEl2}
                keepMounted
                open={Boolean(state.anchorEl2)}
                onClose={handleClose2}
            >
                <MenuItem onClick={() => handleClose2('Accept')}>Accept</MenuItem>
                <MenuItem onClick={() => handleClose2('Decline')}>Decline</MenuItem>
            </Menu>
            
            <Menu
                anchorEl={state.anchorEl3}
                keepMounted
                open={Boolean(state.anchorEl3)}
                onClose={handleClose3}
            >
                <MenuItem onClick={() => handleClose3('Decline')}>Remove Request</MenuItem>
            </Menu>

            <Menu
                anchorEl={state.anchorEl4}
                keepMounted
                open={Boolean(state.anchorEl4)}
                onClose={() => setState({...state, anchorEl4: null})}
            >
                {
                    thisUser && (thisUser.type === 'Member' || thisUser.type === 'Member' || thisUser.type === 'Follower') && 
                    <MenuItem onClick={() => {
                        dispatch(updateSpaceUser(organization.space_id, {
                            ...thisUser,
                            type: 'Moderator',
                            accepted: false,
                        }))
                        setThisUser({
                            ...thisUser,
                            type: 'Moderator',
                            accepted: false,
                        })
                        setState({...state, anchorEl4: null})
                    }}>
                        Become Moderator
                    </MenuItem>
                }
                <MenuItem onClick={() => {
                    setState({...state, anchorEl4: null, leavingGroup: true})
                }}>
                    Leave Group
                </MenuItem>
            </Menu>
            <Dialog
                open={state.leavingGroup}
            >
                <DialogContent>
                    Are you sure you want to leave? 
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" onClick={() => {
                         dispatch(deleteSpaceUser(organization.space_id, thisUser));
                         setThisUser(null)
                         setState({...state, leavingGroup: false})
                    }}>
                        Leave Group
                    </Button>
                    <Button onClick={() => setState({...state, leavingGroup: false})}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
          
          
          </div>
    )
}
