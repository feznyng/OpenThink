import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoles, deleteRole, updateRole, editRole, createRole, updateRoleOrder, addRoleUsers, deleteRoleUser } from '../../../actions/roleActions';
import {TextField, Typography, MenuItem, Button, Grid, Divider, Tabs, Tab, makeStyles, Switch, Menu, IconButton, Dialog, DialogContent, DialogActions} from '@material-ui/core';
import Fuse from 'fuse.js';
import { Search, Group, ChevronRight, Person, ChevronLeft, MoreHoriz, Delete, MoreVert, Edit, EditAttributes, Close } from '@material-ui/icons';
import { CirclePicker } from 'react-color';
import {sections, perms, permFuse, newRole} from '../../../utils/permissions';
import UserCard from '../../User/UserCard';
import { SubHeader, Header, Description, SettingsSwitch } from '../../Shared/SettingsSwitch';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import MemberSelector from '../../User/UserSelector';
import UserIcon from '../../User/UserIconOld';

const RoleMoreOptionsMenu = ({deleteRole, anchorEl, onClose}) => {
    return (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
            <MenuItem onClick={deleteRole} style={{color: 'red', }}>
                <Delete/> Delete Role
            </MenuItem>
        </Menu>
    )
}

const useStyles = makeStyles((theme) => ({
    tab: {
        padding: 0,
        margin: 0,
        height: 50,
        textTransform: 'none'
    },
    subHeading: {
        fontSize: theme.typography.pxToRem(16),
    },
  }));

const options = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    keys: [
        "name",
        "description",
      ]
  };
const fuse = new Fuse([], options);
const userFuse = new Fuse([], options);

