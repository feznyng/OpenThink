import React, { Component } from 'react'
import {setTopicList, setSelectedPost, pushPostStack} from '../../actions/postActions'
import {connect} from 'react-redux';
import {getParentPosts} from '../../actions/orgActions';
import store from '../../Store';
import watch from 'redux-watch';
import {Typography, Tabs, Tab} from '@material-ui/core';
import PostView from './PostViewOld';
import PostNavMenu from './PostNavMenu';
import {getImage} from '../../actions/S3Actions';
export class Posts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currPost: null,
            view: 0,
            selected_post: null
        }
        this.imageURL = (this.props.group.bannerpic && this.props.group.bannerpic !== '') ? (getImage(this.props.group.bannerpic)) : ('https://placeimg.com/1000/300/nature');
    }
    componentDidMount() {
        getParentPosts(this.props.group, {type: 'Topic'}).then(posts => {    
            const topics = posts.filter(p => !p.parentcount || p.parentcount === 0).map(p => ({...p, children: [], open: false}))
            this.props.setTopicList(topics);
        })
    }

    componentWillUnmount() {
        this.props.setTopicList([]);
        this.props.setSelectedPost(null);
    }

    componentDidUpdate(prevProps) {
        if (this.props.selected_post && this.props.selected_post !== prevProps.selected_post) {
            this.setState({
                ...this.state,
                selected_post: this.props.selected_post.post_id
            })
        }
    }

    render() {
        return (
            <div>
                <div style={{display: 'flex', justifyContent: 'center', boxShadow: 'none',}}>
                    {
                        this.state.view === 0 && 
                        <div style={{width: '100%', maxWidth: 700, flexShrink: 0}}>
                            {
                                this.props.match.params.postID ? 
                                <div>
                                    <PostNavMenu
                                        parent={this.props.group}
                                        parentType={'space'}
                                        id={this.props.group.space_id}
                                        backgroundImage={this.imageURL}
                                    />
                                    <PostView
                                        match={this.props.match}
                                        parent={this.props.group}
                                        post_id={this.props.match.params.postID}
                                    />
                                </div>
                                :
                                <div>
                                    Group Home
                                </div>
                            }
                            
                        </div>
                    }
                    {
                        this.state.view === 1 && 
                        <div>
                            Managing
                        </div>
                    }
                </div>
                
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    const {topics, selected_post} = state.postActions;
    return {topics, selected_post};
}
  
const mapDispatchToProps = {
    setTopicList, 
    setSelectedPost,
    pushPostStack
}

export default connect(mapStateToProps, mapDispatchToProps)(Posts)