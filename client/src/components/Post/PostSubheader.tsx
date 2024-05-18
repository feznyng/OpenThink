import React, { CSSProperties, Suspense, useState } from 'react'
import { Avatar, Card, CardHeader, CardHeaderProps, Chip, CircularProgress, IconButton, Menu, Tooltip } from '@material-ui/core'
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

const typographyProps: TypographyProps = {variant: "subtitle2"}

interface PostSubheaderProps {
    post: any,
    extendedDate?: boolean,
    style?: CSSProperties
}

export default function PostSubheader({post, style, extendedDate}: PostSubheaderProps) {
    const { author, deleted, spaceAuthor, createdAt } = useFragment(
        graphql`
            fragment PostSubheaderFragment on Post {
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
                createdAt
            }
        `,
        post
    )

    const createdDate = new Date(createdAt!!)
    
    return (
        <span style={{...style, display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
            <Link
                to={`/profile/${author?.userId}`}
            >
                <span style={{display: 'flex', alignItems: 'center'}}>
                    <UserIcon user={author} size={25} style={{marginRight: 5, ...typographyProps.style}}/>
                    <Typography 
                        {...typographyProps} 
                        style={{marginRight: 3, ...typographyProps.style, whiteSpace: 'nowrap'}}
                    >
                        {
                            deleted ?
                            '[Deleted]'
                            :
                            `${author?.firstname} ${author?.lastname}`
                        }
                    </Typography>
                </span>
            </Link>
            {
                spaceAuthor?.type && 
                <React.Fragment>
                    <BulletDelimiter style={{marginRight: 5}}/>
                    <Chip
                        size="small"
                        label={spaceAuthor.type !== 'Creator' ? spaceAuthor.type : 'Moderator'}
                        style={{marginRight: 5}}
                        color="primary"
                        variant="outlined"
                    />
                </React.Fragment>
            }
            <BulletDelimiter style={{marginRight: 5}}/>
            <Tooltip 
                title={`${createdDate.toLocaleTimeString('en-us')} ${createdDate.toLocaleDateString('en-us')}`}
                placement="right"
            >
                <span>
                    <Typography 
                        {...typographyProps} 
                        style={{marginRight: 5, ...typographyProps.style, whiteSpace: 'nowrap'}}
                    >
                        {timeAgo.format(createdDate, extendedDate ? undefined : 'mini')}
                    </Typography>
                </span>
            </Tooltip>
        </span>
    )
}
