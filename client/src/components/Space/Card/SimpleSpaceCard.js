import React from 'react';
import UserIcon from '../../User/UserIconOld';
import {Card, CardContent, CardMedia, Typography, CardHeader, Avatar, Chip} from '@material-ui/core';
import {timeAgo} from '../../../utils/dateutils';
import PostIcon from '../../Post/PostIconOld';
import OrganizationIcon from '../SpaceIconOld'
import {sanitizeBody} from '../../../utils/textprocessing';
import { getImage } from '../../../actions/S3Actions';

export default function SimplePostCard(props) {
    const {group} = props;

    if(!group.bannerpic || group.bannerpic === '') {
        group.bannerPic = 'https://placeimg.com/1000/300/nature'
    } else {
        console.log('invoked')
        group.bannerPic = getImage(group.bannerpic);
        console.log('finished')
    }
  
    return (
        <Card>
            <CardMedia
                style={{minHeight: 100}}
                image={group.bannerPic}
            />
            <CardHeader
                title={
                    <Typography variant="h5">
                        {group.name} 
                    </Typography>
                }
            />
            <CardContent 
                style={{
                    marginTop: -30,
                    height: sanitizeBody(group.description, 100).length > 0 ? '' : 0
                }}
            >
            <Typography variant="p">
                {sanitizeBody(group.description, 100)}
            </Typography>
            </CardContent>
        </Card>
    )
}
