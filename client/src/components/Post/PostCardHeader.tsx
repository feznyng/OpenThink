import React, { CSSProperties, Suspense, useState } from 'react'
import { Avatar, Card, CardHeader, CardHeaderProps, Chip, CircularProgress, Divider, IconButton, Menu, Tooltip } from '@material-ui/core'
import { useFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import PostIcon, { PostIconProps } from './PostIcon';
import UserIcon from '../User/UserIcon';
import Typography, { CustomTypographyProps } from '../Shared/Typography';
import {TypographyProps} from '@material-ui/core'
import { useHistory, useParams } from 'react-router';
import PostMoreActions, { PostMoreActionsProps } from './PostMoreActions';
import { getLocalTime, timeAgo } from '../../utils/dateutils';
import { PostCardHeaderFragment$key } from './__generated__/PostCardHeaderFragment.graphql';
import PostMoreActionsButton from './PostMoreActionsButton';
import Link from '../Shared/Link';
import PinIcon from '../Shared/PinIcon';
import SpaceIcon from '../Space/SpaceIcon';
import SpacePreview from '../Space/SpacePreviewButton';
import BulletDelimiter from '../Shared/BulletDelimiter'
import PostSubheader from './PostSubheader';

export interface PostCardHeaderProps {
    post: any,
    style?: CSSProperties,
    postIconProps?: Partial<PostIconProps>,
    simple?: boolean,
    titleTypographyProps?: CustomTypographyProps,
    postMoreActionsProps?: Partial<PostMoreActionsProps>,
}

const typographyProps: TypographyProps = {variant: "subtitle2"}

export default function PostCardHeader({post, postIconProps, simple, postMoreActionsProps, ...props}: PostCardHeaderProps & Partial<CardHeaderProps>) {
    const {postId, title, spacePost, parentRelation, type, startDate, createdAt, spaceAuthor, delta, author, spaces, deleted, ...data} = useFragment<PostCardHeaderFragment$key>(
        graphql`
            fragment PostCardHeaderFragment on Post {
                ...PostIconFragment
                ...PostMoreActionsButtonFragment
                postId
                title
                type
                startDate
                deleted
                delta
                createdAt
                author {
                    userId
                    firstname
                    lastname
                    ...UserIconFragment
                }
                spaces(first: 1) {
                    edges {
                        node {
                            spaceId
                            ...SpacePreviewButtonFragment
                        }
                    }
                }
                spaceAuthor(spaceId: $spaceId) {
                    type
                }
                deleted
                spacePost(spaceId: $spaceId) {
                    id
                    spacePostId
                    pinned
                }
                parentRelation {
                    relationId
                    pinned
                }
                ...PostSubheaderFragment
            }
        `,
        post
    )
    
    const postSpaces = spaces?.edges?.map((e: any) => e.node)
    const showSpaces = postMoreActionsProps?.location === 'dashboard'
    const {spaceID} = useParams<any>()
    const link = (spaceID || !postSpaces || postSpaces.length === 0 || !postSpaces[0]) ? `/space/${spaceID}/post/${postId}` : `/space/${postSpaces!![0]?.spaceId}/post/${postId}`
    const createdDate = new Date(createdAt!!)
    return (
        <div>
            {
                <div style={{position: 'relative'}}>
                    {
                        showSpaces && !deleted && postSpaces && 
                        <div style={{paddingLeft: 12, paddingTop: 5}}>
                            {
                                postSpaces.map(({spaceId, ...space}) => (
                                    <Link
                                        to={`/space/${spaceId}`}
                                    >
                                        <SpacePreview
                                            space={space}
                                            size="small"
                                        />
                                    </Link>
                                ))
                            }

                        </div>
                    }
                    {
                        !deleted && ((spacePost && spacePost.pinned) || (parentRelation && parentRelation.pinned)) && 
                        <div style={{paddingLeft: 12, paddingTop: 10}}>
                            <PinIcon style={{color: '#75D377', marginRight: 5, fontSize: 20}}/> 
                            <Typography variant="caption">
                                Pinned
                            </Typography>
                        </div>
                    }
                    
                </div>
            }
            <CardHeader
                avatar={
                    <div style={{position: 'relative', marginLeft: -5}}>
                        {type && <PostIcon size={50} {...postIconProps} type={type} post={data}/>}
                    </div>
                }
                title={
                    <Link
                        to={link}
                        typographyProps={{
                            variant: "h6",
                            ...props.titleTypographyProps
                        }}
                    >
                        {title}
                    </Link>
                }
                disableTypography
                subheader={
                    <PostSubheader
                        style={{marginTop: 2}}
                        post={data}
                    />
                }
                action={
                    !deleted && !simple && 
                    <span style={{display: 'flex', alignItems: 'center', marginTop: 3, paddingLeft: 5}}>
                        <PostMoreActionsButton
                            post={data}
                            postMoreActionsProps={postMoreActionsProps}
                        />
                    </span>
                }
                style={{marginTop: -5}}
            />
        </div>
    )
}
