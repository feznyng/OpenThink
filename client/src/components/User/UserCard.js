import React from 'react'
import Card  from '@material-ui/core/Card';
import UserIcon from './UserIconOld';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import { Link, CardActions, CardContent, Checkbox, IconButton, TextField, Select, MenuItem, FormControl, InputLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import { Close, Delete, Done, Edit, Add } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import ConnectButton from './ConnectButtonOld';
import {useHistory} from 'react-router'

export default function UserCard(props) {
    const {user, managing, userTypes, onChange, selecting, onSelect, going, invited, hideRole, displayStatus, hideConnection} = props;
    const {
        userInfo 
    } = useSelector(state => state.userActions)
    const [currUser, setCurrUser] = React.useState(JSON.parse(JSON.stringify(user)));
    const [origUser, setOrigUser] = React.useState(user);
    const [editing, setEditing] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [state, setState] = React.useState({
        checked: invited,
        hover: false,
    });

    React.useEffect(() => {
        setState({
            checked: invited,
        });
    }, []);

    const history = useHistory();

    return (
        <div style={{width: '100%'}} onMouseEnter={() => setState({...state, hover: true})} onMouseLeave={() => setState({...state, hover: false})}>
            {
                (!managing && !selecting && !going) &&
                <Card style={{width: '100%', height: 75, boxShadow: 'none', position: 'relative'}}>
                    <CardHeader
                        style={{textAlign: 'left'}}
                        avatar={
                            <span style={{cursor: 'pointer'}}>
                                <UserIcon user={currUser} displayStatus={displayStatus}/>
                            </span>
                        }
                        title={
                            <Link color="textPrimary" onClick={() => history.push(`/profile/${user.user_id}`)} variant="link" style={{textAlign:'left'}}>{`${currUser.firstname} ${currUser.lastname}`}</Link>
                        }
                        subheader={
                            !hideRole &&
                            <React.Fragment>
                                {
                                    user.accepted ? 
                                    <Typography color="textSecondary" style={{textAlign:'left'}} >{currUser.role}</Typography>
                                    :
                                    <Typography>Invited</Typography>
                                }
                            </React.Fragment>
                            
                        }
                    />
                    {
                        !hideConnection && userInfo.user_id !== user.user_id &&
                        <div style={{height: '100%', display: 'flex', alignItems: 'center', position: 'absolute', right: 15, top: 0}} onClick={e => e.preventDefault()}>
                            <ConnectButton
                                user={user}
                            />
                        </div>
                    }
                    
                </Card>
            }
            {
               (managing  || selecting || going) && !editing &&
                <Card style={{width: '100%', boxShadow: state.hover ? '' : 'none'}}>
                    <CardHeader
                        avatar={
                            <UserIcon user={currUser} displayStatus={displayStatus}/>
                        }
                        title={
                            <Typography style={{textAlign:'left', marginTop:'20px'}}>{`${currUser.firstname} ${currUser.lastname}`}</Typography>
                        }
                        subheader={
                            <p style={{textAlign:'left'}}>{currUser.type} {currUser.role && `\u25CF ${currUser.role}`}</p>
                        }
                        action={
                            <div style={{marginTop: '15px'}}>
                                {
                                    currUser.type !== 'Creator' && managing && 
                                    <IconButton  onClick={() => setEditing(true)}>
                                        <Edit/>
                                    </IconButton>
                                }
                                {
                                    currUser.type !== 'Creator' && selecting && 
                                    <Checkbox checked={state.checked} onClick={(e) => {onSelect(!state.checked, user); setState({
                                        checked: !state.checked,
                                    })}}/>
                                }
                            
                            </div>
                        }
                    />
            
               </Card>
               
            }
            {
                editing &&
                <Card >
                    <CardHeader
                avatar={
                    <UserIcon user={currUser} displayStatus={displayStatus}/>
                }
                title={
                    <Typography style={{textAlign:'left'}}>{`${currUser.firstname} ${currUser.lastname}`}</Typography>
                }
                />
                <CardContent style={{textAlign: 'left'}}>
                <TextField 
                        label="Role" 
                        variant="outlined"
                        value={currUser.role}
                        onChange={(e) => setCurrUser({...currUser, role: e.target.value})}
                />
                {
                    
                    <FormControl  style={{width: '150px', marginLeft: '10px'}} variant="outlined"> 
                        <InputLabel id="demo-simple-select-label">Type</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={currUser.type}
                        onChange={(e) => setCurrUser({...currUser, type: e.target.value})}
                        label="Type"
                        >   
                        {
                            userTypes.map(e => 
                                
                                <MenuItem key={e} value={e}>
                                    <div>{e}</div>
                                </MenuItem>
                            )
                        }
                        </Select>
                    </FormControl>
                }
                
                </CardContent>
                <CardActions>
                    <div style={{width: "100%"}}>
                        <div style={{float: 'left'}}>
                            {
                                user.type === 'Creator' &&
                                <Typography>This user cannot be removed.</Typography>
                            }
                            {
                                user.type !== 'Creator' &&
                                <Button variant="contained" style={{color: 'white', backgroundColor: 'red'}} onClick={() => setOpen(true)}>
                                <Delete/> Remove
                                </Button>
                            }
                            
                        </div>
                        
                        <div style={{float: 'right'}}>
                        {
                            !origUser.accepted && origUser.request &&
                            <Button variant="outlined" color="primary" onClick={() => {onChange(user, 'joining')}}>
                                <Add/> Add User
                            </Button>
                        }
                        
                        <Button variant="outlined" style={{marginRight: 5}} onClick={() => {setEditing(false); setCurrUser(origUser)}}>
                            <Close/> Cancel
                        </Button>
                    
                        <Button variant="contained" color="primary" style={{color: 'white'}} onClick={() => {setEditing(false); onChange(currUser); setOrigUser(currUser)}}>
                            <Done/> Save
                        </Button>
                        </div>
                    </div>
                </CardActions>
                </Card>
            }

            <Dialog onClose={() => setOpen(false)} open={open}>
                <DialogTitle>Remove User</DialogTitle>
                <DialogContent>Are you sure you want to remove this person? They can be added back later.</DialogContent>
                <DialogActions>
                    <Button variant="outlined" style={{color: 'red'}} onClick={() => {setOpen(false); onChange(user, 'deleting')}}>
                        Yes
                    </Button>
                    <Button  variant="outlined" color="primary" onClick={() => setOpen(false)}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
        
        
    )
}
