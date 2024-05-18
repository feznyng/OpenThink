import React, { useState } from 'react'
import { Avatar, ButtonGroup, Card, CardActions, CardContent, CardHeader, Divider, IconButton, IconButtonProps, Tooltip } from '@material-ui/core'
import { useFragment, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import {TypographyProps} from '@material-ui/core'
import { useHistory, useParams } from 'react-router';
import Editor from './Editor/PostTipTap';
import { ArrowDownward, ArrowUpward, Favorite, KeyboardArrowDown, KeyboardArrowUp, ThumbDown, ThumbUp } from '@material-ui/icons';
import Typography from '../Shared/Typography';
import Button from '../Shared/Button';
import { makeStyles } from '@material-ui/styles';
import ReactionMenu from '../Reactions/ReactionMenu';
import PreviewCardWrapper from '../Shared/PreviewCardWrapper';
import { primaryColor } from '../../theme'
import commitDeletePostVote from '../../mutations/DeletePostVote';
import commitVotePost from '../../mutations/VotePost';
import commitAddReaction from '../../mutations/AddReaction';
import { PostVoteButtonQuery } from './__generated__/PostVoteButtonQuery.graphql'
interface PostVoteButtonProps {
    post: any,
    style?: React.CSSProperties,
    connectionId: string,
    orientation?: 'vertical' | 'horizontal',
    disableReactions?: boolean,
    buttonProps?: Partial<IconButtonProps>
}

interface PostVoteButtonState {
    onClose: null | (() => void)
}

export default function PostVoteButton({post, connectionId, orientation, disableReactions, buttonProps, ...props}: PostVoteButtonProps) {
    const {postId, voteValue, myVote, sp} = useFragment(
        graphql`
            fragment PostVoteButtonFragment on Post {
                postId
                numUpvotes
                numDownvotes
                voteValue
                myVote {
                    vote
                    postVoteId
                }
                reactions(first: $reactionCount, after: $reactionCursor){
                    __id
                    edges {
                        node {
                            id
                            ...ReactionChipFragment
                        }
                    }
                }
                sp: spacePost {
                    spaceId
                }
            }
        `,
        post
    )

    const {me} = useLazyLoadQuery<PostVoteButtonQuery>(
        graphql`
            query PostVoteButtonQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )
    
    orientation = orientation ? orientation : 'horizontal'

    const {spaceID} = useParams<any>()
    const spaceId = spaceID ? parseInt(spaceID) : sp.spaceId

    const [state, setState] = React.useState<PostVoteButtonState>({
        onClose: null
    })

    const upvoted = myVote && myVote.postVoteId && myVote.vote > 0
    const downvoted = myVote && myVote.postVoteId && myVote.vote < 0
    const history = useHistory()
    const upvote = () => {
        if (!me?.userId) {
            history.push('/signup')
            return
        }
        if (upvoted) {
            // delete vote
            commitDeletePostVote(myVote.postVoteId)
        } else {
            // create or change vote
            commitVotePost(postId, spaceId, true)
        }
    }

    const downvote = () => {
        if (!me?.userId) {
            history.push('/signup')
            return
        }
        if (downvoted) {
            // delete vote
            commitDeletePostVote(myVote.postVoteId)
        } else {
            // create or change vote
            commitVotePost(postId, spaceId, false)
        }
    }

    const onSelect = ({emoji, name}: {emoji: string, name: string}) => {
        if (connectionId) {
            console.log(spaceId)
            commitAddReaction(postId, spaceId, emoji, name, 'post', [connectionId])
            
        } else {
            console.log('error with reaction, connectionId is null')
        }
        state.onClose && state.onClose()
    }

    return (
        <React.Fragment>
            <PreviewCardWrapper
                previewCard={
                    <ReactionMenu
                        onSelect={onSelect}
                    />
                }
                disabled={disableReactions}
                fallback={<div/>}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                delay={1000}
                onClose={(onClose: any) => setState({...state, onClose})}
            >
                <span 
                    {...props} 
                    style={{
                        ...props.style,
                        display: orientation === 'horizontal' ? 'flex' : undefined, 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Tooltip title="Upvote">
                        <span>
                            <IconButton
                                {...buttonProps}
                                color={upvoted ? "primary" : 'inherit'}
                                onClick={upvote}
                                style={{...buttonProps?.style,  ...(orientation === 'horizontal' ? {paddingTop: 8, paddingBottom: 8, borderStartEndRadius: 0, borderEndEndRadius: 0} : {borderBottomRightRadius: 0, borderBottomLeftRadius: 0})}}
                            >
                                <ArrowUpward fontSize='small'/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <span style={{display: 'flex', justifyContent: 'center',}}>
                        <span style={{marginLeft: 5, marginRight: 5, fontWeight: 'bold', color: upvoted ? primaryColor : (downvoted ? 'red' : undefined)}}>
                            {voteValue ? voteValue : 0}
                        </span>
                    </span>
                    <Tooltip title="Downvote">
                        <span>
                            <IconButton
                                {...buttonProps}
                                onClick={downvote}
                                style={{...buttonProps?.style, color: downvoted ? "red" : 'inherit', ...(orientation === 'horizontal' ? {paddingTop: 8, paddingBottom: 8, borderStartStartRadius: 0, borderEndStartRadius: 0} : {borderTopLeftRadius: 0, borderTopRightRadius: 0}), }}
                            >
                                <ArrowDownward fontSize='small'/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </span>
            </PreviewCardWrapper>
        </React.Fragment>
    )
}
