import React from 'react';
import {
  Card, 
  CardHeader, 
  CardMedia, 
  CardContent, 
  IconButton, 
  Typography, 
  Chip, 
  Badge, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Snackbar,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Divider,
  withWidth,
  Modal,
  CardActionArea,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import PinIcon from '../Shared/PinIcon';
import {
  Reply, 
  ThumbUp, 
  Comment, 
  Close, 
  Share,
  MoreVert, 
  QuestionAnswerOutlined, 
  QuestionAnswer,
  ImportContacts,
  Edit,
  Delete,
  ExpandMore,
  ExpandLess,
  MenuOpen,
  ArrowUpward,
  Done,
  Favorite,
  CreateNewFolder,
  LinkOff,
  Info,
} from '@material-ui/icons'
import PostEditor from './Editor/PostEditor'
import {Link} from 'react-router-dom';
import PostIcon from './PostIconOld';
import { getImage } from '../../actions/S3Actions';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import PostNotifications from './PostNotifications';
import Discussion from './Discussion/Discussion';
import { 
  votePost, 
  removeVotePost, 
  deletePost, 
  deleteRelation, 
  updatePost, 
  updateParentPost, 
  markAnswer, 
  deleteAnswer,
  completePost,
  getPostFollowers,
  makeRelation,
  removePost
} from '../../actions/postActions';
import {getParentUsers} from '../../actions/orgActions';
import {getComments} from '../../actions/commentActions'
import SlideShow from './Types/SlideShow';
import store from '../../Store';
import { addPostUsers, deletePostUsers } from '../../actions/postUserActions';
import { deleteImage} from '../../actions/S3Actions';
import {baseURL} from '../../actions/index';
import { withRouter } from 'react-router';
import {timeAgo} from '../../utils/dateutils';
import EventFeature from './Types/EventFeature';
import PollFeature from './Types/PollFeature/PollFeature';
import ErrorBoundary from '../Shared/ErrorBoundary'
import ImagePreview from '../Image/ImagePreview';
import FileSystem from '../Visualization/FileSystem';
import UserIcon from '../User/UserIconOld';
import { Collapse } from '@material-ui/core';
import SpacePreview from '../Space/SpacePreviewButton';
import PostPreview from './PostPreviewOld';
import Editor from './Editor/PostTipTap';

/**
 * Card used to display posts including title, icon, related posts, comments, likes, share, user, and date.
 */


class MainCard extends React.Component {

      constructor(props) {
        super(props)
        this.postContext = this.props.postContext;
        this.inParent = this.props.inParent;
        this.myRef = React.createRef() 
        this.ref = React.createRef()  
        this.inputElement = React.createRef()
        this.link = '';
        this.focused = this.props.focused;
        this.length = props.length;
        const post = {
            ...this.props.post,
            tags: this.props.post.tags ? this.props.post.tags : [], 
        }
        this.state = {
          post,
          votes: this.props.post.upvote === null ? 0 : this.props.post.upvote,
          open: false,
          liked: this.props.post.votestatus === null ? false : this.props.post.votestatus,
          anchorEl: null,
          notificationSettings: {
            newRelations: false,
            newComments: false,
            newUpdates: false,
          },
          newPost: JSON.parse(JSON.stringify(post)),
          openNotifications: false,
          images: [],
          links: [],
          relationDeleteOpen: false,
          postRemoveOpen: false,
          truncated: props.truncated ? props.truncated : true,
          complete: false,
          showComments: false,
          commentLoading: false,
          comments: this.props.post.comments ? this.props.post.comments : undefined,
          parent: this.props.post.project_id ? {project_id: this.props.post.project_id} : {space_id: this.props.post.space_id},
          editingPost: false,
          showActions: this.props.detailed && !this.props.focused,
          previewText: '',
        };
        this.imageMap = new Map();
        this.parentPost = this.props.parentPost;
        this.isParentOwner = this.props.isParentOwner;
        this.currUser = store.getState().userActions.userInfo;
        this.isRelationOwner = this.currUser && this.props.post.relation_owner_id && this.props.post.relation_owner_id === store.getState().userActions.userInfo.user_id;
        this.isOwner = this.currUser && store.getState().userActions.userInfo && this.props.post.post_owner_id === store.getState().userActions.userInfo.user_id;
        this.executeScroll = () => this.myRef.current.scrollIntoView();
        this.mod = this.currUser && (this.props.parent && this.props.parent.users) ? this.props.parent.users.find(e => e.user_id === store.getState().userActions.userInfo.user_id) : undefined;    
        
        this.updatePost = (update) => {
          const el = document.createElement( 'html' );
          if (update) {
            if (this.props.onUpdate) {
              this.props.onUpdate(this.state.newPost);
            }
            if (this.state.newPost.delta) {
              const images = this.state.newPost.delta.content.filter(d => d.type === 'customImage');
              for (let i = 0; i < images.length; ++i) {
                  const image = this.imageMap.get(images[i].attrs.url);
                  if (image) {
                      image.read = true;
                  }
              }
              Array.from(this.imageMap, ([name, value]) => ({name, value})).filter(e => !e.value.read).forEach(i => {
                  deleteImage(i.name);
              });
            }
            this.imageMap = new Map();


            const deletedTags = [];
            const createdTags = [];

            if (this.state.post.tags) {
              this.state.post.tags.forEach(e => {
                if (this.state.newPost.tags.find(t => t.info === e.info) < 0) {
                    deletedTags.push(e);
                }
              });
              if (this.state.newPost.tags) {
                this.state.newPost.tags.forEach(e => {
                  if (!this.state.post.tags.find(t => t.info === e.info)) {
                      createdTags.push(e);
                  }
                });
              }
            } else if (this.state.newPost.tags) {
              this.state.newPost.tags.forEach(e => {
                createdTags.push(e);
              });
            }
            
            this.state.newPost.createdTags = createdTags;
            this.state.newPost.deletedTags = deletedTags;

            if (this.state.newPost.users && this.state.newPost.users.length > 0) {
                addPostUsers(this.props.parent, this.state.newPost, this.state.newPost.users ? this.state.newPost.users : []);
            } else {
                deletePostUsers(this.props.parent, this.state.newPost);
            }
            const post = this.state.newPost;
            this.props.updatePost(post).then(() => {
              this.processPost(post);
            })

          } else {
            //if cancelling update
            el.innerHTML = this.state.post.body;
            el.innerHTML = el.innerHTML.replace(/&amp;/g, "&");
            const images = el.getElementsByTagName( 'img' );
            for (let i = 0; i < images.length; ++i) {
                this.imageMap.get(images[i].src).read = true;
            }

            Array.from(this.imageMap, ([name, value]) => (value)).filter(e => !e.read).forEach(i => {
                deleteImage(i.url);
            });
            this.imageMap = new Map();
            this.processPost(this.state.post);
          }

          this.setState({
            ...this.state,
            editingPost: false,
          })

          this.processPost(this.state.post);
        }
        
        this.handleCardActions = (e) => {          
          this.setState({
            ...this.state,
            anchorEl: null,
            relationDeleteOpen: false,
            postRemoveOpen: false,
            editingPost: false,
          });

          switch(e) {
            case 'removeRelation':
              this.props.deleteRelation(this.state.post.project_id ? 'projects' : 'spaces', this.state.post.relation_id).then(()=> {  
                this.props.onPostClicked({type: 'relationDeletion', e: {source: this.state.post.post1_id, target: this.state.post.post2_id}});              
              })
              break;
            case 'removePost':
              this.props.removePost(this.props.parent, this.state.post).then(() => {
                const deletedPost = {
                  ...this.state.post,
                  original_deleted: true,
                  title: '[Deleted]',
                  body: '[Deleted]',
                  delta: '[Deleted]'
                }
                if (this.props.goBack)
                  this.props.history.goBack();
                else {
                  this.props.onPostClicked({type: 'postDeletion', post: deletedPost});
                  this.setState({
                    ...this.state,
                    post: deletedPost,
                    postRemoveOpen: false,
                  });
                }
                
              });
              break;
            case 'wiki':

                this.props.updateParentPost(this.props.parent, {pinned: this.state.post.pinned, wiki: !this.state.post.wiki, post_id: this.state.post.post_id}).then(()=> {
                  this.setState({
                    ...this.state,
                    post: {
                      ...this.state.post,
                      wiki: !this.state.post.wiki
                    }
                  });
                });
                break;
             case 'pin':

                this.props.updateParentPost(this.props.parent, {wiki: this.state.post.wiki, pinned: !this.state.post.wiki, post_id: this.state.post.post_id}).then(()=> {
                  this.setState({
                    ...this.state,
                    post: {
                      ...this.state.post,
                      pinned: !this.state.post.pinned
                    }
                  })
                })
                break;
            default:
              break;
          }
        }

        this.likePost = () => {
          
          if (this.state.liked) {
            this.props.removeVotePost((this.state.post.project_id ? 'projects' : 'spaces'), this.state.post.original_post_id, (this.state.post.project_id ? this.state.post.project_id : this.state.post.space_id)).then(() => {
              this.setState({
                ...this.state,
                votes: parseInt(this.state.votes) - 1,
                liked: false
              });
            });
          } else {
            this.props.votePost((this.state.post.project_id ? 'projects' : 'spaces'), this.state.post.original_post_id, (this.state.post.project_id ? this.state.post.project_id : this.state.post.space_id)).then(() => {
              this.setState({
                ...this.state,
                votes: parseInt(this.state.votes) + 1,
                liked: true
              });
            });
            
          }
          
        };

        this.sharePost = () => {
          this.handleClick();
          navigator.clipboard.writeText(`${window.location.origin}/${
            this.state.parent.project_id ? `project/${this.state.parent.project_id}` : `space/${this.state.parent.space_id}`
          }/post/${this.state.post.post_id}`);
        }


        this.handleClose = (event, reason) => {
          event.preventDefault();
          if (reason === 'clickaway') {
            return;
          }
          this.setState({
            ...this.state,
            open: false,
          })
        }

        this.handleClick = () => {
          this.setState({
            ...this.state,
            open: true,
          })
        };

        this.handleCloseNotes = () => {
          this.setState({
            ...this.state,
            openNotifications: false,
          })
        };
    
        this.handleOpenNotes = () => {
          this.setState({
            ...this.state,
            openNotifications: true,
          })
        };
    
        this.handleChangeNotes = (event) => {  
          this.setState({
            ...this.state,
            notificationSettings: event.target.value
          })
        }

        this.checkNotification = (type) => {
          switch (type) {
            case 'Edits': 
              return this.state.notificationSettings.newUpdates;
            case 'Relations': 
              return this.state.notificationSettings.newRelations;
            case 'Discussion': 
              return this.state.notificationSettings.newComments;
            default: 
              return false;
          }
        };

        this.getComments = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.setState({
            ...this.state, 
            showComments: !this.state.showComments,
            commentLoading: !this.state.commentLoading
          }, () => {
            if (this.state.showComments) {
              getComments(
                this.state.post.project_id ? {project_id: this.state.post.project_id} : {space_id: this.state.post.space_id}, 
                this.state.post).then((e) => {
               let parentType = 'projects'
               let id = this.state.parent.project_id;
               if (this.state.parent.space_id) {
                 parentType = 'spaces';
                 id = this.state.parent.space_id;
               }
               getParentUsers(id, parentType).then((users) => {
                 
                 getPostFollowers(this.state.parent, this.state.post.post_id).then(followers => {
                   this.setState({
                     ...this.state, 
                     showComments: true,
                     comments: e,
                     commentLoading: false,
                     parent: {...this.state.parent, users: users},
                     post: {...this.state.post, followers: followers}
                   });
                 })
                 
               })
             })
            }
            
          });
          
          
          
        }

        this.processPost = (post) => {
          const el = document.createElement( 'html' );
          const previewEL = document.createElement( 'html' );

          el.innerHTML = post.body;
          previewEL.innerHTML = post.body;

          const imgs = el.getElementsByTagName( 'img' );
          const blockquotes = el.getElementsByTagName( 'blockquote' );
          const links = el.getElementsByTagName( 'a' );
          const previewImgs = previewEL.getElementsByTagName( 'img' );
          
          const temp = [];

          for (let i = 0; i < imgs.length; i++) {
            const imageURL = getImage(previewImgs[i].attributes[0].nodeValue);
            this.imageMap.set(previewImgs[i].attributes[0].nodeValue, {url: imageURL, read: false});
            temp.push(imageURL);
            previewImgs[i].parentNode.removeChild(previewImgs[i]);
            imgs[i].setAttribute('src', imageURL);
            imgs[i].style.width = '100%';
            imgs[i].style.objectFit = 'contain';
          }

          const tempLinks = [];
          for (let i = 0; i < links.length; i++) {
            tempLinks.push(links[i].href)
          }

          for (let i = 0; i < blockquotes.length; i++) {
            blockquotes[i].style = "border-left: solid; border-width: 2px; padding-left: 5px; border-color: grey" 

          }

          this.setState({
            post,
            newPost: JSON.parse(JSON.stringify(post)),
            editingPost: false,
            previewText: previewEL.innerHTML,
            actualText: el.innerHTML.replace(/&amp;/g, "&"),
            images: temp,
            links: tempLinks
          }, () => {
            const element = this.ref.current;
            let overflowing; 
            if (element) {
              overflowing = element.offsetHeight < element.scrollHeight
            }
            this.setState({
              ...this.state, 
              overflowing,
              truncated: overflowing
            })
          });
          
        }
    }

    componentDidUpdate(prevProps) {
      if (prevProps !== this.props) {
        if (this.props.post.original_deleted || this.props.post.deleted) {
          this.props.post.body = "[Deleted]"
          this.props.post.title = "[Deleted]"
        }
        
        
        this.setState({
          ...this.state,
          post: this.props.post,
          relations: this.props.relations,
        }, () => this.processPost(this.props.post));
        
      }
      
    }

      componentDidMount(prevProps) {
        if (prevProps !== this.props) {
          if (this.props.post.original_deleted || this.props.post.deleted) {
            this.props.post.body = "[Deleted]"
            this.props.post.title = "[Deleted]"
          }
          this.processPost(this.props.post);
        }
      }

      render() {
        const body = (
          <React.Fragment>
            <CardHeader
              avatar={
                  <UserIcon size={35} hide user={{profilepic: this.state.post.profilepic, firstname: this.state.post.firstname, lastname: this.state.post.lastname, user_id: this.state.post.post_owner_id}}/>
              }
              title={
                !this.state.post.original_deleted ?
                  <div style={{maxWidth: 150}} onMouseEnter={() => this.setState({...this.state, hoverAuthor: true})} onMouseLeave={() => this.setState({...this.state, hoverAuthor: false})}> 
                    <Typography style={{textAlign:'left', fontSize: 14, fontWeight: 'bold', marginLeft: -5, textDecoration: this.state.hoverAuthor ?  'underline' : 'none', cursor: 'pointer'}} onClick={(e) => {if (!this.state.post.anonymous) {e.preventDefault(); this.props.history.push(`/profile/${this.state.post.post_owner_id}`)}}}>
                        {this.state.post.anonymous ? 'Anonymous' : `${this.state.post.firstname} ${this.state.post.lastname}  `} 
                    </Typography>
                  </div>
                  
                  :
                  <Typography style={{textAlign:'left', fontSize: 14, marginLeft: -5}}>[Deleted]</Typography>
              }
              subheader={
                  !this.state.post.original_deleted ?
                    <Typography style={{textAlign:'left', fontSize: 14, marginLeft: -5}} >
                      {timeAgo.format(new Date(this.state.post.created_at))}
                    </Typography>
                  :
                  <Typography style={{textAlign:'left', fontSize: 14, marginLeft: -5}} >[Deleted]</Typography>

              }
              action={
                (!this.state.post.deleted && !this.state.post.original_deleted) && 
                <div>
                  {
                    !this.props.selecting && 
                    <div onClick={(e) =>  {e.preventDefault(); e.stopPropagation()}}>
                      {this.state.post.type === 'Task' && !this.state.post.original_deleted &&
                      <span >
                      <FormControlLabel
                        style={{marginBottom: '-0.5px'}}
                        control={
                        <Checkbox 
                          checked={this.state.post.completed ? this.state.post.completed : false}
                          color="primary"
                          onClick={(e) => {
                            this.setState({
                              ...this.state,
                              post: {
                                ...this.state.post,
                                completed: !this.state.post.completed
                              }
                            }, () => {
                              this.props.onPostClicked({type: 'completePost', e: this.state.post});
                              completePost(this.props.parent, this.state.post.original_post_id, this.state.post.completed)})
                          }} 
                        />
                      }
                      label={("Complete")}
                      labelPlacement="start"
                      />
                      </span>}
                        
                      
                      {
                        this.parentPost && this.parentPost.type === 'Question'  && !this.parentPost.answer && this.isParentOwner && this.state.post.type === 'Information' &&
                            <Tooltip title="Mark Post As Best Answer">
                            <IconButton  
                            onClick={() => {
                              markAnswer(this.props.parent, this.props.parentPost, this.state.post.post_id).then(() => {
                                if (this.props.updateParent) {
                                  this.props.updateParent('Answered Post', 1);
                                }
                              });
                            }}>
                              <QuestionAnswerOutlined/>
                            </IconButton>
                            </Tooltip>
                      }
                      {
                        this.parentPost && this.parentPost.type === 'Question' && this.parentPost.answer && this.parentPost.answer.post_id === this.state.post.post_id && 
                        <Tooltip title="Unmark Post As Best Answer">
                            <IconButton 
                            onClick={() => {
                              deleteAnswer(this.props.parent, this.props.parentPost).then(() => {
                                if (this.props.updateParent) {
                                  this.props.updateParent('Answered Post', 1);
                                }
                              });
                            }}>
                              <QuestionAnswer color="primary"/>
                            </IconButton>
                            </Tooltip>
                        }
                        {
                          !this.parentPost && this.state.post.wiki && !this.props.wiki && !this.props.postContext &&
                          <span style={{marginLeft: '8px', marginBottom: '1px'}}>
                            <Tooltip title="Wiki Post">
                            <ImportContacts/>
                            </Tooltip>
                          </span>
                        }
                        {
                          this.state.post.favorite &&
                          <span style={{marginLeft: '8px', marginBottom: '1px'}}>
                            <Tooltip title="Favorite">
                              <Favorite/>
                            </Tooltip>
                          </span>
                        }
                        {
                          !this.parentPost && this.state.post.pinned && !this.props.wiki && !this.props.postContext &&
                          <Tooltip title="Pinned">
                            <PinIcon style={{width: '22px', height: '22px', marginLeft: '4px'}} alt="Pinned"/>
                          </Tooltip>
                        }
                      {
                        ((this.mod && (this.mod.type === 'Creator' || this.mod.type === 'Lead')) || this.isOwner) &&
                        <span >
                    <IconButton aria-label="settings" onClick={(e) => {this.setState({...this.state, anchorEl: e.currentTarget});}}>
                      <Tooltip title="Post Actions">
                      <MoreVert />
                      </Tooltip>
                    </IconButton>
                    <Menu   
                      anchorEl={this.state.anchorEl}
                      keepMounted
                      open={Boolean(this.state.anchorEl)}
                      onClose={() => this.handleCardActions()}
                    >
                      {
                        (this.mod &&
                        (this.mod.type === 'Creator' || this.mod.type === 'Lead') || this.isRelationOwner || this.isOwner)
                        &&
                        <MenuItem 
                          onClick={() => this.setState({...this.state, movePost: true, anchorEl: null})}
                        >
                          <ListItemIcon>
                            <CreateNewFolder/>
                          </ListItemIcon>
                          <ListItemText
                            primary={'Move Post'}
                          />
                        </MenuItem>
                      }
                      {
                        /* 
                          <MenuItem onClick={() => {
                            this.setState({
                              ...this.state,
                              anchorEl: null
                            })
                          }}>
                            Favorite Post
                          </MenuItem>
                        */
                      }
                        
                      {
                        this.state.post.relation_id &&
                        (this.mod &&
                        (this.mod.type === 'Creator' || this.mod.type === 'Lead') || this.isRelationOwner || this.isOwner)
                        &&
                        <MenuItem 
                          onClick={() => this.setState({...this.state, relationDeleteOpen: true, anchorEl: null})}
                        >
                          <ListItemIcon>
                            <LinkOff/>
                          </ListItemIcon>
                          <ListItemText
                            primary={'Remove Relation'}
                          />
                        </MenuItem>
                      }
                      {
                        this.isOwner && this.state.post.type !== 'Link' && this.state.post.type !== 'Media' &&
                        <MenuItem 
                          onClick={() => {this.setState({...this.state, editingPost: true, anchorEl: null})}}
                        >
                          <ListItemIcon>
                            <Edit/>
                          </ListItemIcon>
                          <ListItemText
                            primary={'Edit Post'}
                          />
                          
                        </MenuItem>
                      }
                      {
                        this.props.parent &&
                        
                        ((this.mod &&
                        (this.mod.type === 'Creator' || this.mod.type === 'Lead')) || (this.isOwner)) && 
                        <MenuItem 
                          onClick={() => this.setState({...this.state, postRemoveOpen: true, anchorEl: null})}
                        >
                          <ListItemIcon>
                            <Delete/>
                          </ListItemIcon>
                          <ListItemText
                            primary={'Delete Post'}
                          />
                        </MenuItem>
                      }
                      {
                        this.mod &&
                        (this.mod.type === 'Creator' || this.mod.type === 'Lead') &&
                        <MenuItem 
                          onClick={() => this.handleCardActions('pin')}>
                            <ListItemIcon>
                              <PinIcon/>
                            </ListItemIcon>
                            <ListItemText
                              primary={this.state.post.pinned ? 'Unpin from Post Space' : 'Pin to Post Space'}
                            />
                          </MenuItem>
                      }
                      {
                        this.mod &&
                        (this.mod.type === 'Creator' || this.mod.type === 'Lead') && (this.state.post.type === 'Media' || this.state.post.type === 'Link' || this.state.post.type === 'Information') &&
                        <MenuItem 
                          onClick={() => this.handleCardActions('wiki')}
                        >
                           <ListItemIcon>
                              <Info/>
                            </ListItemIcon>
                            <ListItemText
                              primary={this.state.post.wiki ? 'Pin to Info Tab' : 'Unpin from Info Tab'}
                            />
                          
                        </MenuItem>
                      }
                      
                    </Menu>
                        </span>
                      }
                      
                      
                    </div>
                    
                  }
                  {
                    this.props.graph && 
                    <IconButton onClick={() => this.props.onPostClicked(this.props.post)}>
                      <MenuOpen style={{marginTop: '10px'}} />
                    </IconButton>
                  }
                </div>
                
                
              }
              
              style={{marginTop:'-5px', }}
            />  
            {/*Header styles  */}
            <CardContent style={{marginTop: -15, marginBottom: -10, display: 'flex', alignItems: 'center'}}>
            <Tooltip title={this.props.post.type}>
                <span 
                  style={{marginRight: 5, cursor: 'pointer'}} 
                  onClick={(e) => {
                    if (this.state.post.type === 'Task') {
                      e.preventDefault();
                      this.setState({
                        ...this.state,
                        post: {
                          ...this.state.post,
                          completed: !this.state.post.completed
                        }
                      }, () => {
                        this.props.onPostClicked({type: 'completePost', e: this.state.post});
                        completePost(this.props.parent, this.state.post.original_post_id, this.state.post.completed)
                      })
                    }
                    
                  }}
                >
                  
                    <PostIcon post={this.state.post} size={35}/>
                </span>
                </Tooltip>
                <Typography variant="h6" style={{textAlign: 'left'}}>{this.state.post.title.replace(/\\"/g,"'")}</Typography>
              
            </CardContent>
            
            <CardContent style={{
              marginTop: 20, 
              maxHeight: (this.state.actualText && 
                this.state.actualText.length > 0) ? '' : 0,
                marginLeft: 8,
              }}>
              {
                this.state.actualText && 
                this.state.actualText.length > 0 && 
                this.state.post.type !== 'Media' &&
                this.state.post.type !== 'Link' &&

                (
                (this.props.detailed || !this.state.truncated) ? 
                <div style={{marginTop:'-30px'}}>
                      {
                        !this.state.editingPost &&
                        <Editor
                          post={this.state.post}
                          readonly
                        />
                      }
                      
                      {
                        !this.props.detailed && this.state.overflowing &&
                        <Button variant="outlined" onClick={
                          (e) => {
                            e.preventDefault();
                            this.setState({
                              ...this.state, 
                              truncated: true,
                            }, () => this.executeScroll());
                            
                          }
                        } size="small" style={{borderRadius: '25px', marginTop: '-10px'}} startIcon={<ExpandLess/>}>Collapse</Button>
                      }

                </div>
                                
                :
                  <div style={{textAlign:'left', marginTop:'-30px'}} onClick={(e) => {
                      if (this.state.truncated && this.state.actualText && this.state.actualText.length > 400) {
                        e.preventDefault(); 
                        this.setState({
                          ...this.state,
                          truncated: false,
                        })}
                      }
                    }>
                  <div style={{textAlign: 'left', maxHeight: '180px', overflow:'hidden'}} ref={this.ref}>
                    <Editor
                        post={this.state.post}
                        readonly
                      />
                  </div>
                  {
                  this.state.overflowing
                  && 
                  <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <Button size="small" variant="outlined" style={{borderRadius: '25px', marginTop: 15, marginBottom: 15}} startIcon={<ExpandMore/>}>Expand</Button>
                  </div>
                  } 
                  <div style={{textAlign: 'center', marginBottom: '-10px'}}>
                  
                    <div>
                      {
                        this.state.images.length > 0 &&
                        <ImagePreview images={this.state.images} />
                      }
                      
                    </div>
                    <div >
                    
                      
                    </div>
                  </div>

                </div >
              
              
                )
              }

              {
                this.state.post.type === 'Media' &&
                <div style={{width: '500', overflow: 'hidden'}} onClick={e => e.preventDefault()}>
                  {
                    !this.props.post.original_deleted ? 
                    <div style={{marginTop: '-30px'}}>
                      <SlideShow media={(this.state.post.info)}/>
                    </div>
                    :
                    <Typography style={{textAlign: 'left', marginTop:'-30px'}}>[Deleted]</Typography>
                  }
                </div>
              }
              {
                this.state.post.type === 'Link' &&
                <div style={{width: '100%'}}>
                  {
                    
                    
                    !this.props.post.original_deleted && !this.state.post.deleted ? 
                    <div style={{marginTop: '-30px'} }               
                    onClick={(e) => {e.preventDefault(); window.open((this.state.post.info).link, '_blank');}}
                    >
                      <ErrorBoundary>    
                      </ErrorBoundary>
                      
                    </div>
                            
                    :
                    <Typography style={{textAlign: 'left', marginTop:'-30px'}}>[Deleted]</Typography>
                  
                  }
                  
                </div>
              }
                { 
                  this.state.post.answer &&
                  <div>                    
                    <Typography variant="h6">Best Answer 
                    <Tooltip title="Unmark Post As Best Answer">
                      <IconButton
                      onClick={() => {
                        deleteAnswer(this.props.parent, this.state.post).then(() => {

                          if (this.props.updateParent) {
                            this.props.updateParent('Answered Post', 1);
                          }
                        });
                      }}>
                        <QuestionAnswer color="primary"/>
                      </IconButton>
                    </Tooltip>

                      </Typography>
                    <ConnectedMainCard
                      post={this.state.post.answer}
                      inParent
                      updateParent={this.props.updateParent}
                      parent={this.state.parent}
                    />  
                  </div>
                }
              {
                this.state.post.type === 'Event'  && !this.state.post.original_deleted && !this.state.post.deleted &&
                <div style={{marginTop: '10px'}} onClick={() => {if (!this.currUser) this.props.history.push('/signin')}}>
                  <EventFeature 
                    post={this.state.post}
                    parent={this.state.parent}
                  />
                </div>
              
              }
              {
                this.state.post.type === 'Poll'  && !this.state.post.original_deleted && !this.state.post.deleted &&
                <div style={{marginTop: '10px'}} onClick={(e) => {e.preventDefault(); if (!this.currUser) this.props.history.push('/signin')}}>
                  <PollFeature
                      post={this.state.post}
                      parent={this.state.parent}
                  />
                </div>
              }
            </CardContent>

              {
                !this.state.post.original_deleted && this.props.detailed &&
                    <div style={{textAlign: 'left', marginTop: '10px', marginLeft: '17px'}}>
                        {
                        
                        this.state.post.tags.map((data) => {
                        return (
                            <Chip
                              label={data.info}
                              key={data.post_tag_id}
                              style={{margin: '1px', cursor: 'pointer'}}
                            />
                        );
                      })}
                      </div>
              }
                    

              {/*Card Footer*/}
              {
                (this.state.post.spaces) && (this.postContext || (this.state.post.spaces).length > 1) && 
              
              <CardContent style={{textAlign: 'left', position: 'relative', marginTop: -15, marginBottom: -25, marginLeft: -2}} onClick={(e) => e.preventDefault()}>
                <div style={{display: 'flex', alignItems: 'center', paddingBottom: 10}}>
                  {
                    !this.state.spacesExpanded && this.state.post.spaces && (this.state.post.spaces).slice(0, 2).map((s, i) => (
                      <React.Fragment>
                        <Link to={(this.state.post.space_id === s.space_id && !this.postContext) ? undefined : `/space/${s.space_id}`} style={{color: store.getState().uiActions.darkMode ? 'white' : 'black', textDecoration: 'none'}}>
                        <SpacePreview
                          expanded
                          shortened={this.props.width === 'xs' || this.props.width === 'sm'}
                          limit={20}
                          s={s}
                          size={40}
                        />
                        </Link>
                        {
                          i === 0 &&
                          this.state.post.parent_post && 
                          <React.Fragment>
                            / 
                            <Link 
                              to={{
                                pathname: `${this.state.post.project_id ? 
                                  `project/${this.state.post.project_id}/post/${this.state.post.parent_post[0].post_id}` : 
                                  `space/${this.state.post.space_id}/post/${this.state.post.parent_post[0].post_id}`}`, 
                                state: {from: this.props.location.pathname, clear: true, push: true}
                              }}
                            >
                              <span style={{textDecoration: 'none', color: store.getState().uiActions.darkMode ? 'white' : 'black'}}>
                              <PostPreview
                                p={this.state.post.parent_post[0]}
                                expanded
                                shortened={this.props.width === 'xs' || this.props.width === 'sm'}
                                />
                              </span>
                              
                            </Link>
                          </React.Fragment>
                        }
                        {i <  (this.state.post.spaces).length - 1 && <Typography style={{marginRight: 5}}>,</Typography>}
                      </React.Fragment>
                      
                    ))
                  }
                  
                </div>
                {
                  (this.state.post.spaces).length > 2 && 
                  <div style={{position: 'absolute', right: 0, top: -4}}>
                    <IconButton onClick={() => {

                      this.setState({...this.state, spacesExpanded: !this.state.spacesExpanded})
                    }}>
                      {this.state.spacesExpanded ? <ExpandLess/> : <ExpandMore/>}
                    </IconButton>
                  </div>
                }
                
                
                    
              </CardContent>
              }      
              
              <Collapse in={this.state.spacesExpanded}>
              {
                this.state.spacesExpanded && 
                <div style={{textAlign: 'left', marginLeft: 15}}>
                  {
                    this.state.post.spaces && (this.state.post.spaces).map(s => (
                        <Link to={this.state.post.space_id === s.space_id ? undefined : `/space/${s.space_id}`}>
                          <SpacePreview
                            size={20}
                            expanded
                            shortened
                            limit={20}
                            s={s}
                          />
                        </Link>
                    ))
                  }
                </div>
              }
              </Collapse>
              <div style={{marginTop: '5px'}} onClick={(e) => e.preventDefault()}>
              {
                !this.state.post.original_deleted &&
                <div style={{marginTop: '10px'}}>

                  <Divider/>
                  {
                    <div style={{float:'left', marginLeft: '10px', display: 'flex', alignItems: 'center'}}>
                      <span>
                        <Tooltip title={"Vote"}>
                          <IconButton onClick={this.props.jwt ? this.likePost : () => this.props.history.push('/signup')}>
                            <ThumbUp style={{fontSize: 20}} color={this.state.liked ? 'primary' : 'textPrimary'}/>
                            <Typography style={{marginLeft: 3}} color={this.state.liked ? 'primary' : undefined}>{this.state.votes}</Typography>                       
                          </IconButton> 
                        </Tooltip>
                      </span>
                      <span>
                        <Tooltip title={"Comments"}>
                          <IconButton onClick={this.getComments}  >
                            <Comment style={{transform: 'scaleX(-1)', fontSize: 20}} />
                            <Typography style={{marginLeft: 3}}>{this.state.post.commentscount ? this.state.post.commentscount : 0 }</Typography>
                          </IconButton> 
                        </Tooltip>
                      </span>
                      <span style={{marginLeft: -3}}>
                        <Tooltip title="Subposts">
                          <IconButton onClick={() => this.props.history.push(`/space/${this.props.post.space_id}/post/${this.props.post.post_id}`)}>
                            <Share style={{fontSize: 20, transform: 'rotate(90deg)'}}/>
                            <Typography style={{marginLeft: 3}}>{this.state.post.relationcount === null ? 0: this.state.post.relationcount}</Typography>
                          </IconButton> 
                        </Tooltip>
                      </span>
                    </div>
                  }
                  <span style={{float: 'right', display: 'flex', marginTop: 2}}>
                    {
                      <span>
                        <Tooltip title="Share">
                          <IconButton onClick={this.sharePost} style={{marginLeft: '-5px'}}>
                            <Reply style={{transform: 'scaleX(-1)', fontSize: 20}} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Notifications">
                        <span style={{marginLeft: '-5px'}} onClick={() => !this.props.jwt && this.props.history.push('/signup')}>
                          <PostNotifications size={20} post={this.state.post} parentType={this.state.parent.space_id ? 'space' : 'project'}/>  
                        </span>
                        </Tooltip>
                      </span>
                    }
                  </span>
                </div>
              }
              </div>
              
            
              
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              open={this.state.open}
              autoHideDuration={6000}
              onClose={this.handleClose}
              message="Link copied to clipboard"
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleClose}>
                    <Close fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
          </React.Fragment>
        )
        return (
          <div>

          
          <Card 
            style={{
              paddingBottom: this.props.padding ? this.props.padding : 0, 
              scrollMargin: '80px', 
            }} 
            ref={this.myRef}
          >
            {
              this.props.disableHover ?
              <div>
                {body}
              </div>
              :
              <CardActionArea disableRipple>
               {body}
              </CardActionArea>
            }
            {
              this.state.showComments  &&
              <div onClick={(e) => e.preventDefault()} style={{marginBottom: 15, marginTop: this.props.inView ? 60 : 0, width: '100%'}}>
                <Divider/>
                <Discussion
                  comments={this.state.comments ? this.state.comments: []} 
                  post={this.state.post} 
                  id={(this.state.post.project_id ? this.state.post.project_id : this.state.post.space_id)} 
                  parentType={this.state.post.project_id ? 'project' : 'space'}
                  parent={this.state.parent}
                  loading={this.state.commentLoading}
                  updateComments={(e) => {
                    e === 'create' ? 
                    this.setState(
                      {
                        ...this.state, 
                        post: {
                          ...this.state.post, 
                          commentscount: this.state.post.commentscount ? parseInt(this.state.post.commentscount.toString()) + 1 : 1
                        }
                      })
                    :
                    this.setState({
                      ...this.state, 
                      post: {
                        ...this.state.post,
                        commentscount: parseInt(this.state.post.commentscount.toString()) - 1}
                      })
                  }}
                />
              </div>
            }
       
      </Card>
      
      <div
        onClick={e => {
          e.preventDefault();
        }}
      >
        <Dialog
            open={this.state.relationDeleteOpen}
            onClose={() => this.handleCardActions()}
            aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Remove Relation</DialogTitle>
          <DialogContent >
            <DialogContentText>
              Are you sure you want to delete this relation? You can relate this post later.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
          <Button onClick={() => this.handleCardActions('removeRelation')} color="primary" autoFocus>
              Yes
            </Button>
            <Button autoFocus onClick={() => this.handleCardActions()} color="primary">
              No
            </Button>
          </DialogActions>
      </Dialog>
      <Dialog
          open={this.state.movePost}
          onClose={() => this.setState({...this.state, movePost: false})}
          fullScreen={this.props.width === 'xs' || this.props.width === 'sm'}
          aria-labelledby="responsive-dialog-title"
          width={'md'}
          fullWidth
        >
          <DialogTitle id="responsive-dialog-title">Move Post</DialogTitle>
          <DialogContent id="scrollableDiv">
            <FileSystem 
              style={{marginTop: -10}} 
              parentPost={this.parentPost} 
              post={this.state.post} 
              parent={this.state.parent} 
              onSelect={(e, deleteParent) => {
                this.props.makeRelation(this.state.parent.project_id ? 'projects' : 'spaces', this.state.parent.project_id ? this.state.parent.project_id : this.state.parent.space_id, e.original_post_id, this.state.post.original_post_id).then(() => {
                    if (deleteParent) {
                      this.props.deleteRelation('spaces', this.state.post.relation_id).then(()=> {  
                        this.props.history.push(`/space/${this.state.parent.space_id}/post/${e.post_id}`)
                      })
                    } else {
                      this.props.history.push(`/space/${this.state.parent.space_id}/post/${e.post_id}`)
                    }
                    
                });
              }}
              onRoot={() => this.handleCardActions('removeRelation')}
            />
          </DialogContent>
      
      </Dialog>
      <Dialog
          open={this.state.postRemoveOpen}
          onClose={() => this.handleCardActions()}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Delete Post</DialogTitle>
          <DialogContent>
                    <DialogContentText>
                      {`Are you sure you want to remove this post from this ${this.state.parent.project_id ? 'project' : 'group'}? This post will remain in other crossposted groups.`}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                  <Button onClick={() => this.handleCardActions('removePost')} color="primary" autoFocus>
                      Yes
                    </Button>
                    <Button autoFocus onClick={() => this.handleCardActions()} color="primary">
                      No
                    </Button>
                  </DialogActions>
              </Dialog>
              <Dialog
                open={this.state.editingPost && this.state.post && this.state.post.type !== 'Media' && this.state.post.type !== 'Link' && !this.props.postID}
                fullWidth={true}
                onClose={() => {this.setState({...this.state, editingPost: false})}}
                >
                <DialogTitle>Edit Post</DialogTitle>
                <DialogContent >

                  <div style={{position: 'relative'}}>
                  <PostEditor
                    parent={this.state.parent}
                    finish={(val) => this.updatePost(val)} 
                    parentType={this.state.parentType} 
                    parent={this.state.parent}
                    options
                    imageChange={(key, value) => {
                        this.imageMap.set(key, {read: false, url: value});
                    }}
                    onPostChange={(post) => {
                        this.setState({
                            ...this.state,
                            newPost: JSON.parse(JSON.stringify(post)),
                        })
                    }}
                    newPost={this.state.newPost}
                  />
                  </div>
                </DialogContent>
                <DialogActions>
                  <div  style={{width: '100%'}}>
                    <span style={{float: 'left'}}>
                      <Button style={{backgroundColor: 'red', color: 'white'}} variant="contained" onClick={() => this.setState({...this.state, postRemoveOpen: true})}>
                          <Delete/>  Delete 
                      </Button>
                    </span>
                  
                    <span style={{float: 'right'}}>
                      <Button variant="outlined" style={{marginRight: 5}} onClick={() => this.updatePost(false)}>
                          <Close/>  Cancel 
                      </Button>
                      <Button style={{color: 'white'}} color="primary" variant="contained" onClick={() => this.updatePost(true)}>
                          <Done/>  Save 
                      </Button>
                    </span>
                  </div>
                  
                 
                </DialogActions>
              </Dialog>
      </div>
      </div>
      )
      }
      
    
    
}

const mapStateToProps = (state) => {
  return {...state.userActions};
}

const mapDispatchToProps = {
  votePost,
  removeVotePost,
  deletePost,
  deleteRelation,
  updatePost,
  updateParentPost,
  makeRelation,
  removePost
}

const DispatchCard = withWidth()(connect(mapStateToProps, mapDispatchToProps)(MainCard))

function ConnectedMainCard(props) {
    const {
      inDashboard
    } = props;
    const link = `/${props.post.space_id ? 'space' : 'project'}/${props.post.space_id ? props.post.space_id : props.post.project_id}/post/${props.post.post_id}`;
    const cards = React.useMemo(() => (
      (
        props.selecting || !props.inParent ? 
        <div onClick={() => props.onPostClicked(props.post)}>
          <DispatchCard {...props}/>
        </div>
        
        :
        <Link
          to={{
            pathname: link, 
            state: {
              from: props.location.pathname, 
              clear: inDashboard, 
              push: true
            }
          }} 
          onClick={() => {}}
          style={{textDecoration: 'none'}}
        >
          <DispatchCard {...props}/>
        </Link>
      )
    ), [props.post])
    return cards
}

export default (withRouter(ConnectedMainCard));


PostIcon.propTypes = {
  /**
   * Determines the icon that is displayed
   */
  postType: PropTypes.object,
   /**
   * Determines whether to display comments and relations or the associated project name.
   */
  inParent: PropTypes.bool,
  /**
   * Determines length of body for truncation.
   */
  length: PropTypes.number,

};

PostIcon.defaultProps = {
  inParent: false,
  length: 200,
}