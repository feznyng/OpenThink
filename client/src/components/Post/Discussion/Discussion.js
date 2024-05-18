import React from 'react'
import DiscussionCard from './DiscussionCard';
import UserIcon from '../../User/UserIconOld';
import {Typography, Divider, Card, CardContent, FilledInput, Button, CardActions, OutlinedInput} from '@material-ui/core';
import {createComment} from '../../../actions/commentActions';
import {createNotification} from '../../../actions/notificationActions';
import DiscussionCreator from './DiscussionCreator';
import {Add, LocalConvenienceStoreOutlined} from '@material-ui/icons';
import store from '../../../Store';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useSelector } from 'react-redux';

export default function Discussion(props) {
    const {comments, post, id, parentType, parent, view, loading, updateComments} = props;
    const makeForest = (commentID, xs) => 
        xs.filter (({parent_comment_id}) => parent_comment_id == commentID)
        .map (({commentID, parent, ...rest}) => ({commentID, ...rest, children: makeForest (commentID, xs)}));    
    const [state, setState] = React.useState({
        info: null,
        comments: [],
        replying: false,
    });

    const [num, setNum] = React.useState(20);
    const [open, setOpen] = React.useState(20);

    const sortComments = (c1, c2) => {
        const voteDiff = (c2.upvote - c1.upvote)
        if (voteDiff === 0) {
            return (new Date(c2.created_at) - new Date(c1.created_at));
        } else {
            return voteDiff;
        }
    }
    
    React.useEffect(() => {
        setNum(5);
        setState({
            ...state,
            comments: view ? 
            comments.map((c) => {return {...c, commentID: c.space_comment_id ? c.space_comment_id : c.project_comment_id}}).sort((c1, c2) => new Date(c1.created_at) - new Date(c2.created_at))
            : 
            makeForest(null, comments.map((c) => {return {...c, commentID: c.comment_id}})).sort(sortComments) 
        })
    }, [comments]);
    
    React.useEffect(() => {
        setNum(5);
    }, [state.comments])

    const thisUser = store.getState().userActions.userInfo;
    const parentUser = parent && parent.users ? parent.users.find(e => e.user_id === thisUser.user_id) : undefined;

    const isMod = parentUser && (parentUser.type === 'Lead' || parentUser.type === 'Creator');

    const postComment = (body) => {
        updateComments('create');
        createComment(parentType, id, post.original_post_id, {body: body, info: state.info}).then((response) => {
            
            console.log(state.comments[state.comments.length - 1])
            setState({
                ...state,
                info: null,
                comments: [
                    {
                        ...response,
                        firstname: thisUser.firstname, 
                        profilepic: thisUser.profilepic, 
                        created_by: thisUser.user_id, 
                        lastname: thisUser.lastname, 
                        children: [], 
                        body: body, 
                        info: state.info, 
                        created_at: new Date(), 
                        
                        votestatus: null,
                    },
                    ...state.comments,
                ]
            });
            const currUser = store.getState().userActions.userInfo.user_id;
            post.users && post.users.forEach(u => {
                console.log(u)
                if (u.comments && u.user_id !== currUser) {
                    console.log('yep')
                    createNotification(u.user_id, {
                        type: 'postComment',
                        read: false,
                        user_id: u.user_id,
                        post_id: post.post_id, 
                        project: parent.project_id ? true : false,
                        space: parent.space_id ? true : false
                    });
                }
            })
        });
        
    }

    return (
        <div>
            {
                loading &&
                <div style={{marginTop: '10px'}}>
                    <CircularProgress/>
                </div>
                
            }
            {
                !loading &&
                <div style={{textAlign:'left', width: '100%'}}>
                    <DiscussionCreator isSmall={false} onSubmit={postComment} user={thisUser}/>
                </div>
            }
            
            {
                !loading && state.comments &&
                state.comments.slice(0, num).map((c, i) => 
                <div style={{marginBottom: '1px', textDecoration: 'none', color: 'black', border: 'solid', borderWidth: 1, borderColor: 'lightgrey', borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
                    <DiscussionCard  
                    view={view}
                    comment={{...c, commentID: c.commentID ? c.commentID : (c.space_comment_id ? c.space_comment_id : c.project_comment_id)}} 
                    parentType={parentType}
                    key={JSON.stringify(c)} 
                    post={post}
                    id={id}
                    parent={post}
                    thisUser={thisUser}
                    isMod={isMod}
                    updateComments={updateComments}
                    isSmall={false}
                    isRoot/>
                </div>
            )  
            }
            {
                !loading && state.comments.length > num &&
                <Button onClick={() => setNum(num + 5)} variant="outlined" style={{borderRadius: '25px', backgroundColor: 'white', marginTop: '5px'}}>Show More</Button>

            }
            
        </div>
    )
}
