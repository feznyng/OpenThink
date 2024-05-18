import React, { Component } from 'react';
import {setPersonalSettings, deleteSpaceUser} from '../../../actions/orgActions';
import { CardContent, Typography, Button, Dialog, DialogActions, DialogTitle, DialogContent, IconButton} from '@material-ui/core';
import {Done, Close} from '@material-ui/icons'
import { useDispatch, useSelector } from 'react-redux';
import {SettingsSwitch} from '../../Shared/SettingsSwitch';
export default function SpacePersonalSettings() {
    const {
        currSpace,
        editedSpaceUser,
        currUser,
        mobile
    } = useSelector(state => ({...state.orgActions, ...state.uiActions}));
    const [state, setState] = React.useState({
        openLeaving: false
    })
    const {
        post_notifications,
        space_relation_notifications,
        project_notifications,
    } = editedSpaceUser;
    const dispatch = useDispatch();

    const editFields = (editedGeneral, field, edited) => {
        console.log(Boolean(post_notifications), Boolean(currUser.post_notifications), edited)
        dispatch(setPersonalSettings(editedGeneral, edited, field));
    }

    return (
        <div>   
            <div style={{textAlign: 'left', paddingBottom: '10px'}}>
                <CardContent>
                    <Typography variant="h5" style={{marginBottom: 10}}>
                        Notifications
                    </Typography>
                    <SettingsSwitch
                        perm={{
                            title: 'New Posts',
                            desc: 'Get notifications every time a post is created in this group.',
                        }}
                        toggleChecked={() => {         
                            editFields({
                                ...editedSpaceUser,
                                post_notifications: !post_notifications
                            }, 'new posts', Boolean(post_notifications) === Boolean(currUser.post_notifications))
                        }}
                        checked={Boolean(post_notifications)}
                    />
                
                    <SettingsSwitch
                        perm={{
                            title: 'New Projects',
                            desc: 'Get notifications every time a project is created in this group.',
                        }}
                        toggleChecked={() => {         
                            editFields({
                                ...editedSpaceUser,
                                space_relation_notifications: !space_relation_notifications
                            }, 'new projects', Boolean(space_relation_notifications) === Boolean(currUser.space_relation_notifications))
                        }}
                        checked={Boolean(space_relation_notifications)}
                    />
                    <SettingsSwitch
                        perm={{
                            title: 'New Groups',
                            desc: 'Get notifications every time a group is created in this group.',
                        }}
                        toggleChecked={() => {         
                            editFields({
                                ...editedSpaceUser,
                                project_notifications: !project_notifications
                            }, 'new spaces', Boolean(project_notifications) === Boolean(currUser.project_notifications))
                        }}
                        checked={Boolean(project_notifications)}
                    />                                 
                    <div style={{marginTop: '10px'}}>
                        <Button variant="outlined" style={{color: currUser.type === 'Creator' ? '' : 'red'}} disabled={currUser.type === 'Creator'} onClick={() => {setState({...state, openLeaving: true})}}>Leave Group</Button>
                        {currUser.type === 'Creator' && <Typography style={{marginTop: '5px'}}>Group Creators cannot leave.</Typography>}
                    </div>
                
                </CardContent>
            </div>
            <Dialog open={state.openLeaving} onClose={() => setState({...state, openLeaving: false})}> 
                <DialogTitle>
                    Leave
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to leave? Another person has to invite you if you'd like to return.
                </DialogContent>
                <DialogActions>
                <IconButton onClick={() => {
                        console.log('here')
                        dispatch(deleteSpaceUser(currSpace.space_id, currUser))
                    }}>
                        <Done/>
                    </IconButton>       
                    <IconButton onClick={() => setState({...state, openLeaving: false})}>
                        <Close/>
                    </IconButton>
                    
                </DialogActions>
            </Dialog>

        </div>
    )
}

/*
class SpacePersonalSettings extends Component {
    constructor(props) {
        super(props);
        const currUser = this.props.currSpace.users.find(e => e.user_id === store.getState().userActions.userInfo.user_id);
        const info = currUser.info ? (typeof(currUser.info) === 'string' ? JSON.parse(currUser.info) : currUser.info) : {posts: false};
        this.state = {
            currUser: {
                ...currUser,
                info
            },
            originaluser: {
                ...JSON.parse(JSON.stringify(currUser)),
                info: info
            },
        }

        this.updateSpaceUser = () => {
            this.setState({
                ...this.state,
                originaluser: JSON.parse(JSON.stringify(this.state.currUser)),
                loadingSave: true,
            
            }, () => {
                this.props.updateSpaceUser(this.props.currSpace.space_id, this.state.currUser).then(() => {
                    this.setState({
                        ...this.state, 
                        loadingSave: false,
                        unsavedChanges: false,
                        saveText: 'Changes made to your preferences have been saved.'
                    });
                    window.scrollTo(0, 0);
                })
                this.props.currUserChange(this.state.currUser);
            })
        }
    }
    render() {
        return (
            <div>
                <div style={{textAlign: 'left', paddingBottom: '10px'}}>
                    <CardContent>
                    <Typography variant="h6" style={{marginBottom: 10}}>
                        Notifications
                    </Typography>
                    <div>
                        New Posts
                        <Switch
                            checked={this.state.currUser.info.posts}
                            onChange={(e) => 
                            this.setState({
                                ...this.state,
                                currUser: {
                                    ...this.state.currUser,
                                    info: {
                                        ...this.state.currUser.info,
                                        posts: !this.state.currUser.info.posts
                                    }
                                },
                                unsavedChanges: true,
                            })}
                        />
                    </div>
                    <div>
                        New Subspaces
                        <Switch
                            checked={this.state.currUser.info.subspaces}
                            onChange={(e) => 
                            this.setState({
                                ...this.state,
                                currUser: {
                                    ...this.state.currUser,
                                    info: {
                                        ...this.state.currUser.info,
                                        subspaces: !this.state.currUser.info.subspaces,
                                    }
                                },
                                unsavedChanges: true,
                            })}
                        />
                    </div>
                    <div>
                        New Projects
                        <Switch
                            checked={this.state.currUser.info.projects}
                            onChange={(e) => 
                            this.setState({
                                ...this.state,
                                currUser: {
                                    ...this.state.currUser,
                                    info: {
                                        ...this.state.currUser.info,
                                        projects: !this.state.currUser.info.projects,
                                    }
                                },
                                unsavedChanges: true,
                            })}
                        />
                    </div>
                    
                        <div style={{marginTop: '10px'}}>
                            <Button variant="outlined" style={{color: this.state.currUser.type === 'Creator' ? '' : 'red'}} disabled={this.state.currUser.type === 'Creator'} onClick={() => {this.setState({...this.state, openLeaving: true})}}>Leave Group</Button>
                            {this.state.currUser.type === 'Creator' && <Typography style={{marginTop: '5px'}}>Group Creators cannot leave.</Typography>}
                        </div>
                    
                    </CardContent>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return state.orgActions;
  }
  
  const mapDispatchToProps = {
    updateSpace,
    updateSpaceUser,
    createSpaceUser,
    checkUserExists,
    deleteSpaceUser,
    getOrganizationbyID,
  }

export default connect(mapStateToProps, mapDispatchToProps)(SpacePersonalSettings)
*/