import React from 'react'
import {Card, withWidth, Avatar, CardHeader, Typography, CardContent, Menu, MenuItem, Chip, Checkbox, IconButton, DialogActions} from '@material-ui/core';
import PriorityIcon from '../Shared/PriorityIcon';
import {useHistory, useLocation} from 'react-router-dom';
import {sanitizeBody} from '../../utils/textprocessing'
import { MoreVert } from '@material-ui/icons';
import store from '../../Store';
import {getImage} from '../../actions/S3Actions';  
import {AvatarGroup} from '@material-ui/lab'; 
import {timeAgo} from '../../utils/dateutils';

function TaskListItem(props) {
    const {item, onClick, section, length, onComplete, mod, canChange, onAction, end} = props;
    const history = useHistory();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isPostOwner = store.getState().userActions.userInfo && item.post_owner_id && item.post_owner_id === store.getState().userActions.userInfo.user_id;

    return (
       <div 
        style={{
            width: '100%', 
            height: 50,
            border: 'solid', 
            borderBottom: end ? 'solid' : 'none', 
            borderTop: 'solid',
            borderColor: 'lightgrey', 
            borderWidth: 0.1, 
            borderTopColor: 'lightgrey', 
            borderTopWidth: 0.1, 
            borderBottomColor: 'lightgrey', 
            borderBottomWidth: 0.1,
        }}  
        onClick={() => onClick(item)}
       >
           <div style={{display: 'flex', alignItems: 'center', float: 'left'}}>
                <div onClick={(e) => {
                    e.stopPropagation();
                    onComplete(item);
                }}>
                    <Checkbox 
                        checked={item.completed}
                    />
                </div>
                <Typography style={{textAlign: 'left'}} variant="h6">{item.title}</Typography>
                <div>
                    {
                        (mod || isPostOwner) && canChange &&
                        <IconButton onClick={(e) => {e.stopPropagation(); setAnchorEl(e.currentTarget)}}>
                            <MoreVert/>
                        </IconButton>
                    }
                   
                    <Menu   
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={(e) => {e.stopPropagation(); setAnchorEl(null)}}
                    >
                    {
                        (mod || isPostOwner) &&
                        <MenuItem onClick={(e) => {e.stopPropagation(); setAnchorEl(null); onAction(item, 'deletePost')}} >Delete Task</MenuItem>
                    }
                    {
                        
                        (mod || isPostOwner) &&
                        <MenuItem onClick={(e) => {e.stopPropagation(); setAnchorEl(null); onAction({...item, section_id: section}, 'editPost')}} >View Task</MenuItem>
                        
                    }
                    </Menu>
                </div>
           </div>
           <div style={{float: 'right', display: 'flex', alignItems: 'center', height: '100%'}}>
                <div style={{height: '100%', width: 100, borderLeft: 'solid', borderColor: 'lightgrey', borderWidth: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {
                        item.users && 
                        item.users.filter(u => u.type === 'Assignee').map(
                            (e, i) => 
                                <Avatar key={i} src={getImage(e.profilepic)} onClick={() => history.push(`/profile/${e.user_id}`)}> 
                                    {(e.firstname + " " + e.lastname).split(" ").map((n)=>n[0])}
                                </Avatar>
                        )
                        
                    }
                </div>
                <div style={{height: '100%', width: 100, borderLeft: 'solid', borderColor: 'lightgrey', borderWidth: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography>
                        {item.due_date && <Typography>{(new Date(item.due_date)).toLocaleDateString('en-us')}</Typography>}
                    </Typography>
                </div>
                <div style={{height: '100%', width: 100, borderLeft: 'solid', borderColor: 'lightgrey', borderWidth: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {item.priority && <PriorityIcon level={item.priority ? item.priority : 0}/>}
                </div>
            </div>
                
        </div>
        
    )
}

export default withWidth()(TaskListItem);