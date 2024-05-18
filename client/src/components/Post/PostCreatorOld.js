import React, { Component } from 'react'
import {
    CardContent, 
    CardHeader, 
    IconButton, 
    TextField, 
    Typography, 
    CardActions,
    Box,
    Tabs,
    Tab,
    InputAdornment,
    CircularProgress,
    ButtonGroup,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle
} from '@material-ui/core';
import Button from '../Shared/Button';
import { withStyles } from '@material-ui/styles';
import { Add, Close, Fullscreen, } from '@material-ui/icons';
import PostNotifications from './PostNotifications';
import PostEditor from './Editor/PostEditor';
import {baseURL} from '../../actions/index';
import { changeImage, deleteImage } from '../../actions/S3Actions'; 
import { v4 as uuidv4 } from 'uuid';
import { makePost, makeRelation, makeParentPost } from '../../actions/postActions';
import {getParentUsers} from '../../actions/orgActions';
import store from '../../Store';
import PostSpace from './PostSpace'
import {withWidth} from '@material-ui/core'
import {createNotification} from '../../actions/notificationActions';
import {addPostUsers, deletePostUsers} from '../../actions/postUserActions';
import ImageCreator from '../Image/ImageCreator';
import LinkCreator from './Types/LinkCreator';
import UserIcon from '../User/UserIconOld';
import {connect} from 'react-redux';
import { withRouter } from "react-router";
import { isVowel } from '../../utils/textprocessing';

const styles = {
    'input-label': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      width: '100%',
      color: 'red'
    },
  
    'input': {
      '&::placeholder': {
        fontSize: 20,
        marginTop: 10
      }
    }
  };

export const createPost = (newPost, parent, imageMap, notifications, makeRelation, exit) => {
    if (newPost.delta) {
        const images = newPost.delta.content.filter(d => d.type === 'customImage');
        for (let i = 0; i < images.length; ++i) {
            const image = imageMap.get(images[i].attrs.url);
            if (image) {
                image.read = true;
            }
        }
        Array.from(imageMap, ([name, value]) => ({name, value})).filter(e => !e.value.read).forEach(i => {
            deleteImage(i.name);
        });
    }
     
    imageMap = new Map();
    makePost(newPost).then((e)=> {
        let users = [];
        const thisUser = store.getState().userActions.userInfo;
        let currUser = newPost.users ? newPost.users.find(u => e.user_id === thisUser.user_id) : undefined;

        if (currUser) {
            users = [...newPost.users.filter(u => u.user_id !== currUser.user_id), {...currUser, ...notifications}]
        } else {
            users = [...newPost.users, {user_id: thisUser.user_id, type: 'Follower', ...notifications}]
        }

        if (users && users.length > 0) {
            addPostUsers({}, {original_post_id: e.post_id}, users);
        } else {
            deletePostUsers({}, {original_post_id: e.post_id}, users);
        }

        newPost.spaces.forEach(s => {
            makeParentPost(s.project_id ? 'projects' : 'spaces', s.project_id ? s.project_id : s.space_id, {post_id: e.post_id, section_id: newPost.section_id, hidden: newPost.hidden}).then((val) => {
                if (s.parent_post) {
                    (makeRelation(s.project_id ? 'projects' : 'spaces', s.project_id ? s.project_id : s.space_id, s.parent_post.original_post_id, e.post_id)).then(() => {
                        exit({type: 'relatedPost', e: {source: s.parent_post.post_id, target: {...newPost, post_id: val.post_id}}});
                    });
                } else {
                    exit({type: 'newPost', e: {source: e.post_id, target: {...newPost, post_id: val.post_id}}});
                }
                const userMap = new Map();
                getParentUsers(s.space_id ? s.space_id : s.project_id, s.space_id ? 'spaces' : 'projects').then(users => {
                    users.forEach(u => {
                        if (!userMap.has(u.user_id) && u.info && u.info.posts && (!thisUser || u.user_id !== thisUser.user_id)) {
                            createNotification(u.user_id, {
                                type: parent.project_id ? 'projectPost' : 'spacePost',
                                read: false,
                                user_id: u.user_id,
                                project: parent.project_id ? true : false,
                                space: parent.space_id ? true : false,
                                post_id: val.post_id, 
                            });
                            userMap.set(u.user_id, u);
                        }
                    })
                });
            })

        });
    });
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
         {
             value == index && 
             <Box>
                {children}
            </Box>
         }
         
        
      </div>
    );
  }

