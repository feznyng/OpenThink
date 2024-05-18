import React, { Component } from 'react';
import {getOrganizationbyID, updateSpace, updateSpaceUser, deleteParent, createSpaceUser, deleteSpaceUser, getParentUsers} from '../../../actions/orgActions';
import {checkUserExists} from '../../../actions/userActions';
import { Typography, Accordion, AccordionSummary, AccordionDetails, } from '@material-ui/core';
import {Link, GroupAdd} from '@material-ui/icons';
import UserBase from '../UserBaseOld';
import Button from '@material-ui/core/Button';
import {connect} from "react-redux";
import UserCard from '../../User/UserCard';
import InviteUsers from '../InviteUsers';

export class SpaceUserSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            addingUser: false,
        }
        this.userTypes = ['Moderator', 'Member'];
        this.onChangeUser = (user, value) => {
            if (value === 'deleting') {
                this.props.deleteSpaceUser(this.props.currSpace.space_id, user);
                const newUsers = this.props.currSpace.users.filter(e => e.user_id !== user.user_id);
                return;
            } else if (value === 'joining') {
                this.props.updateSpaceUser(this.props.currSpace.space_id, {
                    ...user,
                    accepted: true
                });
                return;
            }
            this.props.updateSpaceUser(this.props.currSpace.space_id, user);
            const prevUser = this.props.currSpace.users.find(e => e.user_id === user.user_id);
    
            if (prevUser.type !== user.type) {
                const newUsers = this.props.currSpace.users.filter(e => e.user_id !== user.user_id);
                newUsers.push(user);
            }
        }
        
    }
    
    render() {
        return (
            <div>
              
                <Accordion expanded>
                    <AccordionSummary
                    >
                        <Typography>Invites and Requests</Typography>
                    </AccordionSummary>
                    <AccordionDetails >
                        <div style={{width: '100%'}}>
                            <div style={{marginBottom: '10px'}}>
                                <Button variant="contained" color="primary" disableElevation style={{textTransform: 'none', borderRadius: '25px', width: '100%'}} onClick={() => this.setState({...this.state, addingUser: true})}>
                                    <Typography><GroupAdd/> Invite People</Typography>
                                </Button>
                            </div>
                            <div>
                                {
                                    this.props.currSpace.users.filter(e => !e.accepted).map(u => 
                                        <UserCard key={u.user_id} user={u} managing role={u.role}  userTypes={this.userTypes} style={{width: '100%'}} onChange={this.onChangeUser}/>
                                    )
                                }
                            </div>
                        </div>         
                    </AccordionDetails>
                </Accordion>

                <UserBase parent={this.props.currSpace} onChange={this.onChangeUser} managing userTypes={this.userTypes}/>  
                {
                    this.state.addingUser && 
                    <InviteUsers
                        onClose={(users) => {
                            this.setState({...this.state, addingUser: false}); 
                            
                        }}
                        group={this.props.currSpace}
                        userTypes={this.userTypes}
                    />
                }
                    
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

export default connect(mapStateToProps, mapDispatchToProps)(SpaceUserSettings)