const RoleEditor = (props) => {
    const classes = useStyles();
    const {
        role,
        onChange,
        closeEditor,
        deleteRole,
        addRoleUsers,
        removeRoleUser
    } = props;

    const {
        currSpace,
        currRole,
        mobile
    } = useSelector(state => ({...state.orgActions, ...state.uiActions}));
    const dispatch = useDispatch();

    const [state, setState] = React.useState({
        tabIndex: 0,
        perms,
        members: currRole.users ? currRole.users : [],
        selectedUsers: []
    });

    React.useEffect(() => {
        userFuse.setCollection(currRole.users ? currRole.users : []);
        setState({
            ...state,
            members: currRole.users ? currRole.users : []
        })
    }, [currRole.users])

    const searchPerms = (query) => {
        if (query.length === 0) {
            setState({
                ...state,
                perms
            })
        } else {
            setState({
                ...state,
                perms: permFuse.search(query)
            })
        }
    }

    const searchMembers = (query) => {
        if (query.length === 0) {
            setState({
                ...state,
                members: currSpace.users
            })
        } else {
            setState({
                ...state,
                members: userFuse.search(query)
            })
        }
    }

    return (
        <div style={{position: 'relative'}}>
           <div>
                <Button onClick={closeEditor} size="large">
                    <ChevronLeft/> Back
                </Button>
           </div>
            <div>
                <div style={{position: 'relative'}}>
                    <Typography variant="h5">
                        Editing Role: {role.name}
                    </Typography>
                    <IconButton onClick={e => setState({...state, anchorEl: e.currentTarget})} style={{position: 'absolute', right: 10, top: -7}}>
                        <MoreHoriz/>
                    </IconButton>
                    <RoleMoreOptionsMenu
                        onClose={() => setState({...state, anchorEl: null})}
                        anchorEl={state.anchorEl}
                        deleteRole={() => {
                            deleteRole(role);
                            closeEditor();
                        }}
                    />
                </div>
                <Tabs
                    value={state.tabIndex} 
                    onChange={(event, newValue) => {
                        setState({
                            ...state,
                            tabIndex: newValue
                        })
                    }}
                >
                    <Tab label="Display" classes={{ root: classes.tab}} />
                    <Tab label="Permissions" classes={{ root: classes.tab}} />
                    <Tab label="Members" classes={{ root: classes.tab}} />
                </Tabs>
                <div style={{marginTop: 10}}>
                    {
                        state.tabIndex === 0 &&
                        <div>
                            <Header>
                                Role Name
                            </Header>
                            <TextField
                                placeholder="Name"
                                value={role.name}
                                variant="outlined"
                                InputProps={{
                                    style: {
                                        height: 50
                                    }
                                }}
                                fullWidth
                                style={{marginBottom: 30}}
                                onChange={e => onChange({...role, name: e.target.value})}
                            />
                             <Header>
                                Role Description
                            </Header>
                            <TextField
                                placeholder="Description"
                                value={role.description}
                                variant="outlined"
                                multiline
                                rows={3}
                                fullWidth
                                onChange={e => onChange({...role, description: e.target.value})}
                                style={{marginBottom: 30}}
                            />
                             <Header>
                                Role Color
                            </Header>
                            <Description>
                                If a user has multiple roles, the color will be that of the role with the highest permissions. 
                            </Description>
                            <div style={{marginBottom: 30, marginTop: 10, display: 'flex'}}>
                                <CirclePicker
                                    onChange={(color) => {
                                        console.log(color)
                                        onChange({...role, color})
                                    }}
                                    color={role.color}
                                />
                            </div>
                           <div >
                           <Divider style={{marginBottom: 10}}/>
                                <SettingsSwitch
                                    perm={{
                                        title: 'Display Separately',
                                        desc: 'In Messages, display people with this role separately.'
                                    }}
                                />
                                <SettingsSwitch
                                    perm={{
                                        title: 'Allow Mentions',
                                        desc: 'Let everyone mention people with this role. Overriden by users who can use all mentions.'
                                    }}
                                />
                           </div>
                            
                        </div>
                    }
                    {
                        state.tabIndex === 1 &&
                        <div>
                            <div style={{marginBottom: 20,}}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Search Permissions"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <Search/>
                                    }}
                                    onChange={e => searchPerms(e.target.value)}
                                />
                            </div>
                            <div>
                                {
                                    sections.map(s => (
                                        <div>
                                            <SubHeader>
                                                {s}
                                            </SubHeader>
                                            {
                                                state.perms.filter(p => { return p.type === s}).map(p => (
                                                    <SettingsSwitch
                                                        perm={p}
                                                        toggleChecked={() => {
                                                            
                                                            role[p.id] = !Boolean(role[p.id]);
                                                            
                                                            onChange(role)
                                                        }}
                                                        checked={Boolean(role[p.id])}
                                                    />
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                            </div>

                        </div>
                    }
                    {
                        state.tabIndex === 2 &&
                        <div>
                            <div style={{marginBottom: 20, display: 'flex'}}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Search Members"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <Search/>
                                    }}
                                    onChange={e => searchMembers(e.target.value)}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    disableElevation
                                    style={{textTransform: 'none', height: '100%', marginTop: 2, flexShrink: 0, marginLeft: 5}}
                                    onClick={() => setState({...state, memberBrowser: true})}
                                >
                                    Add Member
                                </Button>
                            </div>
                            {
                                state.members.map(m => (
                                    <MenuItem style={{marginBottom: 5, position: 'relative'}}>
                                        <div style={{padding: 5, display: 'flex', alignItems: 'center'}}>
                                            <UserIcon user={m}/> <Typography style={{marginLeft: 10}}>{m.firstname} {m.lastname}</Typography>
                                        </div>
                                        <div style={{position: 'absolute', right: 0, height: '100%', top: 0, display: 'flex', alignContent: 'center'}}>
                                            <IconButton onClick={() => { removeRoleUser(m)}}>
                                                <Close style={{color: 'red'}}/>
                                            </IconButton>
                                        </div>
                                    </MenuItem>
                                ))
                            }
                            {
                                (!state.members || state.members.length < 1) &&
                                <Typography>
                                    <Person/> No Members with this Role
                                </Typography>
                            }
                        </div>
                    }
                </div>
            </div>
            <Dialog open={state.memberBrowser} onClose={() => setState({...state, memberBrowser: false})} maxWidth={'md'}  fullScreen={mobile}>
                <DialogContent>
                    <MemberSelector
                        onSelect={user => {
                            if (state.selectedUsers.indexOf(user) >= 0) {
                                setState({...state, selectedUsers: state.selectedUsers.filter(u => u !== user)})
                            } else {
                                setState({...state, selectedUsers: [user, ...state.selectedUsers]})
                            }
                        }}
                        users={currSpace.users}
                        selectedUsers={state.selectedUsers}
                    />
                </DialogContent>
                <DialogActions>
                    <span>
                        <Button onClick={() => setState({...state, memberBrowser: false, selectedUsers: []})}>Cancel</Button>
                        <Button onClick={() => {
                            addRoleUsers([...state.selectedUsers, ...(currRole.users ? currRole.users : [])]);
                            setState({...state, memberBrowser: false, selectedUsers: []});
                        }} style={{marginLeft: 5}} variant="contained" color="primary">Confirm</Button>
                    </span>
                </DialogActions>
            </Dialog>
        </div>
    )
}
const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};
function RoleList(props) {
    const {
        deleteRole,
        editRole,
        onOrderChange
    } = props;
    const {
        editedRoles,
        currSpace,
    } = useSelector(state => state.orgActions);
    const dispatch = useDispatch();
    const [state, setState] = React.useState({
        anchorEl: null,
        roles: []
     });
 
     React.useEffect(() => {
         if (editedRoles) {
             fuse.setCollection(editedRoles);
         }
         
         setState({
             ...state,
             roles: editedRoles
         })
     }, [editedRoles])
 
    const searchRoles = (pattern) => {
        if (pattern.length === 0) {
            setState({
                editedRoles
            })
        } else {
            setState({
                roles: fuse.search(pattern)
            })
        }
    }

    function onDragEnd(result) {
        if (!result.destination) {
            return;
        }
    
        if (result.destination.index === result.source.index) {
            return;
        }
  
        const newRoles = reorder(
            editedRoles,
            result.source.index,
            result.destination.index
        );
        console.log(editedRoles.map(r => r.name), newRoles.map(r => r.name));
        onOrderChange(newRoles)
    }
  
    return (
        <div>
            <div style={{display: 'flex'}}>
                <TextField
                    variant="outlined"
                    placeholder="Search Roles"
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: <Search/>
                    }}
                    onChange={e => searchRoles(e.target.value)}
                />
                <Button
                    variant="contained"
                    disableElevation
                    color="primary"
                    style={{textTransform: 'none', height: '100%', marginTop: 2, flexShrink: 0, marginLeft: 5}}
                    onClick={() => editRole()}
                >
                    Create Role
                </Button>
            </div>
            <div style={{marginTop: 20}}>
                <div style={{width: '100%', marginBottom: 5}}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="list">
                    {
                        provided => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                            {
                                state.roles.map((r, i) => (
                                    <div>
                                        <Draggable  key={r.role_id} draggableId={r.role_id.toString()} index={i}>
                                            {provided => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                            <Grid container justify="left" spacing={1} style={{width: '100%'}} onDragOver={e => console.log(e)}>
                                                    <MenuItem draggable style={{width: '100%', height: 40, marginBottom: 5}} onClick={() => editRole(r)}>
                                                        <Grid key={'Roles'} xs={4} item>
                                                            <Typography style={{fontWeight: 'bold'}}>
                                                                {r.name}
                                                            </Typography>
                                                            
                                                        </Grid>
                                                        <Grid key={'Members'} xs={4}item>
                                                            {r.users ? r.users.length : 0}
                                                        </Grid>
                                                        <span key={'Settings'}>
                                                            <IconButton 
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setState({
                                                                        ...state,
                                                                        anchorEl: e.currentTarget,
                                                                        currentRole: r
                                                                    })
                                                                }}
                                                            >
                                                                <MoreVert/>
                                                            </IconButton>
                                                        </span>
                                                    </MenuItem>
                                                </Grid>
                                            </div>
                                            )}
                                        </Draggable>
                                    </div>
                                    
                                ))
                                
                            }
                            {provided.placeholder}
                            </div>
                        )
                    }
                    </Droppable>
                </DragDropContext>
                </div>
                <Divider style={{marginBottom: 10}}/>
                {
                    (!editedRoles || editedRoles.length === 0) &&
                    <Typography>
                        <Person/> No Roles
                    </Typography>
                }
            </div>
            <Menu open={Boolean(state.anchorEl)} anchorEl={state.anchorEl} onClose={() => setState({...state, anchorEl: null})}>
                <MenuItem 
                    onClick={() => {
                        setState({
                            ...state,
                            anchorEl: null,
                            currentRole: null
                        })
                        editRole(state.currentRole);
                    }}
                >
                    <EditAttributes style={{marginRight: 10}}/> Edit Role
                </MenuItem>
                <MenuItem 
                    style={{color: 'red'}} 
                    onClick={() => {
                        setState({
                            ...state,
                            anchorEl: null,
                            currentRole: null
                        })
                        deleteRole(state.currentRole);
                    }}
                >
                    <Delete style={{marginRight: 10}}/> Delete Role
                </MenuItem>
            </Menu>
        </div>
    );
  }

