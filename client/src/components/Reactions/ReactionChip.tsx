import React from 'react'
import { useFragment, useLazyLoadQuery } from 'react-relay'
import graphql from 'babel-plugin-relay/macro';
import { ChipProps } from '@material-ui/core';
import Typography from '../Shared/Typography';
import { ReactionChipQuery } from './__generated__/ReactionChipQuery.graphql';
import EmojiChip from './EmojiChip'
import commitDeleteReaction from '../../mutations/DeleteReaction';
import commitAddReaction from '../../mutations/AddReaction';

interface ReactionChipProps {
    reaction: any,
    connectionId: string | undefined
}

export default function ReactionChip({reaction, connectionId, ...props}: ReactionChipProps & Partial<ChipProps>) {
    const {emoji, name, postId, messageId, spaceId, reactionId, count, createdBy, vote, voteValue} = useFragment(
        graphql`
            fragment ReactionChipFragment on Reaction {
                emoji
                name
                postId
                messageId
                spaceId
                count
                createdBy
                reactionId
            }
        `,
        reaction
    )

    const {me} = useLazyLoadQuery<ReactionChipQuery>(
        graphql`
            query ReactionChipQuery {
                me {
                    userId
                }
            }
        `,
        {}
    )

    const currUserSelected = createdBy === me?.userId

    const toggleReaction = () => {
        if (currUserSelected) {
            commitDeleteReaction(reactionId, connectionId ? [connectionId] : [])
        } else {
            commitAddReaction(postId ? postId : messageId, spaceId, emoji, name, messageId ? 'message' : 'post', connectionId ? [connectionId] : [])
        }
    }


    return (
        <EmojiChip
            {...props}
            icon={
                <Typography>
                    {emoji}
                </Typography>
            }
            onClick={toggleReaction}
            label={count ? count : 0}
            color={currUserSelected ? 'primary' : 'default'}
        />
    )
}