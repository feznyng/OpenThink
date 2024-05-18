import React, { Component } from 'react';
import Card from '@material-ui/core/Card';
import {withStyles} from '@material-ui/core';
import {createNotification} from '../../actions/notificationActions'
import {getOrganizationbyID, updateSpace, updateSpaceUser, createSpaceUser, deleteSpaceUser, getParentUsers, generateSpaceLink, getSpaceLink} from '../../actions/orgActions';
import { TextField, DialogContent, InputAdornment, Snackbar, Typography, Button, IconButton, MenuItem, Accordion, AccordionSummary, AccordionDetails, ButtonGroup, Divider, DialogActions, CircularProgress } from '@material-ui/core';
import {Edit, Done, Close, Add, Save, Link, Search} from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import UserCard from '../User/UserCard';
import {checkUserExists, getUsers} from '../../actions/userActions';
import {connect} from 'react-redux';
import { validateEmail } from '../../utils/userutils';
import { stringMatching } from '../../utils/textprocessing';


const styles = theme => ({
    popover: { display: 'none' },
});

class InviteUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addUsers: [],
            email: '',
            addingUser: false,
            userError: false,
            helperText: '',
            users: [],
            matchedUsers: [],
        }

        this.selectUser = (checked, user) => {
            if (!checked) {
                this.setState({
                    ...this.state,
                    addUsers: this.state.addUsers.filter(u => u.user_id !== user.user_id)
                });
            } else {
                this.setState({
                    ...this.state,
                    addUsers: [...this.state.addUsers, user]
                });
            }
        }
        this.modifyAddingUser = (user, value) => {
            const newUsers = this.state.addUsers.filter(e => e.user_id !== user.user_id);
            if (value === 'deleting') {
                this.setState({
                    ...this.state,
                    addUsers: this.state.addUsers.filter(e => e.user_id !== user.user_id)
                });
            } else {
                newUsers.push(user);
                this.setState({
                    ...this.state,
                    addUsers: newUsers,
                });
            }
        }

        this.submitAddUsers = () => {
            this.props.createSpaceUser(this.props.group.space_id, this.state.addUsers.map(u => ({...u, type: 'Member'}))).then(() => {
                getParentUsers(this.props.group.space_id, 'spaces').then((users) => {
                    this.state.addUsers.forEach(u => {
                        const spaceUser = users.find(e => e.user_id === u.user_id);
                        createNotification(spaceUser.user_id, {
                             type: 'spaceInvite',
                             read: false,
                             space_user_id: spaceUser.space_user_id,
                         });
                    });
                    this.props.onClose(users);
                })
            });
        }

        this.onChangeQuery = (e) => {
            const val = e.target.value;
            if (val.length > 0) {
                const matchedUsers = stringMatching(val, this.state.users.map(u => ({string: `${u.firstname} ${u.lastname}`, value: u}))).map(s => s.value);
                this.setState({
                    ...this.state,
                    matchedUsers
                });
            } else {
                this.setState({
                    ...this.state,
                    matchedUsers: this.state.users
                })
            }
        }
    }

    componentDidMount() {
        const base = window.location.origin;
        console.log(base)
        getUsers().then(users => {
            this.setState({
                ...this.state,
                users: users.filter(u => !Boolean(this.props.group.users.find(gu => gu.user_id === u.user_id))),
                matchedUsers: users,
            })
        })
        getSpaceLink(this.props.group.space_id).then(link => {
            this.setState({
                ...this.state,
                link: base + '/invite/' + link.url
            })
        })
    }

    render() {
        return (
            <div>
                <Dialog 
                    open={true} 
                    onClose={() => this.props.onClose()} fullWidth={true}
                    fullScreen
                >
                        <DialogContent style={{paddingBottom: 20}}>
                            <Typography variant="h6">Invite Users</Typography>
                            <div style={{display: 'flex', marginTop: 20}}>
                                    <div style={{width: '50%'}}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            InputProps={{
                                                startAdornment: (<InputAdornment><Search/></InputAdornment>),
                                                style: {borderRadius: 30, height: 40}
                                            }}
                                            onChange={this.onChangeQuery}
                                        />
                                    </div>
                                    <div style={{marginTop: '10px', width: '50%'}}>
                                        <Typography variant="h6" style={{width: '100%', textAlign: 'center'}}>Inviting</Typography>
                                    </div>
                            </div>
                            <div style={{marginTop: 20,  display: 'flex'}}>
                                <div style={{width: "50%", height: '40vh', overflowY: 'auto'}}>
                                    {   
                                        this.state.matchedUsers.map(e => (
                                            <div style={{width: '90%', margin: 5}}>
                                                <UserCard userTypes={this.props.userTypes} key={e.user_id} user={e} onSelect={this.selectUser} selecting/>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div style={{width: '50%', height: '40vh', overflowY: 'auto'}}>
                                    {
                                        this.state.addUsers.map(e => (
                                            <div style={{width: '90%', margin: 5}}>
                                                <UserCard key={e.user_id} user={e} hideRole hideConnection/>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            {
                                /*
                                <div>
                                    <Typography style={{marginBottom: 10, maginTop: 10}}>
                                        Don't see who you're looking for? You can invite them to your group through their email. 
                                    </Typography>
                                    <div>
                                        <TextField
                                            placeholder="Email"
                                            value={this.state.email}
                                            onChange={e => this.setState({...this.state, email: e.target.value})}
                                        />
                                        <Button color="primary" style={{marginTop: 10}}>
                                            Send Email
                                        </Button>
                                    </div>
                                </div>
                                */
                            }
                            
                            <Divider style={{marginTop: 10, marginBottom: 10}}/>
                            <div>
                                <Typography variant="h6">Invite Link</Typography>
                                {
                                    this.state.link ? 
                                    <Typography>
                                        {this.state.link}
                                    </Typography>
                                    :
                                    <CircularProgress/>
                                }
                                <div style={{float: 'right'}}>
                                    <div>
                                        <Button>Reset Link</Button>
                                        <Button 
                                            color="primary" 
                                            onClick={() => {
                                                console.log('invoked')
                                                this.setState({
                                                    ...this.state, 
                                                    openSnack: true
                                                }, () => {
                                                    setTimeout(() => 
                                                        this.setState({
                                                            ...this.state, 
                                                            openSnack: false
                                                        })
                                                    , 3000);
                                                }); 
                                                navigator.clipboard.writeText(this.state.link);
                                            }}
                                        >
                                        Copy Link
                                        </Button>
                                    </div>
                                    {this.state.openSnack && <Typography variant='p' style={{float: 'right', textAlign: 'right', width: '100%', marginRight: 5}}>Link Copied</Typography>}
                                </div>
                                
                                <Typography variant="p" >
                                    Link will expire in 7 days. 
                                </Typography>
                            </div>
                        </DialogContent>
                        
                        <DialogActions style={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
                            <div>
                                <Button 
                                        onClick={() => this.props.onClose()}
                                        style={{marginRight: 5}}
                                    >
                                    Cancel
                                    </Button> 
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => {this.setState({...this.state, addingUser: false}); this.submitAddUsers()}}
                                        style={{color: 'white'}}
                                    >
                                        <Done/> Invite
                                    </Button>
                                
                            </div>                            
                        </DialogActions>                   
                </Dialog>   
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {};
  }
  
  const mapDispatchToProps = {
    updateSpace,
    updateSpaceUser,
    createSpaceUser,
    checkUserExists,
    deleteSpaceUser,
    getOrganizationbyID,
  }

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(InviteUsers))
