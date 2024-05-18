import { Card } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import React, { Component } from 'react';
import Sticky from 'react-sticky-el';
import { getImage } from '../../actions/S3Actions';
import store from '../../Store';
import PostCreator from '../Post/PostCreatorOld';
import PostSpace from '../Post/PostSpace';
import AlliedGroupsCard from '../Space/AlliedGroupsCard';
import InfoCard from '../Space/InfoCard';
import PeopleCard from './PeopleCard';

const styles = (theme) => ({
    tab: {
        maxWidth: 100,
        minWidth: 100,
        width: 100,
        padding: 0,
        margin: 0,
        textTransform: 'none'
    },
    subHeading: {
        fontSize: theme.typography.pxToRem(16),
    },
})

class SpaceHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 1,
            offset: 0,
        }
        this.imageURL = (this.props.org.bannerpic && this.props.org.bannerpic !== '') ? (getImage(this.props.org.bannerpic)) : ('https://placeimg.com/1000/300/nature');
        this.handleGraphInteraction = (e, t) => {
            if (e === 'create') {
                this.setState({...this.state, open: true});
            }
        }
        this.ref = React.createRef();
        this.mainRef = React.createRef();
        const thisUser = store.getState().userActions.userInfo;
        const projectUser = thisUser ? this.props.org.users.find(u => u.user_id === thisUser.user_id) : null;
        this.canAdd = 
        thisUser && (
        (this.props.org.type === 'Private' && projectUser && projectUser.accepted && (projectUser.type !== 'Viewer' && projectUser.type !== 'Follower'))
        ||
        (this.props.org.type === 'Public View' && projectUser)
        ||
        (this.props.org.type === 'Public'));

    }

    componentDidUpdate(prevProps) {
        if (this.props.org.bannerpic !== prevProps.org.bannerpic) {
            this.imageURL = (this.props.org.bannerpic && this.props.org.bannerpic !== '') ? (getImage(this.props.org.bannerpic)) : ('https://placeimg.com/1000/300/nature');
        }
    }

    render() {
        return (
            <div>
                {
                    (this.props.width === 'xs' || this.props.width === 'sm') ? 
                    <div style={{width: '100%'}}>
                        {
                            this.canAdd &&
                            <Card style={{marginTop: '10px', marginBottom: '10px'}}>
                                <PostCreator  
                                    location={'Parent'}  
                                    onClose={() => this.setState({...this.state, open: false})} 
                                    opened={this.state.open} 
                                    parentType="Space" 
                                    parent={this.props.org} 
                                    inParent 
                                    noButtons
                                    updateParent={() => {
                                        this.props.onChangeListener('Post')
                                    }}
                                    {...this.props.postCreatorProps}
                                />
                            </Card>
                        }
                        <PostSpace  
                            onPostClicked={this.props.onChangeListener} 
                            parentType="organization" 
                            relations={this.props.org.relations} 
                            id={this.props.org.space_id} 
                            parent={this.props.org} 
                            passedPosts={this.props.org.posts}
                            onGraphInteract={this.handleGraphInteraction}
                        />       
                    </div>
                    :
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center'}} ref={this.ref}>
                        <div style={{display: 'flex', maxWidth: 900, flexGrow: 1}}>
                            <div style={{flexShrink: 0, flexGrow: 0, maxWidth: 575, width: '100%'}}>
                                <div style={{marginRight: 20}}>
                                    {
                                        this.canAdd &&
                                        <Card style={{marginTop: '10px', marginBottom: '10px', padding: 5}}>
                                            <PostCreator  
                                                location={'Parent'}  
                                                onClose={() => this.setState({...this.state, open: false})} 
                                                opened={this.state.open} 
                                                parentType="Space" 
                                                parent={this.props.org} 
                                                inParent 
                                                noButtons
                                                updateParent={() => {
                                                    this.props.onChangeListener('Post')
                                                }}
                                            />
                                        </Card>
                                    }
                                    <PostSpace  
                                        onPostClicked={this.props.onChangeListener} 
                                        parentType="organization" 
                                        relations={this.props.org.relations} 
                                        id={this.props.org.space_id} 
                                        parent={this.props.org} 
                                        passedPosts={this.props.org.posts}
                                        onGraphInteract={this.handleGraphInteraction}
                                    />
                                </div>
                            </div>
                            {
                                !(this.props.width === 'xs' || this.props.width === 'sm') && 
                                <div style={{width: 375, marginTop: 10, minHeight: 1000, position: 'relative'}}>
                                
                                        <div style={{width: '100%'}}>
                                            <div style={{marginBottom: 20}}>
                                                <InfoCard
                                                    parent={this.props.org}
                                                />
                                            </div>
                                            <Sticky stickyStyle={{top: 120}} topOffset={-120}>
                                                <div style={{marginBottom: 5}}>
                                                    {
                                                        this.props.org.project ? 
                                                        <AlliedGroupsCard
                                                            space={this.props.org}
                                                        />
                                                        :
                                                        <PeopleCard 
                                                            parent={this.props.org}
                                                            seePeople={() => {}}
                                                        />
                                                        
                                                    }
                                                </div>
                                            </Sticky>
                                        </div>
                                </div>
                            }
                        </div>
                    </div>
                    
                }
            </div>
        )
    }
}

export default  withStyles(styles)(SpaceHome)
