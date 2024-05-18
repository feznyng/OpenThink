import { Typography, OutlinedInput, InputAdornment, Divider, CircularProgress, FormControlLabel, Checkbox } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import {getParentUsers} from '../../actions/orgActions';
import React from 'react'
import {getUsers} from '../../actions/userActions';
import UserCard from '../User/UserCard';
export default function InviteCard(props) {
    const {invitees, onChange, currUser, parent} = props;
    const [users, setUsers] = React.useState([]);
    const [value, setValue] = React.useState([]);
    const [invites, setInvites] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [parentUsers, setParentUsers] = React.useState(parent.users);
    const [options, setOptions] = React.useState({
        allUsers: false,
        parentUsers: false,
    })
    const [filteredUsers, setFilteredUsers] = React.useState([]);
    React.useEffect(() => {
        setLoading(true);
        getUsers().then(e => {
            setUsers(e.filter(u => currUser.user_id !== u.user_id && !invitees.find(i => u.user_id === i.user_id)));
            setFilteredUsers(e.filter(u => currUser.user_id !== u.user_id && !invitees.find(i => u.user_id === i.user_id) ));
            setLoading(false);
        });
        
    }, []);
    
    const updateInvites = (e, user) => {
        if (e) {
            invites.push({...user, type: 'Invite'});
        } else {
            setInvites(invites.filter(i => i.user_id !== user.user_id))
        }
        onChange(invites);
    }

    const autocomplete = (val) => {
        let filtered = [];
        if (!val || val.length === 0) {
            setFilteredUsers(users);
            return;
        }   
        for (let i = 0; i < users.length; i++) {
            
            if ((`${users[i].firstname} ${users[i].lastname}`).substring(0, val.length).toUpperCase() === val.toUpperCase()) {
                filtered.push(users[i]);
            }
          }
          setFilteredUsers(filtered);
    };

    const chooseAllParentUsers = () => {
        setLoading(true);
        if (!options.parentUsers) {
            if (!parentUsers) {
                getParentUsers(parent.project_id ? parent.project_id: parent.space_id, parent.project_id ? 'projects': 'spaces').then(resp => {
                    setParentUsers(resp.filter(u => !invitees.find(i => i.user_id === u.user_id)));
                    resp.filter(u => !invitees.find(i => i.user_id === u.user_id) && !invites.find(i => i.user_id === u.user_id)).forEach(e => {
                        invites.push({...e, type: 'Invite'})
                    });
                    setInvites(invites);
                    onChange(invites);
                    setTimeout(() => {
                        setLoading(false);
                    }, 200);
                });
            } else {
                parentUsers.filter(u => !invitees.find(i => i.user_id === u.user_id)).forEach(e => {
                    invites.push({...e, type: 'Invite'})
                });
                setInvites(invites);
                onChange(invites);
                setTimeout(() => {
                    setLoading(false);
                }, 200);
            }
        } else {
            setInvites(invites.filter(i => !(parentUsers.find(u => u.user_id === i.user_id))));
            onChange(invites.filter(i => !(parentUsers.find(u => u.user_id === i.user_id))));
            setTimeout(() => {
                setLoading(false);
            }, 200);
        }
        setOptions({
            ...options,
            parentUsers: !options.parentUsers
        });
    }

    return (
        <div>
            <OutlinedInput 
                variant="outlined"
                value={value} 
                placeholder="Search..." 
                onChange={e => {
                    setValue(e.target.value);
                    autocomplete(e.target.value);
                }}
                style={{height:'45px', width: '100%', marginBottom: '10px', borderRadius: '40px'}} 
                endAdornment={
                    <InputAdornment>
                        <Search/>
                    </InputAdornment>
                }
                autoFocus
            />
            <div>
                <FormControlLabel
                    style={{marginBottom: '-1px'}}
                    control={
                        <Checkbox 
                            checked={options.parentUsers}
                            onClick={chooseAllParentUsers} 
                        />
                    }
                    label={(`Select All ${parent.project_id ? 'Project' : 'Space'} Users`)}
                    labelPlacement="start"
                />
            </div>
            <div style={{height: '300px', overflowY: 'scroll'}}>
                {
                    loading ? 
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <CircularProgress/>
                    </div>
                    :
                    filteredUsers.map((u, i) => 
                        <div style={{margin: 5}}>
                            <UserCard invited={Boolean(invites.find(i => u.user_id === i.user_id))} key={JSON.stringify(u)} selecting user={u} onSelect={updateInvites}/>
                        </div>
                    )
                }
            </div>
            {
                invitees && invitees.length > 0 && 
                <div style={{marginTop: '20px'}}>
                    <Divider/>
                    <div style={{marginTop: '10px'}}>
                        <Typography variant="h6" style={{marginBottom: '10px'}}>Already Invited</Typography>
                        {
                            invitees.map(u => (
                            <div style={{marginBottom: '5px'}}>
                                <UserCard user={u} going={u.type}/>
                            </div>
                            ))
                        }
                    </div>
                </div>
            }
        </div>
    )
}
