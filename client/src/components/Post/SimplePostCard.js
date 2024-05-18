import React from 'react';
import UserIcon from '../User/UserIconOld';
import { Card, CardHeader, Typography, IconButton, CardContent } from '@material-ui/core';
import {timeAgo} from '../../utils/dateutils';
import PostIcon from './PostIconOld';
import {sanitizeBody} from '../../utils/textprocessing'
export default function SimplePostCard(props) {
    const {post} = props;
    return (
        <Card>
            <CardHeader
                avatar={
                    <UserIcon size={35} user={{profilepic: post.profilepic, firstname: post.firstname, lastname: post.lastname}}/>
                }
                title={
                    !post.original_deleted ?
                    <div>
                        <Typography style={{textAlign:'left', fontSize: 14, fontWeight: 'bold', marginLeft: -5, width: 200}}>
                            {post.anonymous ? 'Anonymous' : `${post.firstname} ${post.lastname}  `} 
                        </Typography>
                    </div>
                    
                    :
                    <Typography style={{textAlign:'left', fontSize: 14, marginLeft: -5}}>[Deleted]</Typography>
                }
                subheader={
                    !post.original_deleted ?
                      <Typography style={{textAlign:'left', fontSize: 14, marginLeft: -5}} >
                        {timeAgo.format(new Date(post.created_at))}
                      </Typography>
                    :
                    <Typography style={{textAlign:'left', fontSize: 14, marginLeft: -5}} >[Deleted]</Typography>
      
                }
            />
            <CardContent style={{display: 'flex', marginTop: -10, marginBottom: -10}}>
                <span style={{marginRight: 5}} >
                    <PostIcon post={post} size={30}/>
                </span>
                <Typography variant="h6" style={{textAlign: 'left'}}>{post.title.replace(/\\"/g,"'")}</Typography>
            </CardContent>
            <CardContent 
                style={
                    {
                        height: sanitizeBody(post.body, 100).length > 0 ? '' : 0
                    }
                }
            >
            <Typography variant="p">
                {sanitizeBody(post.body, 100)}
            </Typography>
            </CardContent>
        </Card>
    )
}
