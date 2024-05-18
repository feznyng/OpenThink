import React, { Component } from 'react';
import PostNavMenu from './PostNavMenu';
import PostCard from './PostCardOld';
import PostTabs from './PostTabs';
import {deletePost, getposts, getPostByID} from '../../actions/postActions';
import {getOrganizationbyID, setOrigin} from '../../actions/orgActions';
import {pushPostStack, popPostStack, updatePost} from '../../actions/postActions';
import {connect} from "react-redux";
import store from '../../Store';
import { IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@material-ui/core';
import {createNotification} from '../../actions/notificationActions';
import {Skeleton} from '@material-ui/lab';
import { Edit, Done, Delete, Close } from '@material-ui/icons';
import {deleteImage} from '../../actions/S3Actions';
import withWidth from '@material-ui/core/withWidth';
import Tags from '../Shared/Tags/Tags';

class PostView extends Component {    
    constructor(props) {
        super(props);
        this.state = {
            post: undefined,
            posts: [],
            relations: [],
            parent: undefined,
            editing: this.props.history && this.props.history.location.state && this.props.history.location.state.editing,
            open: false,
            parentType: 'project',
            preview: false,
            tags: [],
            tabIndex: 0,
            loading: false,
            loadingRelations: false,
        };
        this.escFunction = this.escFunction.bind(this);
        this.postViewRef = React.createRef();
        this.handleChangeListener = (e, i) => {
            if (e === 'Completed Post' || e.type === 'newPost') {
                this.refreshRelations();
            }
            if (this.props.onChange) {
                this.props.onChange(e)
            }
        
            this.getPost(this.state.parent.project_id ? this.state.parent.project_id : this.state.parent.space_id, this.state.post.post_id, true);            
        }

        this.editPost = (update) => {
            this.setState({
                ...this.state,
                editing: !this.state.editing,
            });
            const thisUser = store.getState().userActions.userInfo  ? store.getState().userActions.userInfo.user_id : null;
            if (update.post_id) {
                if (update.users) {
                    update.users.forEach(u => {
                        if (u.edits && u.user_id !== thisUser) {
                            createNotification(u.user_id, {
                                type: 'postEdit',
                                read: false,
                                user_id: u.user_id,
                                project: this.state.parent.project_id ? true : false,
                                space: this.state.parent.space_id ? true : false,
                                post_id: update.post_id, 
                            });
                        }
                    });
                }
                
                const postStack = store.getState().postActions.postStack;
                postStack[postStack.length - 1] = update;
                this.setState({
                    ...this.state,
                    editing: !this.state.editing,
                    post: update,
                }, () => {
                });
            } else {
                this.setState({
                    ...this.state,
                    editing: !this.state.editing,
                });
            }
        };

        this.onPostClicked = ({type, ...info}) => {
            switch(type) {
                case 'relationDeletion': {
                    this.refreshRelations();
                }
                case 'postDeletion': {
                    this.refreshRelations();
                }
            }
        }

        this.updateOtherPost = () => {
            const deletedTags = [];
                const createdTags = [];
                this.state.post.tags.forEach(e => {
                    if (this.state.tags.indexOf(e.info) < 0) {
                        deletedTags.push(e);
                    }
                });

                this.state.tags.forEach(e => {
                    if (!this.state.post.tags.find(t => t.info === e)) {
                        createdTags.push(e);
                    }
                });

                const newPost = {
                    ...this.state.post, 
                    deletedTags: deletedTags,
                    createdTags: createdTags,
                };
                let postID;
                let parentID;
                let projectType; 

                if (!this.props.match) {
                    postID = this.props.postID;
                    parentID = this.props.parentID;
                    projectType = this.props.projectType;
                } else {
                    window.scrollTo(0, this.props.scrollHeight - 55);
                    postID = this.props.match.params.postID;
                    parentID = this.props.match.params.parentID;
                    projectType = this.props.match.params.parentType;
                }
                this.props.updatePost(newPost).then(() => {
                        this.props.getPostByID('spaces', parentID, postID).then(p => {
                            this.setState({
                                ...this.state,
                                post: p.post,
                                editing: false,
                            })
                        }) 
                })
                
        }

        this.handleClose = (val) => {
            if (val) {
                if (this.props.onChange) {
                    this.props.onChange({type: 'postDeletion', e: this.state.post});
                }

                this.props.deletePost(this.state.parent, this.state.post).then(() => {
                });
                this.props.popPostStack();
                if (this.state.post.type !== 'Media' && this.state.post.type !== 'Media') {
                    const el = document.createElement( 'html' ); 
                    el.innerHTML = this.state.post.body;
            
                    for (let i = 0; i < el.getElementsByTagName( 'img' ).length; ++i) {
                        deleteImage(el.getElementsByTagName( 'img' )[i].attributes[0].nodeValue);
                    }
                } else if (this.state.post.type === 'Media') {
                    JSON.parse(this.state.post.info).forEach(e => {
                        deleteImage(e);
                    })
                }
                this.setState({
                    ...this.state,
                    open: false,
                    post: {
                        ...this.state.post,
                        original_deleted: true,
                        title: '[Deleted]',
                        body: '[Deleted]',
                    },
                    editing: false,
                }, () => {
                    if (this.props.match) {
                        this.props.pushPostStack(this.state.post);
                    }
                });
            } else {
                this.setState({
                    ...this.state,
                    open: false,
                    editing: false,
                });
            }
        };
    this.refreshRelations = () => {
        this.setState({...this.state, loadingRelations: true}, () => {
            this.props.getposts(this.state.parentType + 's', this.state.parent.project_id ? this.state.parent.project_id : this.state.parent.space_id, this.state.post.original_post_id).then(e => {
                this.setState({
                    ...this.state, 
                    posts: e,
                    loadingRelations: false,
                });
            });
        })
        
    };

        this.refreshPost = () => {
            let postID;
            let parentID;
            if (this.props.postID) {
                postID = this.props.postID;
                parentID = this.props.parentID;
            
            } else {
                window.scrollTo(0, this.postViewRef.current.offsetTop - 120);
                postID = this.props.match.params.postID;
                parentID = this.props.match.params.spaceID;
            }
            this.setState({
                ...this.state,
                parent: this.props.parent,
                parentType: this.props.parent.space_id ? 'space' : 'project',
                preview: this.props.match ? false : true,
                loading: true,
            }, () => {
                this.getPost(parentID, postID)
            });
        }
    }


    getPost(parentID, postID, refresh) {
        let detailedPost;
        this.setState({
            ...this.state, 
            loading: true,
        }, () => {
            this.props.getPostByID(this.state.parentType + 's', parentID, postID).then((e) => {
                detailedPost = e.post;
                const index = store.getState().postActions.postStack.indexOf(store.getState().postActions.postStack.find(e => e.post_id.toString() === postID));
                if (index < 0) {
                    if (this.props.match && !refresh)              
                        this.props.pushPostStack(detailedPost);                
                } else {
                    for (let i = store.getState().postActions.postStack.length - 1; i > index; i--) {
                        this.props.popPostStack();
                    }
                }    
                let tabIndex = 0;
              
                this.setState({
                    post: {
                        ...detailedPost,
                        deletedTags: [],
                        createdTags: [],
                    },
                    posts: e.relations,
                    tags: detailedPost.tags.map(e => e.info),
                    tabIndex: tabIndex,
                    loading: false,
                });

            });
        })
        return detailedPost;
    }



    componentDidMount(props) {
        this.refreshPost();        
        if (this.props.location && this.props.location.state && this.props.location.state.from) {
            this.props.setOrigin(this.props.location.state.from);
        }
        document.addEventListener("keydown", this.escFunction, false);
    }

    componentDidUpdate(prevProps) {
        if (
            (this.props.match && this.props.match.params.postID && prevProps.match.params.postID !== this.props.match.params.postID) || 
            (!this.state.loading && this.props.postID && this.state.post && (this.props.postID.toString() !== this.state.post.post_id.toString()))) {
            
            this.refreshPost();
        }
        
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.escFunction, false);
      }

    escFunction(event){
        
        if(event.keyCode === 69 && event.ctrlKey) {
            event.preventDefault();
            this.setState({
                ...this.state,
                editing: true
            })
        } else if (event.keyCode === 27) {
            event.preventDefault();
            this.setState({
                ...this.state,
                editing: false
            })
        }
    }


    render() {
        return (
            <div ref={this.postViewRef}>
                {
                    this.state.loading &&
                    <div style={{marginTop: '-50px'}}>
                        <Skeleton style={{height: 500, marginTop: -120}}/>
                        <Skeleton style={{height: 80, marginTop: -90}}/>
                        
                            <div style={{marginTop: -40}}>
                                {   
                                    [1, 2, 3, 4, 5, 6, 7].map(() => (
                                        <Skeleton style={{height: 200, marginBottom: -50}}/>
                                    ))
                                }
                            </div>
                            
                        
                    </div>
                }
                {
                    this.state.post && !this.state.loading &&
                    <div style={{visibility: this.state.editing && this.props.postID ? 'none' : ''}}>
                       <div>
                            {
                                this.state.post.type !== 'Media' && this.state.post.type !== 'Link' && !(this.state.editing && this.props.postID) && 
                                <div>
                                    <PostCard
                                        relations={this.state.posts}
                                        updateParent={this.handleChangeListener}
                                        parent={this.state.parent}
                                        onPostClicked={(e) => {
                                            
                                            if (this.props.onChange) {
                                                this.props.onChange(e)
                                            }
                                        }} 
                                        {...this.props.postProps}
                                        detailed
                                        disableHover
                                        inView
                                        post={this.state.post} 
                                        parentType={this.state.parentType} 
                                        refreshPost={this.refreshRelations}
                                        canEdit={store.getState().userActions.userInfo && this.state.post.type !== 'Poll' && !this.state.post.original_deleted &&  
                                            this.state.post.post_owner_id === store.getState().userActions.userInfo.user_id}
                                        onUpdate={this.props.onUpdate}
                                        onPostClicked={(e) => {
                                            
                                            if (this.props.onChange) {
                                                this.props.onChange(e)
                                            }
                                        }}
                                    />
                                </div>
                            }
                            {
                                (this.state.post.type === 'Media' || this.state.post.type === 'Link') &&
                                <div>
                                    <PostCard 
                                    updateParent={this.handleChangeListener}

                                    onPostClicked={(e) => {
                                                if (this.props.onChange) {
                                                    this.props.onChange(e)
                                                }
                                            }} padding={this.state.editing ? 50 : 0} focused={this.state.editing} detailed={!this.state.editing} post={this.state.post} parentType={this.state.parentType} parent={this.state.parent}/>
                                    {
                                        
                                        this.state.editing ? 
                                            <div style={{position: 'absolute', color: 'black', marginTop: '-60px', right: '10px', width: '95%'}}>
                                            <div style={{float: 'left'}}>
                                                <Tags tags={this.state.tags} onChange={(tags) => {
                                                    this.setState({
                                                        ...this.state,
                                                        tags: tags,
                                                    })
                                                }}></Tags>
                                            </div>
                                            <div style={{float: 'right'}}>
                                                <Button color="error" variant="outlined" onClick={() => this.setState({...this.state, open: true})}>
                                                    <Delete/>  Delete 
                                                </Button>
                                                <IconButton onClick={this.updateOtherPost} >
                                                    <Done/>
                                                </IconButton>
                                                <IconButton onClick={() => {
                                                    this.setState({
                                                        ...this.state,
                                                        tags: this.state.post.tags,
                                                        editing: false,
                                                    })}} >
                                                    <Close/>
                                                </IconButton>
                                            </div>
                                            </div>                                          
                                            :
                                            (
                                                !this.state.post.original_deleted 
                                                &&
                                                store.getState().userActions.userInfo
                                                &&  
                                                this.state.post.post_owner_id === store.getState().userActions.userInfo.user_id
                                                &&
                                                    <IconButton onClick={this.editPost} style={{position: 'absolute', color: 'black', marginTop: '-47px', right: '50px'}}>
                                                        <Edit/>
                                                    </IconButton>
                                            )
                                            
                                    }
                                </div>
                               
                            }

                            <PostTabs 
                                post={this.state.post} 
                                relations={this.state.posts}
                                comments={this.state.post.comments}
                                parent={this.state.parent}
                                parentType={this.state.parentType}
                                onChangeListener={this.handleChangeListener}
                                tabIndex={this.state.tabIndex}
                                loading={this.state.loadingRelations}
                                visualization={this.props.visualization}
                                onPostClicked={this.onPostClicked}
                                selecting={this.props.selecting}
                            />
                        </div>
                    </div>
                    
                }
               
                    <Dialog
                        open={this.state.open}
                        onClose={(this.handleClose)}
                        aria-labelledby="responsive-dialog-title"
                    >
                        <DialogTitle id="responsive-dialog-title">Delete Post</DialogTitle>
                        <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete your post? It will be removed from all locations and it cannot be restored. 
                        </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={() => this.handleClose(true)} color="primary" autoFocus>
                            Yes
                        </Button>
                        <Button autoFocus onClick={() => this.handleClose(false)} color="primary">
                            No
                        </Button>
                        </DialogActions>
                    </Dialog>
                </div>
        )
    }
}
const mapStateToProps = () => {
    return {};
  }
  
  const mapDispatchToProps = {
    getPostByID,
    pushPostStack,
    popPostStack,
    deletePost,
    getposts,
    getOrganizationbyID,
    updatePost,
    setOrigin,
  }
  
export default withWidth()(connect(mapStateToProps, mapDispatchToProps)(PostView))

