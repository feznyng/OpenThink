import React from 'react'
import {Card, Link, Typography, Grid, Divider} from '@material-ui/core';
import {ExpandMore, LocationOn, Lock, LockOpen} from '@material-ui/icons';
import {Public, VisibilityOff, EmojiObjects, Group,  Subject, Person} from '@material-ui/icons';

export default function InfoCard(props) {
    const {parent, extended} = props;
    const [state, setState] = React.useState({
        expanded: extended
    })
    return (
        <Card style={{textAlign: 'left'}}>
            <div style={{margin: 20}}>
                <Typography variant="h6">
                    About
                </Typography>
                <div style={{marginTop: 10}}>
                    {
                        parent.description.length > 0 &&
                        <div>
                            <Typography>
                                {parent.description.substring(0, state.expanded ? parent.description.length : 100)} {(!extended && parent.description.length > 100) && <span onClick={() => setState({...state, expanded: !state.expanded})}>{state.expanded ? <Link>...See Less</Link> : <Link>...See More</Link>}</span>}
                            </Typography>
                        </div>

                    }
                    
                    <div style={{marginTop: 20}}>
                        <div style={{marginBottom: 15}}>
                            {
                                parent.type === 'Public' &&
                                <div style={{display: 'flex'}}>
                                    <Public/> 
                                    <div style={{marginLeft: 10, marginTop: -5}}>
                                        <Typography variant="h6" >
                                            Public
                                        </Typography>
                                        <Typography variant="p">
                                            Anyone can find this {parent.project ? 'project' : 'group'} and create a post in it.
                                        </Typography>
                                    </div>
                                </div>
                            }
                            {
                                parent.type === 'Private' &&
                                <div style={{display: 'flex'}}>
                                    <VisibilityOff/> 
                                    <div style={{marginLeft: 10, marginTop: -5}}>
                                        <Typography variant="h6" >
                                            Private
                                        </Typography>
                                        <Typography variant="p">
                                            Only invitees can find this group and post in it. 
                                        </Typography>
                                    </div>
                                </div>
                            }
                        </div>
                        <div style={{marginBottom: 15}}>
                            {
                                parent.access_type === 'Open' &&
                                <div style={{display: 'flex'}}>
                                    <LockOpen/> 
                                    <div style={{marginLeft: 10, marginTop: -5}}>
                                        <Typography variant="h6" >
                                        Open
                                        </Typography>
                                        <Typography variant="p">
                                            Anyone can join this {parent.project ? 'project' : 'group'}.
                                        </Typography>
                                    </div>
                                </div>
                            }
                            {
                                parent.access_type === 'Closed' &&
                                <div style={{display: 'flex'}}>
                                    <Lock/> 
                                    <div style={{marginLeft: 10, marginTop: -5}}>
                                        <Typography variant="h6" >
                                        Closed
                                        </Typography>
                                        <Typography variant="p">
                                            People must request to join.
                                        </Typography>
                                    </div>
                                </div>
                            }
                        </div>
                        {
                            parent.address && 
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <LocationOn/> 
                                <div style={{marginLeft: 10}}>
                                    <Typography variant="h6">{parent.address}</Typography>
                                </div>
                            </div>
                        }
                        
                            
                        {
                            extended &&
                            <div style={{marginTop: 20}}>
                                <Grid container alignItems="center" style={{marginTop: 20}}>
                                    <Typography variant="p" style={{fontSize: '15px', marginLeft: '10px'}}> 
                                        <Person/> {parent.users.length.toString() + ' User' + (parent.users.length !== 1 ? 's' : '')}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem style={{marginLeft: '10px'}} />
                                    <Typography variant="p" style={{fontSize: '15px', marginLeft: '10px'}}> 
                                        <Subject/> {parent.posts.length.toString() + ' Post' + (parent.posts.length !== 1 ? 's' : '')}
                                    </Typography>
                                    {
                                        parent.space_id  &&
                                        <Divider orientation="vertical" flexItem style={{marginLeft: '10px'}} />

                                    }
                                    {
                                        parent.space_id &&
                                        <Typography variant="p" style={{fontSize: '15px', marginLeft: '10px'}}> 
                                            <Group/> {parent.subspaces.length.toString() + ' Subgroup' + (parent.subspaces.length !== 1 ? 's' : '')}
                                        </Typography>
                                            
                                    }
                                    {
                                        parent.address &&
                                        <React.Fragment>
                                        <Divider orientation="vertical" flexItem style={{marginLeft: '10px'}} />
                                        <Typography style={{fontSize: '15px', marginLeft: '10px'}}>
                                        <LocationOn/> {parent.address}
                                        </Typography>         
                                        </React.Fragment>
                                    }
                                    {
                                         (parent.tags && parent.tags.length > 0) || (parent.topics && parent.topics.length > 0) && 
                                        <React.Fragment>
                                        <Divider orientation="vertical" flexItem style={{marginLeft: '10px'}} />
                                        <Typography style={{fontSize: '15px', marginLeft: '10px'}}>
                                        <EmojiObjects/> {(parent.topics && parent.topics.length > 0) ? parent.topics[0] : parent.tags[0]}
                                        </Typography>         
                                        </React.Fragment>
                                    }
                                </Grid>
                                
                            </div>
                            
                        }
                    </div>
            
                </div>
            </div>
            
        </Card>    
    )
}
