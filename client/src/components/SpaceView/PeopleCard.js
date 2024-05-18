import { Avatar, Card, Tooltip, Typography } from '@material-ui/core';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import React from 'react';
import { useHistory } from "react-router-dom";
import UserIcon from '../User/UserIconOld';

export default function PeopleCard(props) {
    const history = useHistory();
    const {parent, seePeople} = props;
    const styleHeading = {
        fontSize: 14,
        textAlign: "left",
        marginTop:'-10px',
    }
    const styleIcon = {
        fontSize: 14,
        textAlign: "left",
        paddingBottom:'15px',
        marginTop:'5px'
    }
    const leads = parent.users.filter(e =>  e.type === "Creator" || e.type === 'Lead' || e.type === "Moderator");
    const contribs = parent.users.filter(e =>  e.type === "Contributor" || e.type === "Member");
    const followers = parent.users.filter(e =>  e.type === "Follower");

    return (
        <Card style={{paddingBottom: 20, textAlign: 'left'}}>
            <div style={{marginLeft: 15, marginTop: 15}}>
                <Typography style={{marginTop: '5px'}} variant="h6">
                    People
                </Typography>

            <div style={{marginTop: '20px'}}>
                <Typography style={styleHeading}>Moderators</Typography>   
                    <AvatarGroup 
                        max={8} 
                        style={styleIcon}
                        onClick={seePeople}
                    >
                            
                            {
                                leads.map((e, i) => {
                                    const name = (e.firstname + " " + e.lastname);
                                    return (
                                        <Tooltip
                                            title={name}
                                        >
                                            <Avatar>
                                                <UserIcon user={e} displayStatus/>
                                            </Avatar>
                                           
                                        </Tooltip>
                                    ) 
                                })
                            }

                    </AvatarGroup>

                    
                                    
                    
                    {
                        contribs.length !== 0 &&
                        <div>
                            <Typography style={styleHeading}>Members</Typography>
                            <AvatarGroup 
                                max={8} 
                                style={styleIcon}
                                onClick={seePeople}
                            >
                                {
                                    contribs.map((e, i) => {
                                        const name = (e.firstname + " " + e.lastname);
                                        return (
                                            <Tooltip
                                                title={name}
                                            >
                                                <Avatar>
                                                    <UserIcon user={e}/>
                                                </Avatar>
                                            </Tooltip>
                                        ) 
                                    })
                                }

                            </AvatarGroup>
                        </div>
                    }
                    


                
                
                {
                        followers.length !== 0 &&
                        <div>
                            <Typography style={styleHeading}>Followers</Typography>
                            <AvatarGroup 
                                max={8}  
                                style={styleIcon}
                                onClick={seePeople}
                            >
                                {
                                    followers.map((e, i) => {
                                        const name = (e.firstname + " " + e.lastname);
                                        return (
                                            <Tooltip
                                                title={name}
                                            >
                                                <Avatar>
                                                    <UserIcon user={e}/>
                                                </Avatar>
                                            </Tooltip>
                                        ) 
                                    })
                                }


                            </AvatarGroup>
                        </div>
                }
            </div>
            </div>
            
        
        </Card>
    )
}