class PostCreator extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.lockedType)
        this.originalState = {
            typeChosen: '',
            placeholder: !this.props.opened, //!this.props.opened
            value: 0,
            link: '',
            imageLink: '',
            linkTitle: '',
            imageTitle: '',
            files: [],
            post: props.post,
            location: props.location,
            parentPosts: [],
            imageTags: [],
            linkTags: [],
            fullscreen: false, // change back
            creating: false,
            notifications: {},
            newPost: {
                title: '',
                body: '',
                spaces: [{...this.props.parent, parent_post: this.props.post}],
                type: this.props.lockedType ? this.props.lockedType : 'Idea',
                info: {},
                due_date: null,
                users: [],
                info: {
                    poll: []
                },
                start_date: new Date(),
                end_date: new Date()
            },
        }
        this.state = this.originalState;
        this.imageMap = new Map();

        this.name = store.getState().userActions.userInfo ? (store.getState().userActions.userInfo.firstname + ' ' + store.getState().userActions.userInfo.lastname) : '';
        this.placeholderLabel = `Create a${this.props.lockedType && isVowel(this.props.lockedType.substring(0, 1)) ? 'n' : ''} ${this.props.lockedType ? this.props.lockedType : 'post'}`
        this.creatorRef = React.createRef();
        this.editorRef = React.createRef();
        this.user = (this.props.parent.users && store.getState().userActions.userInfo) ? this.props.parent.users.find(e => e.user_id === store.getState().userActions.userInfo.user_id) : undefined;
        this.isMod = this.user && (this.user.type === 'Lead' || this.user.type === 'Creator')

        this.handleChange = (e, i) => {
            this.setState({
                ...this.state,
                value: i
            })
        };  
    
        this.childListener = (e) => {
            this.props.makeRelation(this.props.parent.project_id ? 'projects' : 'spaces', this.props.parent.project_id ? this.props.parent.project_id : this.props.parent.space_id, this.props.post.original_post_id, e.original_post_id).then(() => {
                if (this.props.updateParent) {
                    this.props.updateParent({type: 'existingRelation', e: {source: this.props.post.post_id, target: e.post_id}});
                }
            });
            this.exitDialog();
        }

        this.finish = () => {
            console.log('hey there')
            if (this.state.creating)
                return;
            console.log('hey there 2')
            this.setState({...this.state, creating: true},
            () => {
                if (this.state.newPost.title !== '') {
                    if (this.state.value === 1) {
                        if (this.state.newPost.files.length === 0) {
                            return;
                        }
                        const urls = [];
                        this.state.newPost.files.forEach(file => {
                            let id = uuidv4();
                            switch (file.type) {
                                case 'image/png':
                                    id += '.png';
                                    break;
                                case 'image/x-png':
                                    id += '.png';
                                    break;
                                case 'image/jpeg':
                                    id += '.jpg'
                                    break;
                                default: 
                                    return;
                            }
                            
                            let imageURL = `${this.props.parent.project_id ? 'projects': 'spaces'}/posts/${uuidv4()}/${uuidv4()}/${id}`;
                            urls.push(imageURL);
                            changeImage(imageURL, file)
                        });
                        this.state.newPost.info = urls;
                        this.state.newPost.type = 'Media'
                    } else if (this.state.value === 2) {
                        if (!this.validURL(this.state.newPost.link)) {
                            return;
                        }
                        this.state.newPost.info = {link: this.state.newPost.link};
                        this.state.newPost.type = 'Link';
                    }
    
                    createPost(this.state.newPost, this.props.parent, this.imageMap, this.state.notifications, this.props.makeRelation, (e) => {
                        this.exitDialog();
                        if (this.props.updateParent) {
                            this.props.updateParent(e);
                        }
                    });
                    
                } else {
                    this.setState({
                        ...this.state,
                        typeChosen: '',
                        placeholder: true,
                    })
                }  
            })
        }
    
        this.exitDialog = () => {
            this.setState(this.originalState);
            this.props.onClose();
        }
    
    
        this.validURL = (str) => {
            try {
                new URL(str);
                return true;
            } catch {
                return false;
            }
        }
        this.toggleFullscreen = () => {
            this.setState({
                ...this.state, 
                fullscreen: !this.state.fullscreen
            })
        }
    }

    componentWillUnmount() {
        Array.from(this.imageMap, ([name, value]) => (value)).filter(e => !e.read).forEach(i => {
            deleteImage(i.url);
        });
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.submit !== prevProps.submit) {
            if (this.props.submit && this.state.post.title !== '') {
                this.finish()
            }
        }
        if (this.props.post !== prevProps.post) {
            this.setState({
                ...this.state,
                location: !this.props.post ? this.props.parentType : 'Post',
            });
        }
        if (this.props.relations !== prevProps.relations) {
            if (this.props.post) {
                const arr = [];
                this.setState({
                    ...this.state,
                    parentPosts: arr,
                    location: 'Post'
                });
                            
            }
        }
        if (this.props.opened !== prevProps.opened) {
            if (this.props.opened) {
                this.setState({
                    ...this.state,
                    placeholder: false,
                });
                if (this.props.location === 'Post') {
                    this.props.onOpenEditor();
                }
                
            }
        }
    }

    render() {
        const editorActions = (
            <span style={{width: '100%'}}>
                <div style={{paddingTop: '10px', marginBottom: '10px'}}>
                    <div style={{float: 'left'}}>
                        <PostNotifications preview onChange={(val) => this.setNotifications(val)}/>
                    </div>

                    <div style={{float: 'right', marginRight: 5, display: 'flex', alignItems: 'center'}}>
                        {this.state.creating && <CircularProgress style={{marginRight: '10px'}} size={30} />}
                        <Button  
                            disabled={this.state.newPost.title === ''} 
                            onClick={this.finish} 
                            variant="contained" 
                            style={{color: 'white'}} 
                            color="primary" 
                            size="large"
                            startIcon={<Add/>}
                        >
                            Create
                        </Button>                   
                    </div>
                </div>
            </span>
        )
        const editorBody = (
            <div style={{marginTop: -30}}>
                {   
                    this.props.post &&
                    <Tabs  value={this.state.value} onChange={this.handleChange} style={{marginBottom: 15}} variant='scrollable'>
                        <Tab label="Text"/>
                        <Tab label="Relation"/>
                    </Tabs>
                }
                <TabPanel value={this.state.value} index={0}>
                
                <div>
                    <PostEditor
                        type={'Idea'}
                        parent={{...this.props.parent, parent_post: this.props.post}}
                        parentType={this.props.parent.project_id ? 'projects' : 'spaces'}
                        finish={this.finish}
                        location={this.state.location}
                        creating
                        mod={this.isMod}
                        fullscreen={this.state.fullscreen}
                        ref={this.editorRef}
                        options
                        imageChange={(key, value) => {
                            this.imageMap.set(key, {read: false, url: value});
                        }}
                        onPostChange={(post) => 
                        this.setState({
                            ...this.state,
                            newPost: post,
                        })
                        }
                        lockedType={this.props.lockedType}
                        newPost={this.state.newPost}
                    />
                </div>
                
                
                </TabPanel>
                
                <TabPanel value={this.state.value} index={1}>
                    <ImageCreator 
                        isMod={this.isMod}
                        onPostChange={(post) => 
                        this.setState({
                            ...this.state,
                            newPost: post,
                        })
                        }
                        name={this.name}
                        parentType={this.props.parentType}
                        submitMediaPost={this.finish}
                        parent={{...this.props.parent, parent_post: this.props.post}}
                        onPostChange={(post) => 
                            this.setState({
                                ...this.state,
                                newPost: post,
                            })
                        }
                        newPost={this.state.newPost}
                    />
                </TabPanel>
                <TabPanel value={this.state.value} index={2}>
                    <LinkCreator
                        state={this.state}
                        setState={this.setState}
                        isMod={this.isMod}
                        validURL={this.validURL}
                        baseURL={baseURL}
                        submitLinkPost={this.finish}
                        name={this.name}
                        parentType={this.props.parentType}
                        parent={{...this.props.parent, parent_post: this.props.post}}
                        onPostChange={(post) => 
                            this.setState({
                                ...this.state,
                                newPost: post,
                            })
                        }
                        newPost={this.state.newPost}

                    />
                </TabPanel>
                <TabPanel value={this.state.value} index={3}>
                    Relate an Existing Post:
                    <PostSpace  
                        onPostClicked={this.props.childListener} 
                        passedPosts={this.props.parent.posts && this.props.post ? this.props.parent.posts.filter(p => (p.post_id !== this.props.post.post_id && (!this.props.relations.find(r => r.post2_id === p.post_id)))) : []}
                        id={this.props.parent ? this.props.parent.project_id ? this.props.parent.project_id : this.props.parent.space_id : undefined} 
                        parent={this.props.parent}
                        inPost
                        selecting
                    />
                </TabPanel>
            </div>
        )
        return (
            <div ref={this.creatorRef} >
                {
                    this.state.placeholder ?
                    <div
                        style={{padding: 5}}
                    >
                        <TextField
                        id="filled-password-input"
                        autoComplete="current-password"
                        placeholder={this.placeholderLabel}
                        InputProps={
                            { 
                                classes: {input: this.props.classes['input']},
                                disableUnderline: true,
                                readOnly: true,
                                startAdornment: <InputAdornment position="start"><UserIcon size={30} user={store.getState().userActions.userInfo}/></InputAdornment>,
                            }
                        }    
                        fullWidth
                        onClick={() => {
                            if (this.props.jwt) {
                                this.setState({
                                    ...this.state,
                                    placeholder: false,
                                });
                                if (this.props.location === 'Post') {
                                    this.props.onOpenEditor();
                                }
                                window.scrollTo({
                                    behavior: "smooth",
                                    top: this.creatorRef.current.offsetTop - (this.props.width === 'xs' || this.props.width === 'sm' ? 70 : 120)
                                });
                            } else {
                                this.props.history.push('/signup')
                            }
                        }}
                        />
                    </div>
                    :
                    <React.Fragment>
                        {
                            this.state.fullscreen ? 
                            <Dialog
                                open
                                fullScreen
                                onClose={this.exitDialog}
                            >
                                <DialogTitle style={{borderBottom: 'solid', borderWidth: 1, borderColor: 'lightgray'}}>
                                    <Typography variant="h5" style={{float: 'left'}}>{`Create a ${this.props.lockedType ? this.props.lockedType : 'Post'}`}</Typography>
                                    <ButtonGroup
                                            style={{float: 'right', marginTop: -15, marginLeft: -10}}
                                    >
                                        <IconButton 
                                            onClick={this.exitDialog}
                                        >
                                            <Close style={{fontSize: '30px'}}/>
                                        </IconButton>   
                                    </ButtonGroup>
                                </DialogTitle>
                                
                                <DialogContent style={{display: 'flex', justifyContent: 'center'}}>
                                    <div style={{maxWidth: 700, flexShrink: 0, width: '100%'}}>
                                        {editorBody}
                                    </div>
                                </DialogContent>
                                <DialogActions style={{borderTop: 'solid', borderColor: 'lightgrey', borderWidth: 1}}>
                                    {editorActions}
                                </DialogActions>
                            </Dialog>
                            :
                            <div style={{marginTop: '5px', textAlign: 'left'}}>
                            <CardHeader
                                title={<Typography  variant="h6">{`Create a ${this.props.lockedType ? this.props.lockedType : 'post'}`}</Typography>}
                                action={
                                    <ButtonGroup
                                        style={{float: 'right'}}
                                    >
                                        <IconButton 
                                            onClick={this.exitDialog}
                                        >
                                            <Close style={{fontSize: '30px'}}/>
                                        </IconButton>   
                                    </ButtonGroup>
                                }
                                style={{marginBottom: 0}}
                            />
                            <CardContent>
                                {editorBody}
                            </CardContent>
                            {
                                !this.props.noButton && this.state.value < 3 &&
                                <CardActions style={{marginTop: -30}}>
                                    {editorActions}
                                </CardActions>
                            }
                        </div>
                        }
                    </React.Fragment>
                }
            </div>
        )
    }
    
}


const mapStateToProps = (state) => {
    return {...state.userActions};
  }
  
const mapDispatchToProps = {
    makeRelation,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withWidth()(withRouter(PostCreator))))
