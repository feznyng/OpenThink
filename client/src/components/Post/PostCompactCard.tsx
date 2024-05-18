import React, { CSSProperties } from 'react';
import { useFragment, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { Card, CardActionArea } from '@material-ui/core';
import PostCardHeader from './PostCardHeader';
import PostVoteButton from './PostVoteButton';
import { PostLocation } from './PostCard';

interface PostCompactCardProps {
    post: any,
    connectionId: string,
    style?: CSSProperties,
    simple?: boolean,
    parentPostId?: number | null,
    location: PostLocation,
    disabledActions?: string[]
}

export default function PostCompactCard({post, simple, connectionId, style, ...props}: PostCompactCardProps) {
    const {postId, type, ...data} = useFragment(
        graphql`
            fragment PostCompactCardFragment on Post {
                postId
                type
                ...PostCardHeaderFragment
                ...PostVoteButtonFragment
            }
        `,
        post
    )

    return (
        <Card style={{...style, boxShadow: 'none', borderRadius: 0, borderBottom: 'none', ...(simple ? {borderLeft: 'none', borderRight: 'none', backgroundColor: 'transparent'} : {})}} variant="outlined">
            <CardActionArea>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    {
                        !simple && 
                        <div style={{marginLeft: 10}}>
                            <PostVoteButton
                                post={data}
                                connectionId={''}
                                orientation={'vertical'}
                                disableReactions
                                buttonProps={{size: 'small'}}
                            /> 
                        </div>
                    }
                
                    <PostCardHeader
                        post={data}
                        style={{width: '100%', height: simple ? 45 : undefined}}
                        titleTypographyProps={{
                            variant: 'h6',
                            style: {fontSize: 15},
                            clickable: false
                        }}
                        postIconProps={{
                            size: 30
                        }}
                        simple={simple}
                        {...props}
                    />
                </div>
            </CardActionArea>
        </Card>
    )
}
