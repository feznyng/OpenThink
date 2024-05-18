import React, { Suspense } from 'react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import Subtasks from '../Task/Subtasks';
import graphql from 'babel-plugin-relay/macro';
import { Entry } from '../../types/database';
import { useHistory, useParams } from 'react-router';
import { SubtaskFeatureQuery } from './__generated__/SubtaskFeatureQuery.graphql';
import { CircularProgress } from '@material-ui/core';

interface SubtaskFeatureProps {
    data: any
}

export default function SubtaskFeature({data}: SubtaskFeatureProps) {
    const {postId, spacePost} = useFragment(
        graphql`
            fragment SubtaskFeatureFragment on Post {
                postId
                spacePost(spaceId: $spaceId) {
                    spaceId
                }
            }
        `,
        data
    )

    const {spaceID} = useParams<any>()
    const spaceId = spacePost.spaceId ? spacePost.spaceId : parseInt(spaceID)

    const {post, space} = useLazyLoadQuery<SubtaskFeatureQuery>(
        graphql`
            query SubtaskFeatureQuery($postId: ID!, $spaceId: Int, $taskCount: Int!, $taskCursor: String) {
                post(postId: $postId) {
                    ...SubtasksFragment
                }
                space(spaceId: $spaceId) {
                    permissions {
                        canPost
                        canEditTasks
                    }
                }
            }
        `,
        {postId: postId.toString(), spaceId, taskCount: 10}
    )

    const permissions = space?.permissions

    const history = useHistory()

    return (
        <Suspense fallback={<div style={{width: '100%', display: 'flex', justifyContent: 'center'}}><CircularProgress/></div>}>
            <Subtasks
                post={post}
                addButtonProps={{
                    variant: 'text'
                }}
                editable={!!((permissions?.canEditTasks) || permissions?.canPost?.includes("Task"))}
                openEntry={({id}: Entry) => spacePost && history.push(`/space/${spacePost.spaceID}/post/${id}`)}
            />
        </Suspense>
    )
    
}