export default function RoleManagement() {
    const [state, setState] = React.useState({
        currPage: 0,
        currRole: newRole
    });
    const {
        roles,
        editedRoles,
        currSpace,
        currRole
    } = useSelector(state => state.orgActions);
    const dispatch = useDispatch();


    React.useEffect(() => {
        dispatch(getRoles(currSpace.space_id));
    }, []);

    const removeRole = (role) => {
        dispatch(deleteRole(role));
    }   

    const changeRole = (role) => {
        console.log('bruh')
        if (role) {
            dispatch(editRole(role));
        } else {
            console.log('create role', newRole)
            dispatch(createRole(currSpace.space_id, newRole));
        }
        setState({
            ...state,
            currPage: 1,
        });
    }

    const onOrderChange = (roles) => {
        dispatch(updateRoleOrder(roles))
    }

    const addUsersRole = (users) => {
        
        dispatch(addRoleUsers(currRole.role_id, users))
    }

    const removeRoleUser = (user) => {
        
        dispatch(deleteRoleUser(currRole.role_id, user))
    }

    return (
        <div>
            {
                roles && state.currPage === 0 &&
                <div>
                    <div style={{maxWidth: 600, width: '100%'}}>
                    <Typography variant="h5" style={{marginBottom: 10}}>
                        Roles
                    </Typography>

                    <Typography variant="p">
                        Roles provide extensions to the basic user types (member, moderator, and follower). 
                        They allow you to assign permissions for managing users, posts, relations, messaging, and more to people in your {currSpace.project ? 'project' : 'group'}.
                    </Typography>
                    </div>
                    <MenuItem
                        startIcon={<Group style={{fontSize: 40}}/>}
                        variant="contained"
                        fullWidth
                        disableElevation
                        style={{textTransform: 'none', width: '100%', marginBottom: 20, marginTop: 20}}
                    >
                        <div style={{width: '100%', alignItems: 'center', height: '100%', position: 'relative'}}>
                            <div style={{textAlign: 'left', float: 'left', display: 'flex', alignItems: "center"}}>
                                <Group style={{marginRight: 20}} fontSize="large"/>
                                <div>
                                    <Typography variant="h6">Default Permissions</Typography>
                                    <Typography variant="p" color="textSecondary">Permissions for members and followers without roles and non-members.</Typography>
                                </div>
                            </div>
                            <div style={{float: 'right', marginTop: 10}}>
                                <ChevronRight/>
                            </div>
                        </div>
                    
                    </MenuItem>
                    <RoleList
                        roles={[...editedRoles, ...roles]}
                        deleteRole={removeRole}
                        editRole={changeRole}
                        onOrderChange={onOrderChange}
                    />
                </div>
            }
            {
                state.currPage === 1 &&
                <RoleEditor
                    role={currRole}
                    deleteRole={removeRole}
                    closeEditor={() => setState({...state, currPage: 0})}
                    onChange={currRole => {
                        dispatch((updateRole(currRole)));
                    }}
                    addRoleUsers={addUsersRole}
                    removeRoleUser={removeRoleUser}
                />
            }
        </div>
    )
}
