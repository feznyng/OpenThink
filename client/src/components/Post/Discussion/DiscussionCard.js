import React from 'react'
import UserIcon from '../../User/UserIconOld';
import {
    CardContent, CardHeader, Typography, Card, CardActions,
    IconButton, Button, 
    Dialog, Menu, MenuItem, DialogContent, DialogActions, DialogTitle, DialogContentText,
    TextField,
    Badge,
    Divider,
    Grid,
    OutlinedInput,
    Chip,
} from '@material-ui/core';
import {MoreVert, Done, Close, Comment, Reply, Add, ExpandLess, ExpandMore, ThumbUp, AddComment} from '@material-ui/icons';
import {deleteComment, updateComment, createComment, voteComment, deleteCommentVote} from '../../../actions/commentActions';
import DiscussionCreator from './DiscussionCreator'
import {timeAgo} from '../../../utils/dateutils';

export default function DiscussionCard(props) {
    const {comment, parentType, post, id, updateComments, isMod, thisUser, isSmall, view} = props;
    const [state, setState] = React.useState({
        open: false,
        anchorEl: null,
        editing: false,
        body: comment.body,
        comment: comment,
        replying: false,
        expanded: false,
    });
    const [num, setNum] = React.useState(5);

    React.useEffect(() => {
        setNum(5);
    }, [])

    const handleDelete = () => {
        updateComments('delete')
        deleteComment(parentType, comment);

        setState({
            ...state,
            open: false,
            comment: {
                ...state.comment, 
                deleted: true,
            }
        });
    }

    const handleUpdate = () => {
        updateComment(parentType, comment.commentID, {body: state.body, info: {}}).then(() => {
            setState({
                ...state,
                editing: false,
                comment: {
                    ...state.comment,
                    body: state.body,
                }
            });
        });  
    };

    const postComment = (body) => {
        updateComments('create')
        createComment(parentType, id, post.original_post_id, {body: body, info: state.info, parent_comment_id: comment.commentID}).then((response) => {
            setState({
                ...state,
                replying: false,
                info: null,
                expanded: true,
                comment: {
                    ...state.comment,
                    children: [
                        {votestatus: null, firstname: thisUser.firstname, profilepic: thisUser.profilepic, created_by: thisUser.user_id, lastname: thisUser.lastname, children: [], body: body, info: state.info, parent_comment_id: comment.commentID, created_at: response.created_at, commentID: response.commentID},
                        ...state.comment.children
                    ]
                }
            });
        });  
    };

    const makeVoteComment = () => {
        if (state.comment.votestatus !== null) {
            deleteCommentVote(parentType, comment.commentID);
            setState({
                ...state,
                comment: {
                    ...state.comment,
                    votestatus: null,
                    totalvote: state.comment.totalvote - 1 
                }
            })
        } else {
            voteComment(parentType, comment.commentID, {voteType: true});
            setState({
                ...state,
                comment: {
                    ...state.comment,
                    votestatus: true,
                    totalvote: state.comment.totalvote ? state.comment.totalvote + 1: 1 
                }
            })
        }
    }

    return (
        <div style={{textAlign:'left', paddingBottom: '10px', position: 'relative'}}>
            <CardHeader
            style={{width: '100%'}}
            avatar = {
              !state.comment.deleted && 
              <UserIcon size={30} user={state.comment}/>
          }
          title={
              <Typography style={{fontSize: 13, fontWeight: 'bold'}}>
                  {
                      !state.comment.deleted ? 
                    `${state.comment.firstname} ${state.comment.lastname}`
                        :
                        '[Deleted]'
                  }
            </Typography>
          }
          subheader={
              <Typography style={{fontSize: 13}}>
                  {timeAgo.format(new Date(state.comment.created_at))}
              </Typography>
          }
          action={
              <div>
                  {
                    (isMod || (thisUser && thisUser.user_id === comment.created_by)) && !view &&
                    <div>
                        <IconButton  onClick={(e) => setState({...state, anchorEl: e.currentTarget})}>
                        <MoreVert style={{fontSize: '20px'}}/>
                        </IconButton>
                    </div>
                      
                  }
           
    
            <Menu   
              id="simple-menu"
              anchorEl={state.anchorEl}
              keepMounted
              open={Boolean(state.anchorEl)}
              onClose={() => setState({...state, anchorEl: null})}
            >
                <MenuItem onClick={() => setState({...state, open: true, anchorEl: null})}>Delete</MenuItem>

              {
                (thisUser && thisUser.user_id === comment.created_by) &&
                <MenuItem onClick={() => setState({...state, editing: true, anchorEl: null})}>Edit</MenuItem>
              }

            </Menu>
            <Dialog
                open={state.open}
                onClose={() => setState({...state, open: false})}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">Delete Comment</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this comment? You cannot recover it.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleDelete} color="primary" autoFocus>
                    Yes
                </Button>
                <Button autoFocus onClick={() => setState({...state, open: false})} color="primary">
                    No
                </Button>
                </DialogActions>
            </Dialog>
              </div>
              
          }
        />
        <CardContent style={{marginTop: '-30px'}}>
            <div style={{marginTop: '3px'}}>
                {
                    !state.comment.deleted ? 
                    
                    (
                        !state.editing ? 
                        <TextField InputProps={{ disableUnderline: true, readOnly: true, style: {fontSize: 14}}} value={state.body} onChange={(e) => setState({...state, body: e.target.value})} style={{width: '100%'}} multiline/>
                        :
                        <span style={{display: 'flex', alignItems: 'center'}}>
                        <OutlinedInput 
                        variant="outlined"
                        value={state.body} 
                        placeholder="Reply..." 
                        onChange={(e) => setState({...state, body: (e.target.value)})} 
                        InputProps={{style: {fontSize: 14}}}
                        style={{width: '100%', marginRight: '10px', borderRadius: '25px'}} 
                        multiline
                        />
                        <IconButton onClick={handleUpdate}>
                            <Done/>
                        </IconButton>
                        <IconButton onClick={() => setState({...state, editing: false,})}>
                            <Close/>
                        </IconButton>
                        </span>
                    )
                    :
                    '[Deleted]'
                }
                
            </div>
        </CardContent>
        <CardActions style={{marginTop: '-25px', marginBottom: '-20px', position: 'relative'}}>
                <div style={{float: 'left'}}>
                        <Chip
                            style={{backgroundColor: state.comment.votestatus ? '#2196f3' : 'whitesmoke'}}
                            label={
                            <span style={{display: 'flex'}}>
                                <IconButton style={{paddingLeft: 0, paddingRight: 0, color: state.comment.votestatus ? 'white' : 'grey'}} onClick={makeVoteComment} >
                                <ThumbUp style={{fontSize: 18}}/>
                                <Typography style={{marginLeft: 3}}>{state.comment.totalvote ? state.comment.totalvote : 0}</Typography>
                                </IconButton>
                            
                            </span>
                            }
                        />        
                        <IconButton aria-label="share" onClick={() => {state.comment.children.length > 0 && setState({...state, expanded: !state.expanded})}}>
                            <Comment style={{transform: 'scaleX(-1)', fontSize: 18}} />
                            <Typography style={{marginLeft: 3}}>{comment.children.length}</Typography>
                        </IconButton> 
                    
                </div>
                <div style={{position: 'absolute', right: 0, bottom: 6}}>   
                    <IconButton onClick={() => setState({...state, replying: !state.replying})}>
                        {
                            state.replying ? 
                            <Close/>
                            :
                            <React.Fragment>
                                <AddComment style={{fontSize: 18, marginRight: 3}}/> 
                            </React.Fragment>
                        }
                        
                    </IconButton>
                </div>
        </CardActions>
        {
            state.replying &&
            <div style={{marginLeft: '30px', marginTop: 12}} >
            <DiscussionCreator
                onSubmit={postComment} 
                user={thisUser}
                isSmall={isSmall}
                shortened
            />
            </div>
        }
        {
            state.expanded &&
            <div container style={{marginTop: 12}} >
               
            {
                state.comment.children.sort(
                    (c1, c2) => (new Date(c2.created_at) - new Date(c1.created_at)) + (c2.upvote - c1.upvote)
                ).slice(0, num).map((c, i) => 
                    <Grid container style={{marginLeft: '20px'}} key={JSON.stringify(c)}>
                        <div style={{marginLeft: '10px'}}>
                        <Divider orientation="vertical" style={{height: '100%', color: 'red', width: '3px'}} flexItem />
                        </div>
                        <div style={{width: '95%'}}>
                        <DiscussionCard
                            comment={c} 
                            parentType={parentType}
                            key={i} 
                            post={post}
                            id={id}
                            thisUser={thisUser}
                            isMod={isMod}
                            isSmall={isSmall}
                            updateComments={updateComments}
                        />
                        </div>
                        
                    </Grid>
                )
            }
        </div>
        }
        {
            comment.children.length > num && state.expanded &&
            <div style={{width: "100%", textAlign: 'center'}}>
            <Button onClick={() => setNum(num + 5)} variant="outlined" style={{borderRadius: '25px', backgroundColor: 'white',  marginTop: '5px'}}>Show More</Button>

            </div>

        }
        
        
        </div>
    )
}
